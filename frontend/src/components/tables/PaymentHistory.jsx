import Badge from '../common/Badge';
import DataTable from './DataTable';
import { formatDate, todayKey } from '../../utils/date';
import { formatCurrency, statusLabel } from '../../utils/format';

function periodStatus(payment, currentStart, today) {
  if (payment.startDate > today) return 'upcoming';
  if (payment.startDate === currentStart) return 'current';
  return 'paid';
}

const TONES = {
  current: 'success',
  upcoming: 'gold',
  paid: 'neutral',
};

export default function PaymentHistory({ payments, currentStart }) {
  const today = todayKey();
  const rows = payments || [];

  return (
    <DataTable
      rows={rows}
      rowKey="_id"
      emptyTitle="No payments yet"
      emptyDescription="The first payment is recorded when the member is registered."
      columns={[
        { key: 'planName', label: 'Plan' },
        { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
        { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
        { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) },
        { key: 'paidOn', label: 'Paid on', render: (row) => formatDate(row.paidOn) },
        {
          key: 'period',
          label: 'Period',
          render: (row) => {
            const status = periodStatus(row, currentStart, today);
            return <Badge tone={TONES[status]}>{statusLabel(status)}</Badge>;
          },
        },
      ]}
    />
  );
}
