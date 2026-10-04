const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function shiftMonth(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${nextMonth}`;
}

export default function MonthCalendar({ month, days = {}, selected, onSelect, onMonthChange }) {
  const [year, monthIndex] = month.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, monthIndex - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="text-sm text-muted hover:text-primary" onClick={() => onMonthChange(shiftMonth(month, -1))}>
          Previous
        </button>
        <p className="text-sm font-medium">{month}</p>
        <button type="button" className="text-sm text-muted hover:text-primary" onClick={() => onMonthChange(shiftMonth(month, 1))}>
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const key = `${month}-${String(day).padStart(2, '0')}`;
          const count = days[key] || 0;
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`rounded-lg py-2 ${active ? 'bg-primary font-semibold text-on-primary' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
            >
              <span className="block">{day}</span>
              {count ? <span className={`block text-[10px] font-semibold ${active ? 'text-on-primary' : 'text-primary'}`}>{count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
