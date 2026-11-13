/** One table turned into a metadata + fielddefinitions preview (snello-api IntrospectedEntity). */
export interface IntrospectedEntity {
    table_name: string;
    skipped: boolean;
    skip_reason: string | null;
    /** flat metadatas row, null when skipped */
    metadata: Record<string, any> | null;
    /** flat fielddefinitions rows */
    fields: Record<string, any>[];
    warnings: string[];
}
