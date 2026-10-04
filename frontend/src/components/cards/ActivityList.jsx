import { formatDate, formatTime } from '../../utils/date';

export default function ActivityList({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">No recent activity.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="border-b border-white/5 pb-3 last:border-0">
          <p className="text-sm text-secondary">{item.message}</p>
          <p className="mt-1 text-xs text-muted">
            {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
