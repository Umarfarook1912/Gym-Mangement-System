import { WEEK_DAYS } from '../../constants';
import { useFetch } from '../../hooks/useFetch';
import { getPublicGym } from '../../services/settingsService';
import { formatClock } from '../../utils/date';
import Card from './Card';

export default function GymHours() {
  const { data, loading } = useFetch(() => getPublicGym(), []);
  if (loading || !data) return null;

  const days = (data.workingDays || []).map(Number);

  return (
    <Card title="Gym hours">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Opens</dt>
          <dd className="mt-1 text-sm">{formatClock(data.openTime)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Closes</dt>
          <dd className="mt-1 text-sm">{formatClock(data.closeTime)}</dd>
        </div>
      </dl>
      <p className="field-label mt-4">Working days</p>
      <div className="flex flex-wrap gap-2">
        {WEEK_DAYS.map((day) => {
          const active = days.includes(day.value);
          return (
            <span
              key={day.value}
              className={`rounded-full px-3 py-1 text-xs ${active ? 'bg-primary text-on-primary' : 'border border-white/10 text-muted'}`}
            >
              {day.label}
            </span>
          );
        })}
      </div>
      {data.checkoutRequired ? <p className="mt-4 text-sm text-muted">Checkout is required after check-in.</p> : null}
    </Card>
  );
}
