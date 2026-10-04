import Card from '../../components/cards/Card';
import GymHours from '../../components/cards/GymHours';
import StatCard from '../../components/cards/StatCard';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { getMemberDashboard } from '../../services/dashboardService';
import { formatDate, formatTime } from '../../utils/date';
import { statusLabel } from '../../utils/format';

export default function MemberDashboardPage() {
  const { data, loading, error, reload } = useFetch(() => getMemberDashboard(), []);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const member = data.member;

  return (
    <div>
      <PageHeader title={`Hello, ${member.fullName}`} subtitle="Your membership and recent visits." />
      <div className="mb-4">
        <GymHours />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Membership" value={statusLabel(member.membershipStatus)} hint={member.membershipPlan?.name} />
        <StatCard label="Valid until" value={formatDate(member.membershipEndDate)} />
        <StatCard
          label="This month"
          value={`${data.monthAttendance.presentDays} of ${data.monthAttendance.monthDays}`}
          hint={`${data.monthAttendance.percentage}%`}
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Recent attendance">
          <ul className="space-y-3 text-sm">
            {data.recentAttendance.length ? (
              data.recentAttendance.map((item) => (
                <li key={item._id} className="flex justify-between gap-3">
                  <span>{formatDate(item.dateKey)}</span>
                  <span className="text-muted">
                    {formatTime(item.checkInAt)} – {formatTime(item.checkOutAt)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted">No visits recorded yet.</li>
            )}
          </ul>
        </Card>
        <Card title="Announcements">
          <ul className="space-y-4">
            {data.announcements.length ? (
              data.announcements.map((item) => (
                <li key={item._id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-medium">{item.title}</p>
                    <StatusBadge status={item.type} />
                  </div>
                  <p className="text-sm text-muted">{item.body}</p>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No announcements right now.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
