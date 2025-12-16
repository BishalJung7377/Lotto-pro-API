const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'America/New_York';

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const getFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const getZonedParts = (date: Date, timeZone: string): ZonedParts => {
  const parts = getFormatter(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? parseInt(value, 10) : 0;
  };

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
};

export const getDefaultTimeZone = (): string => DEFAULT_TIMEZONE;

export const startOfDayInTimeZone = (
  date: Date,
  timeZone: string = DEFAULT_TIMEZONE
): Date => {
  const { year, month, day } = getZonedParts(date, timeZone);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

export const addDaysInTimeZone = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const parseDateInTimeZone = (
  input: string,
  timeZone: string = DEFAULT_TIMEZONE
): Date => {
  const parts = input.split('-').map((part) => parseInt(part, 10));
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  const [year, month, day] = parts;
  const base = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return startOfDayInTimeZone(base, timeZone);
};

export const toSqlDateTime = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};
