import {FieldDefinition} from '../models/field-definition';
import {Metadata} from '../models/metadata';

/**
 * Since snello-api e836a07 the datalist endpoints return facet compositions instead of flat rows:
 *
 *   GET /api/datalist/metadata/{name}                  -> { identity, query, ui, ai, conditions, fields }
 *   GET /api/datalist/metadata/{name}/fielddefinitions -> [{ uuid, name, metadata_*, query, ui, ai }]
 *
 * Every flat property the SPA uses still exists, unchanged, inside one facet. These helpers lift them back to the
 * top level so FieldDefinition / Metadata consumers (list columns, forms, wizard) keep working. Flat payloads (older
 * APIs, admin CRUD endpoints) pass through untouched.
 */

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Shallow-merges the given facets onto the top level; the top level wins for identity keys (uuid, name, ...). */
function liftFacets(raw: Json, facets: string[]): Json {
    const out: Json = {};
    for (const facet of facets) {
        const value = raw[facet];
        if (isObject(value)) {
            Object.assign(out, value);
        }
    }
    for (const [key, value] of Object.entries(raw)) {
        if (!facets.includes(key)) {
            out[key] = value;
        }
    }
    return out;
}

const hasFacets = (raw: Json, facets: string[]): boolean => facets.some(f => isObject(raw[f]));

const FIELD_FACETS = ['query', 'ui', 'ai'];
const ENTITY_FACETS = ['identity', 'query', 'ui', 'ai'];

export function toFieldDefinition(raw: unknown): FieldDefinition {
    if (!isObject(raw) || !hasFacets(raw, FIELD_FACETS)) {
        return raw as FieldDefinition;
    }
    return liftFacets(raw, FIELD_FACETS) as unknown as FieldDefinition;
}

export function toFieldDefinitions(raw: unknown): FieldDefinition[] {
    return Array.isArray(raw) ? raw.map(toFieldDefinition) : [];
}

export function toMetadata(raw: unknown): Metadata | null {
    if (!isObject(raw)) {
        return null;
    }
    if (!hasFacets(raw, ENTITY_FACETS)) {
        return raw as unknown as Metadata;
    }
    const flat = liftFacets(raw, ENTITY_FACETS);
    if (Array.isArray(raw['fields'])) {
        flat['fields'] = toFieldDefinitions(raw['fields']);
    }
    return flat as unknown as Metadata;
}
