import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import MarkPaidForm from '../../components/forms/MarkPaidForm';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import PaymentHistory from '../../components/tables/PaymentHistory';
import { MEMBERSHIP_STATUS, PAGINATION, ROUTES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import * as memberService from '../../services/memberService';
import { listPlans } from '../../services/membershipService';
import { formatDate } from '../../utils/date';

const TABS = [
  { id: MEMBERSHIP_STATUS.ACTIVE, label: 'Active' },
  { id: MEMBERSHIP_STATUS.EXPIRED, label: 'Expired' },
];

export default function PaymentsPage() {
  const toast = useToast();
  const { page, setPage, limit, resetPage } = usePagination();
  const [tab, setTab] = useState(MEMBERSHIP_STATUS.ACTIVE);
  const [history, setHistory] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [paying, setPaying] = useState(false);
  const { data: plans } = useFetch(() => listPlans(), []);
  const { data, loading, error, reload } = useFetch(
    () => memberService.listMembers({ page, limit, status: tab, sortBy: 'fullName', sortOrder: 'asc' }),
    [page, limit, tab]
  );

  async function openHistory(row) {
    setHistory({ loading: true, member: row, payments: [] });
    try {
      const detail = await memberService.getMember(row._id);
      setHistory({ loading: false, member: detail.member, payments: detail.payments || [] });
    } catch (requestError) {
      setHistory(null);
      toast.error(requestError.message);
    }
  }

  async function openPay(row) {
    try {
      const detail = await memberService.getMember(row._id);
      setPayTarget(detail);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function handlePayment(planId) {
    setPaying(true);
    try {
      await memberService.recordPayment(payTarget.member._id, { membershipPlan: planId });
      toast.success('Payment recorded');
      setPayTarget(null);
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
      throw requestError;
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Active means this period is already paid. To start a new month, open Expired, choose that member, and pick the plan."
      />
      <div className="mb-4 flex gap-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? 'primary' : 'ghost'}
            onClick={() => {
              setTab(item.id);
              resetPage();
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="panel p-2 sm:p-4">
          <DataTable
            loading={loading}
            rows={data?.items || []}
            rowKey="_id"
            emptyTitle={tab === MEMBERSHIP_STATUS.ACTIVE ? 'No active payments' : 'No expired payments'}
            emptyDescription="Registered members appear here once their first period is recorded."
            pagination={{
              page,
              totalPages: data?.pagination?.totalPages || PAGINATION.DEFAULT_PAGE,
              onPageChange: setPage,
            }}
            columns={[
              { key: 'memberId', label: 'Member ID' },
              {
                key: 'fullName',
                label: 'Name',
                render: (row) => (
                  <Link className="text-primary" to={ROUTES.ADMIN_MEMBER_DETAIL.replace(':id', row._id)}>
                    {row.fullName}
                  </Link>
                ),
              },
              { key: 'plan', label: 'Plan', render: (row) => row.membershipPlan?.name || '—' },
              { key: 'membershipStartDate', label: 'Start', render: (row) => formatDate(row.membershipStartDate) },
              { key: 'membershipEndDate', label: 'End', render: (row) => formatDate(row.membershipEndDate) },
              { key: 'membershipStatus', label: 'Status', render: (row) => <StatusBadge status={row.membershipStatus} /> },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex gap-3">
                    <button type="button" className="text-sm text-primary" onClick={() => openHistory(row)}>
                      History
                    </button>
                    {tab === MEMBERSHIP_STATUS.EXPIRED ? (
                      <button type="button" className="text-sm text-primary" onClick={() => openPay(row)}>
                        Mark as paid
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
      <Modal open={Boolean(history)} title={`${history?.member?.fullName || 'Member'} payment history`} onClose={() => setHistory(null)} size="lg">
        {history?.loading ? <LoadingState /> : <PaymentHistory payments={history?.payments} currentStart={history?.member?.membershipStartDate} />}
      </Modal>
      <Modal open={Boolean(payTarget)} title={`New period for ${payTarget?.member?.fullName || 'member'}`} onClose={() => setPayTarget(null)}>
        {payTarget ? (
          <MarkPaidForm
            member={payTarget.member}
            payments={payTarget.payments}
            plans={plans || []}
            submitting={paying}
            onSubmit={handlePayment}
            onCancel={() => setPayTarget(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
