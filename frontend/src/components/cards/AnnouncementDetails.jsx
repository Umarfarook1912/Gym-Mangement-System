import { ANNOUNCEMENT_TYPES } from '../../constants';
import { formatClock, formatDate } from '../../utils/date';

export function announcementHeading(item) {
  if (item.type === ANNOUNCEMENT_TYPES.TIMING && item.openTime && item.closeTime) {
    return `Gym timing · ${formatClock(item.openTime)} – ${formatClock(item.closeTime)}`;
  }
  if (item.type === ANNOUNCEMENT_TYPES.MAINTENANCE && item.startDate && item.endDate) {
    return `Maintenance · ${formatDate(item.startDate)} – ${formatDate(item.endDate)}`;
  }
  return item.title;
}

export default function AnnouncementDetails({ item }) {
  if (item.type === ANNOUNCEMENT_TYPES.TIMING) {
    return (
      <div className="space-y-1 text-sm text-muted">
        {item.effectiveDate ? <p>Effective {formatDate(item.effectiveDate)}</p> : null}
        {item.body ? <p>{item.body}</p> : null}
      </div>
    );
  }

  if (!item.body) return null;
  return <p className="text-sm text-muted">{item.body}</p>;
}
