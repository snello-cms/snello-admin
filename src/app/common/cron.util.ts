import {CronExpressionParser} from 'cron-parser';

export function getDatesInRange(cronExpression: string, start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const normalizedExpression = cronExpression.trim();

    if (!normalizedExpression) {
        return dates;
    }

    try {
        const interval = CronExpressionParser.parse(normalizedExpression, {
            currentDate: start,
            startDate: start,
            endDate: end
        });

        while (interval.hasNext()) {
            dates.push(interval.next().toDate());
        }
    } catch {
        return [];
    }

    return dates;
}