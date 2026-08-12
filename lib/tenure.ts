import { differenceInMonths, parse } from "date-fns";

/** An employment period. "MM.YYYY". Omit `end` to mean present. */
export type TPeriod = { start: string; end?: string };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDate(v: string): Date {
  return parse(v, "MM.yyyy", new Date());
}

function label(v: string): string {
  const [mm, yyyy] = v.split(".");
  return `${MONTHS[Number(mm) - 1]} ${yyyy}`;
}

/**
 * Whether this is an ongoing engagement.
 *
 * This replaces `org.duration.includes("Present")`, which was doing the work of
 * a boolean by searching a display string. A structured period makes the test
 * mean what it says and survives a copy change to the label.
 */
export function isCurrent(period: TPeriod): boolean {
  return period.end === undefined;
}

/** "Jan 2022 - Dec 2025" or "Jan 2026 - Present". ASCII hyphen, no em-dash. */
export function formatPeriod(period: TPeriod): string {
  return `${label(period.start)} - ${period.end ? label(period.end) : "Present"}`;
}

/**
 * "4y", "3y 11m", "8m", or "" when the span is not positive.
 *
 * Tenure is rendered because a reader should not have to do arithmetic to see
 * that four years is four years.
 *
 * Months are counted inclusively of both endpoints, so Jan 2022 to Dec 2025 is
 * 48 months rather than 47. The empty-string return is deliberate: a transposed
 * date in `workData.ts` then renders as nothing, rather than as "-1y", which
 * would look like a bug in the page instead of a bug in the data.
 */
export function formatTenure(period: TPeriod): string {
  const months =
    differenceInMonths(
      period.end ? toDate(period.end) : new Date(),
      toDate(period.start)
    ) + 1;

  if (months <= 0) return "";
  if (months < 12) return `${months}m`;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`;
}
