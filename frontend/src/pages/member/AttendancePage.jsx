import { useState } from 'react';
import Card from '../../components/cards/Card';
import StatCard from '../../components/cards/StatCard';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/tables/DataTable';
import { PAGINATION } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { checkInSelf, checkOutSelf, getOwnAttendance } from '../../services/attendanceService';

export default function MemberAttendancePage() {
  const toast = useToast();
  const { page, setPage, limit } = usePagination();
  const { data, loading, error, reload } = useFetch(() => getOwnAttendance({ page, limit }), [page, limit]);
  const [working, setWorking] = useState(false);
  const month = data?.percentage;
  const today = data?.today;
  const checkoutRequired = Boolean(data?.checkoutRequired);
  const checkedIn = Boolean(today);
  const checkedOut = Boolean(today?.checkOutAt);

  async function mark(action, successMessage) {
    setWorking(true);
    try {
      await action();
      toast.success(successMessage);
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  let todayMessage = 'You have not checked in today.';
  if (checkedOut) todayMessage = `Checked out at ${today.checkOutLabel}.`;
  else if (checkedIn) todayMessage = `Checked in at ${today.checkInLabel}.`;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Check in when you arrive. One visit is recorded each day." />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <Card title="Today" className="mb-4">
        <p className="text-sm text-muted">{todayMessage}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {checkedIn ? null : (
            <Button loading={working} onClick={() => mark(checkInSelf, 'Checked in')}>
              Check in
            </Button>
          )}
          {checkoutRequired && checkedIn && !checkedOut ? (
            <Button variant="ghost" loading={working} onClick={() => mark(checkOutSelf, 'Checked out')}>
              Check out
            </Button>
          ) : null}
        </div>
      </Card>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard label="This month" value={month ? `${month.presentDays} of ${month.monthDays}` : '—'} />
        <StatCard label="Attendance" value={month ? `${month.percentage}%` : '—'} />
      </div>
      <div className="panel p-4">
        <DataTable
          loading={loading}
          rows={data?.items || []}
          rowKey="id"
          emptyTitle="No visits yet"
          pagination={{ page, totalPages: data?.pagination?.totalPages || PAGINATION.DEFAULT_PAGE, onPageChange: setPage }}
          columns={[
            { key: 'dateLabel', label: 'Date' },
            { key: 'checkInLabel', label: 'Check in' },
            { key: 'checkOutLabel', label: 'Check out', render: (row) => row.checkOutLabel || '—' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
