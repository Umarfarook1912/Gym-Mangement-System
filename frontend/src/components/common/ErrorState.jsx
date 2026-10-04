import Button from './Button';

export default function ErrorState({ message = 'Unable to load this page.', onRetry }) {
  return (
    <div className="panel flex min-h-48 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <p className="text-lg font-semibold text-secondary">Something went wrong</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button variant="ghost" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
