/**
 * A day typed by hand in a date field, in any of the forms people use: 01/01/2025, 1.1.2025, 1-1-2025 (day first,
 * as the lists show it) or 2025-01-01 (ISO, as the API stores it). Returns local midnight, or null when the text is
 * not a real day (31/02/2025, 2025-13-01, free text).
 */
export function parseTypedDay(text: string | null | undefined): Date | null {
    const typed = (text ?? '').trim();
    if (!typed) {
        return null;
    }
    const iso = typed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const dayFirst = typed.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    const [year, month, day] = iso ? [+iso[1], +iso[2], +iso[3]]
        : dayFirst ? [+dayFirst[3], +dayFirst[2], +dayFirst[1]]
            : [NaN, NaN, NaN];
    if (Number.isNaN(year)) {
        return null;
    }
    const date = new Date(year, month - 1, day);
    // new Date(2025, 1, 31) rolls over to March: only a day that stays itself is real
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
