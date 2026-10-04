import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import Pagination from '../common/Pagination';

export default function DataTable({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  pagination,
  rowKey = 'id',
}) {
  if (loading) return <LoadingState />;
  if (!rows?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.sortable && pagination?.onSort ? (
                    <button type="button" className="hover:text-primary" onClick={() => pagination.onSort(column.key)}>
                      {column.label}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey] || row._id} className="border-b border-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle text-secondary">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row[rowKey] || row._id} className="panel p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3 py-1.5 text-sm">
                <span className="text-muted">{column.label}</span>
                <span className="text-right text-secondary">{column.render ? column.render(row) : row[column.key]}</span>
              </div>
            ))}
          </article>
        ))}
      </div>

      {pagination ? (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={pagination.onPageChange} />
      ) : null}
    </div>
  );
}
