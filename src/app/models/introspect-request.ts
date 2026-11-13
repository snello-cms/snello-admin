/** Body of POST /api/introspect/preview|apply (snello-api IntrospectRequest). */
export interface IntrospectRequest {
    /** lowercase table names; empty = every user table not yet described by a metadata */
    tables?: string[];
    /** rows sampled per table for the HTML / long-text heuristics (server default 30, max 200) */
    sample_rows?: number;
    metadata_group?: string;
}
