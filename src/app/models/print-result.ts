/** A downloaded print: the file plus what the API reported about it. */
export interface PrintResult {
  blob: Blob;
  fileName: string;
  rows: number | null;
}
