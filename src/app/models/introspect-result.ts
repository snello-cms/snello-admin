import {IntrospectedEntity} from './introspected-entity';

/** Outcome of POST /api/introspect/preview|apply (snello-api IntrospectResult). */
export interface IntrospectResult {
    /** no blocking errors; skipped tables are warnings */
    valid: boolean;
    errors: string[];
    warnings: string[];
    entities: IntrospectedEntity[];
    /** rows were persisted (apply only) */
    applied: boolean;
}
