import { AppError } from './app-error.js';

export function parseDateStart(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest('Invalid dateFrom');
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function parseDateEnd(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest('Invalid dateTo');
  }
  date.setHours(23, 59, 59, 999);
  return date;
}

export function resolveReportDateRange(dateFrom?: string, dateTo?: string) {
  const end = dateTo ? parseDateEnd(dateTo) : new Date();
  const start = dateFrom
    ? parseDateStart(dateFrom)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (start.getTime() > end.getTime()) {
    throw AppError.badRequest('dateFrom must be before dateTo');
  }

  return { dateFrom: start, dateTo: end };
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
