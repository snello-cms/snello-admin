/**
 * After a prefill, find a row of another table and put it into a (join) field.
 *
 * Example: the scan answers birth_cadastral_code = H501; find the comune with cadastral_code = H501 and select it in
 * birth_city; then follow that comune's province into birth_province:
 * <pre>
 * {"value": "/hints/birth_cadastral_code", "table": "comuni", "by": "cadastral_code", "into": "birth_city"}
 * {"value": "@birth_city.province", "table": "province", "by": "uuid",           "into": "birth_province"}
 * </pre>
 */
export interface ActionButtonLookup {
    /**
     * where the value comes from:
     * - "key": a key of the result object
     * - "/path/in/answer": anywhere in the whole answer, e.g. "/hints/nationality"
     * - "@field.column": a column of the row already selected in a form field
     */
    value: string;
    /** table to search */
    table: string;
    /** column of {@link table} that must equal the value */
    by: string;
    /** form field that receives the row (join) or, for a plain field, the row's {@link column} */
    into: string;
    /** for a plain (non join) field: which column of the row to copy; default the table key "uuid" */
    column?: string;
    /** true = finding nothing is normal (e.g. the "born abroad" lookup for someone born in Italy): no warning */
    optional?: boolean;
}
