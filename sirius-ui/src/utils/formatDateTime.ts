/**
 * formatDateTime — the one date formatter for the UI (house rule: no raw ISO
 * strings on screen).
 *
 *   formatDateTime("2026-11-21T12:04:05Z")          // "Nov 21, 12:04 PM"
 *   formatDateTime("2026-11-21T12:04:05Z", "long")  // "Nov 21, 2026, 12:04:05 PM"
 *   formatDateTime(undefined)                       // "—"
 *
 * "short" adds the year only when it isn't the current year, so an old date
 * never reads as this year's ("Nov 21, 2025, 12:04 PM"). Times show in the
 * viewer's time zone unless `options.timeZone` says otherwise. Empty, invalid
 * and Go zero-time values ("0001-01-01T00:00:00Z") render as "—".
 */

export type DateTimeStyle = "short" | "long";

export type DateInput = string | number | Date | null | undefined;

export interface FormatDateTimeOptions {
  /** IANA zone, e.g. "UTC". Defaults to the viewer's zone. */
  timeZone?: string;
  /** "Now", for deciding whether "short" needs the year. */
  now?: Date;
}

export const EMPTY_DATE = "—";

const LOCALE = "en-US";

/** Parse a date-like value; null for empty, invalid or zero-time values. */
export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  // Go's zero time and other placeholders mean "never set".
  if (date.getUTCFullYear() < 1971) return null;
  return date;
}

function yearIn(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, { year: "numeric", timeZone }).format(date);
}

export function formatDateTime(
  value: DateInput,
  style: DateTimeStyle = "short",
  options: FormatDateTimeOptions = {},
): string {
  const date = toDate(value);
  if (!date) return EMPTY_DATE;
  const { timeZone } = options;

  const withYear =
    style === "long" || yearIn(date, timeZone) !== yearIn(options.now ?? new Date(), timeZone);

  const formatted = new Intl.DateTimeFormat(LOCALE, {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
    second: style === "long" ? "2-digit" : undefined,
    timeZone,
  }).format(date);

  // Newer ICU puts a narrow no-break space before AM/PM; keep plain spaces so
  // the text is the same in every browser and in search.
  return formatted.replace(/[  ]/g, " ");
}

export default formatDateTime;
