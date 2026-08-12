/** Calendar-date helpers (timezone-safe for YYYY-MM-DD fields). */

export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Normalize stored date (ISO or YYYY-MM-DD) to YYYY-MM-DD. */
export function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

export function parseLocalDate(value: string): Date | null {
  const key = toDateKey(value);
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

/** True when follow-up is today or earlier (local calendar). */
export function isFollowUpDue(
  value: string | null | undefined,
  today = todayKey(),
): boolean {
  const key = toDateKey(value);
  return Boolean(key && key <= today);
}

/** True when follow-up is exactly today (local calendar). */
export function isFollowUpToday(
  value: string | null | undefined,
  today = todayKey(),
): boolean {
  return toDateKey(value) === today;
}
