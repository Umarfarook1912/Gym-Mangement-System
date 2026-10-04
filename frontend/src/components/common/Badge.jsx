export default function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/15 text-muted',
    gold: 'border-primary/40 text-primary',
    success: 'border-success/40 text-success',
    danger: 'border-danger/40 text-danger',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
