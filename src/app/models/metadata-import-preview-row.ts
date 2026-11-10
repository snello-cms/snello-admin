export interface MetadataImportPreviewRow {
    tableName: string;
    fieldsCount: number;
    /** rows carried by the file for this table, null when the file has no data for it */
    dataCount: number | null;
}
