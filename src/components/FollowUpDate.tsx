import { isFollowUpDue, isFollowUpToday } from '../lib/dates';
import { formatDate } from '../lib/labels';

export function FollowUpDate({
  value,
  prefix = '',
}: {
  value: string | null;
  prefix?: string;
}) {
  if (!value) return <span>—</span>;

  const today = isFollowUpToday(value);
  const due = isFollowUpDue(value);
  const className = today
    ? 'follow-up-date today'
    : due
      ? 'follow-up-date overdue'
      : 'follow-up-date';

  return (
    <span className={className}>
      {prefix}
      {formatDate(value)}
    </span>
  );
}
