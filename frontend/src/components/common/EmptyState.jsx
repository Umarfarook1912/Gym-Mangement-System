export default function EmptyState({ title = 'Nothing here yet', description = 'Records will appear here once they are added.' }) {
  return (
    <div className="panel flex min-h-48 flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-lg font-semibold text-secondary">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}
