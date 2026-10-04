export default function AttendanceChart({ series = [] }) {
  const max = Math.max(...series.map((item) => item.count), 1);

  if (!series.length) {
    return <p className="text-sm text-muted">No attendance recorded for this period.</p>;
  }

  return (
    <div className="flex h-52 items-end gap-2">
      {series.map((item) => (
        <div key={item.dateKey} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs text-muted">{item.count}</span>
          <div className="flex h-36 w-full items-end rounded-lg bg-white/5">
            <div
              className="w-full rounded-lg bg-primary"
              style={{ height: `${Math.max((item.count / max) * 100, item.count ? 8 : 0)}%` }}
            />
          </div>
          <span className="text-center text-[10px] text-muted">{item.label.split(' ').slice(0, 2).join(' ')}</span>
        </div>
      ))}
    </div>
  );
}
