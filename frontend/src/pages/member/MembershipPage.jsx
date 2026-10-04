import Card from '../../components/cards/Card';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PaymentHistory from '../../components/tables/PaymentHistory';
import { MEMBERSHIP_STATUS } from '../../constants';
import { useFetch } from '../../hooks/useFetch';
import { getOwnMembership } from '../../services/membershipService';
import { formatDate, todayKey } from '../../utils/date';
import { formatCurrency } from '../../utils/format';

export default function MembershipPage() {
  const { data, loading, error, reload } = useFetch(() => getOwnMembership(), []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const member = data.member;
  const payments = data.payments || [];
  const currentPayment = payments.find((payment) => payment.startDate === member.membershipStartDate);
  const upcoming = payments
    .filter((payment) => payment.startDate > todayKey())
    .sort((left, right) => (left.startDate < right.startDate ? -1 : 1))[0];
  const planName = currentPayment?.planName || member.membershipPlan?.name;
  const amount = currentPayment?.amount ?? member.membershipPlan?.price;
  const duration = currentPayment?.durationMonths || member.membershipPlan?.durationMonths;

  const rows = [
    ['Member ID', member.memberId],
    ['Plan', planName],
    ['Amount paid', formatCurrency(amount)],
    ['Duration', duration ? `${duration} months` : '—'],
    ['Start', formatDate(member.membershipStartDate)],
    ['End', formatDate(member.membershipEndDate)],
    ['Join date', formatDate(member.joinDate)],
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Your current plan and every earlier payment." actions={<StatusBadge status={member.membershipStatus} />} />
      <Card title="Current plan">
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
              <dd className="mt-1">{value}</dd>
            </div>
          ))}
        </dl>
        {member.membershipStatus === MEMBERSHIP_STATUS.EXPIRED ? (
          <p className="mt-4 text-sm text-muted">
            This period ended {formatDate(member.membershipEndDate)}. Pay at the gym and the next plan will show here once it is marked paid.
          </p>
        ) : null}
        {upcoming ? (
          <p className="mt-4 text-sm text-muted">
            Next plan: {upcoming.planName} from {formatDate(upcoming.startDate)} to {formatDate(upcoming.endDate)}.
          </p>
        ) : null}
      </Card>
      <div className="mt-4">
        <Card title="Payment history">
          <p className="mb-4 text-sm text-muted">Every paid period stays here, including months when the plan changed.</p>
          <PaymentHistory payments={payments} currentStart={member.membershipStartDate} />
        </Card>
      </div>
    </div>
  );
}
