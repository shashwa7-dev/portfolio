export type TimeOfDay = "morning" | "evening" | "night";

/**
 * The beach scene's look for an hour of the visitor's clock (0 to 24,
 * fractions allowed): morning from 6:00 to 17:00, evening from 17:00 to
 * 20:00, night from 20:00 to 6:00.
 */
export function timeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 17) return "morning";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}
