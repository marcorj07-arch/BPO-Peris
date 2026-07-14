/** Local-date-safe helpers. All dates are plain `YYYY-MM-DD` strings — never
 * routed through `new Date(isoString)` for arithmetic, to avoid timezone
 * shifts. */

export function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Advances `dateStr` by `months` calendar months. If the base day doesn't
 * exist in the destination month (e.g. day 31 in February), clamps to the
 * last day of that month. */
export function addMonthsClamped(dateStr: string, months: number): string {
  const { year, month, day } = parseDateParts(dateStr);
  const zeroBasedTarget = (month - 1) + months;
  const targetYear = year + Math.floor(zeroBasedTarget / 12);
  const targetMonth0 = ((zeroBasedTarget % 12) + 12) % 12;
  const targetMonth = targetMonth0 + 1;
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);
  return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
}

export function monthKey(dateStr: string): string {
  const { year, month } = parseDateParts(dateStr);
  return `${year}-${pad(month)}`;
}

export function addMonthsToMonthKey(key: string, months: number): string {
  return monthKey(addMonthsClamped(`${key}-01`, months));
}
