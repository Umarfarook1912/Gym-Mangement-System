import { useState } from 'react';
import Button from '../../components/common/Button';
import DatePicker from '../../components/common/DatePicker';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import DataTable from '../../components/tables/DataTable';
import { EXPORT_FORMATS, PAGINATION, REPORT_TYPES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { downloadReport, getReport } from '../../services/reportService';
import { todayKey } from '../../utils/date';

export default function ReportsPage() {
  const toast = useToast();
  const { page, setPage, limit, resetPage } = usePagination();
  const [filters, setFilters] = useState({
    type: REPORT_TYPES.DAILY,
    from: todayKey(),
    to: todayKey(),
    memberId: '',
  });
  const [applied, setApplied] = useState(filters);
  const [exporting, setExporting] = useState('');

  const { data, loading, error, reload } = useFetch(
    () => getReport({ ...applied, page, limit }),
    [applied, page, limit]
  );

  function update(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function exportFile(format) {
    setExporting(format);
    try {
      await downloadReport({ ...applied, format });
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setExporting('');
    }
  }

  const columns = (data?.columns || []).map((column) => ({
    key: column.key,
    label: column.label,
    render: (row) => row[column.key] ?? '—',
  }));

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="One filter set drives daily, weekly, monthly, member, and percentage reports."
        actions={
          <>
            <Button variant="ghost" className="no-print" loading={exporting === EXPORT_FORMATS.CSV} onClick={() => exportFile(EXPORT_FORMATS.CSV)}>
              Export CSV
            </Button>
            <Button variant="ghost" className="no-print" loading={exporting === EXPORT_FORMATS.PDF} onClick={() => exportFile(EXPORT_FORMATS.PDF)}>
              Export PDF
            </Button>
            <Button className="no-print" onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />
      <form
        className="no-print mb-4 grid gap-3 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          resetPage();
          setApplied(filters);
        }}
      >
        <FormField label="Report">
          <Select name="type" value={filters.type} onChange={update} placeholder="" options={Object.values(REPORT_TYPES).map((value) => ({ value, label: value.replace(/^\w/, (char) => char.toUpperCase()) }))} />
        </FormField>
        <FormField label="From">
          <DatePicker name="from" value={filters.from} onChange={update} />
        </FormField>
        <FormField label="To">
          <DatePicker name="to" value={filters.to} onChange={update} />
        </FormField>
        <FormField label="Member ID">
          <input name="memberId" value={filters.memberId} onChange={update} placeholder="GYM-0001" className="field" />
        </FormField>
        <div className="flex items-end">
          <Button type="submit">Apply</Button>
        </div>
      </form>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="print-area panel p-4">
        <p className="mb-3 text-sm text-muted">
          {data ? `${data.fromLabel} – ${data.toLabel}` : 'Select a range and apply the filters.'}
        </p>
        <DataTable
          loading={loading}
          rows={(data?.items || []).map((row, index) => ({ ...row, id: `${row.memberId || 'row'}-${row.date || index}` }))}
          columns={columns.length ? columns : [{ key: 'empty', label: 'Report' }]}
          rowKey="id"
          emptyTitle="No report rows"
          pagination={{
            page,
            totalPages: data?.pagination?.totalPages || PAGINATION.DEFAULT_PAGE,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
