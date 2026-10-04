export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  onClick,
}) {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90',
    ghost: 'border border-white/10 bg-transparent text-secondary hover:border-primary/60',
    danger: 'bg-danger text-on-danger hover:bg-danger/90',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
