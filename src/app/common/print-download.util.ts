import {PrintResult} from '../models/print-result';

/** PDF and HTML open in a new tab; CSV and XLSX download. */
export function showPrint(result: PrintResult): void {
    const url = URL.createObjectURL(result.blob);
    const type = result.blob.type || '';
    if (type.startsWith('application/pdf') || type.startsWith('text/html')) {
        window.open(url, '_blank');
    } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        a.click();
    }
    // give the new tab / download time to read the blob
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
