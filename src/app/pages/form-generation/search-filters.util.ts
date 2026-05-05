import {FieldDefinition} from '../../models/field-definition';

function toDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

function formatLocalDate(value: unknown): string {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLocalTime(value: unknown): string {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatLocalDateTime(value: unknown): string {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const timezoneOffsetMinutes = -date.getTimezoneOffset();
    const sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
    const absoluteOffsetMinutes = Math.abs(timezoneOffsetMinutes);
    const offsetHours = pad(Math.floor(absoluteOffsetMinutes / 60));
    const offsetMinutes = pad(absoluteOffsetMinutes % 60);

    return `${formatLocalDate(date)}T${formatLocalTime(date)}${sign}${offsetHours}:${offsetMinutes}`;
}

function normalizeSearchValue(field: FieldDefinition, rawValue: unknown): unknown {
    if (!(rawValue instanceof Date)) {
        return rawValue;
    }

    if (field.type === 'date') {
        return formatLocalDate(rawValue);
    }

    if (field.type === 'datetime') {
        return formatLocalDateTime(rawValue);
    }

    if (field.type === 'time') {
        return formatLocalTime(rawValue);
    }

    return rawValue;
}

export function isPassivationSearchField(field: FieldDefinition): boolean {
    return field.type === 'checkbox' && field.input_type === 'passivation';
}

export function applySearchFormValues(
    searchFields: FieldDefinition[],
    formValue?: Record<string, unknown>
): void {
    if (!formValue) {
        return;
    }

    const objToSearch = JSON.parse(JSON.stringify(formValue)) as Record<string, unknown>;
    for (const key in objToSearch) {
        if (!Object.prototype.hasOwnProperty.call(objToSearch, key)) {
            continue;
        }

        for (const field of searchFields) {
            if (field.name !== key) {
                continue;
            }

            if (isPassivationSearchField(field)) {
                field.value = true;
                continue;
            }

            const rawValue = objToSearch[field.name];
            const normalizedValue = normalizeSearchValue(field, rawValue);
            if (field.type === 'join' && field.join_table_key != null && rawValue != null && rawValue !== '') {
                field.value = typeof rawValue === 'object'
                    ? (rawValue as Record<string, unknown>)[field.join_table_key]
                    : rawValue;
                continue;
            }

            if (field.type === 'multijoin') {
                if (Array.isArray(rawValue)) {
                    const values = rawValue
                        .map(value => typeof value === 'object' && value != null && field.join_table_key
                            ? (value as Record<string, unknown>)[field.join_table_key]
                            : value)
                        .filter(value => value != null && value !== '');
                    field.value = values.join(',');
                } else {
                    field.value = rawValue;
                }
                continue;
            }

            field.value = normalizedValue;
        }
    }
}

export function buildSearchFieldDefinitions(fields: FieldDefinition[]): FieldDefinition[] {
    const searchFields: FieldDefinition[] = [];

    for (const field of fields) {
        if (!field.searchable) {
            continue;
        }

        if (field.search_condition === 'range' && (field.type === 'date' || field.type === 'datetime')) {
            const baseName = field.name ?? '';
            const baseLabel = field.label || field.name || '';

            searchFields.push({
                ...field,
                name: `${baseName}__min`,
                label: `${baseLabel} min`,
                search_condition: 'gte',
                search_field_name: `${baseName}_gte`,
                value: undefined
            });
            searchFields.push({
                ...field,
                name: `${baseName}__max`,
                label: `${baseLabel} max`,
                search_condition: 'lte',
                search_field_name: `${baseName}_lte`,
                value: undefined
            });
            continue;
        }

        searchFields.push(field);
    }

    return searchFields;
}