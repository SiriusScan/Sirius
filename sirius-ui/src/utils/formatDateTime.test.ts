import assert from "node:assert/strict";
import { formatDateTime, toDate, EMPTY_DATE } from "./formatDateTime";

const utc = { timeZone: "UTC", now: new Date("2026-11-21T18:00:00Z") };

// Short: month, day, time; no year within the current year.
assert.equal(formatDateTime("2026-11-21T12:04:05Z", "short", utc), "Nov 21, 12:04 PM");
assert.equal(formatDateTime("2026-01-03T00:07:00Z", "short", utc), "Jan 3, 12:07 AM");
// Short is the default style.
assert.equal(formatDateTime("2026-11-21T12:04:05Z", undefined, utc), "Nov 21, 12:04 PM");
// Short shows the year for another year, so old dates never read as this year's.
assert.equal(formatDateTime("2025-11-21T12:04:05Z", "short", utc), "Nov 21, 2025, 12:04 PM");

// Long: full date with seconds.
assert.equal(formatDateTime("2026-11-21T12:04:05Z", "long", utc), "Nov 21, 2026, 12:04:05 PM");
assert.equal(formatDateTime(new Date("2026-06-08T21:15:00Z"), "long", utc), "Jun 8, 2026, 9:15:00 PM");

// Epoch milliseconds and Date objects.
assert.equal(formatDateTime(Date.parse("2026-11-21T12:04:05Z"), "short", utc), "Nov 21, 12:04 PM");

// Time zones apply to the clock and the date.
assert.equal(
  formatDateTime("2026-11-21T03:30:00Z", "short", { timeZone: "America/New_York", now: utc.now }),
  "Nov 20, 10:30 PM",
);

// Empty, invalid and Go zero-time values render as a dash.
for (const empty of [undefined, null, "", "not a date", "0001-01-01T00:00:00Z", new Date(NaN)]) {
  assert.equal(formatDateTime(empty, "short", utc), EMPTY_DATE, String(empty));
  assert.equal(formatDateTime(empty, "long", utc), EMPTY_DATE, String(empty));
}
assert.equal(EMPTY_DATE, "—");

// No narrow no-break spaces leak into the output.
assert.ok(!/[  ]/.test(formatDateTime("2026-11-21T12:04:05Z", "long", utc)));

// Without options the output still has the documented shape.
assert.match(formatDateTime("2026-11-21T12:04:05Z", "long"), /^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2}:\d{2} [AP]M$/);
assert.match(formatDateTime(new Date(), "short"), /^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);

assert.equal(toDate("garbage"), null);
assert.ok(toDate("2026-11-21T12:04:05Z") instanceof Date);

console.log("formatDateTime: all cases pass");
