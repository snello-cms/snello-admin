/** A file the action button uploads (multipart field {@link name}). */
export interface ActionButtonFile {
    /** multipart field name, e.g. "front" */
    name: string;
    /** shown next to the file picker, e.g. "Front" */
    label?: string;
    required?: boolean;
    /** input accept attribute; default images and PDF */
    accept?: string;
}
