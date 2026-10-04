import ActivityList from '../../components/cards/ActivityList';
import Card from '../../components/cards/Card';
import ChartCard from '../../components/cards/ChartCard';
import StatCard from '../../components/cards/StatCard';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { getAdminDashboard } from '../../services/dashboardService';

const STATS = [
  { key: 'totalMembers', label: 'Total members' },
  { key: 'activeMembers', label: 'Active members' },
  { key: 'expiredMembers', label: 'Expired members' },
  { key: 'todayAttendance', label: "Today's attendance" },
  { key: 'presentMembers', label: 'Present members' },
  { key: 'absentMembers', label: 'Absent members' },
  { key: 'expiringMemberships', label: 'Expiring memberships' },
];

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useFetch(() => getAdminDashboard(), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Membership, attendance, and floor activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.key} label={stat.label} value={data.stats[stat.key] ?? 0} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Attendance" series={data.attendanceChart} />
        <Card title="Membership statistics" className="lg:col-span-1">
          <ul className="space-y-3">
            {data.membershipStats.map((item) => (
              <li key={item.planName} className="flex items-center justify-between text-sm">
                <span className="text-muted">{item.planName}</span>
                <span className="text-primary">{item.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Recent registrations">
          <ul className="space-y-3 text-sm">
            {data.recentMembers.map((member) => (
              <li key={member._id || member.id} className="flex justify-between gap-3">
                <span>{member.fullName}</span>
                <span className="text-muted">{member.memberId}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent activity">
          <ActivityList items={data.activities} />
        </Card>
        <Card title="Expiring memberships">
          <ul className="space-y-3 text-sm">
            {data.expiring.length ? (
              data.expiring.map((member) => (
                <li key={member.id} className="flex justify-between gap-3">
                  <span>{member.fullName}</span>
                  <span className="text-primary">{member.endLabel}</span>
                </li>
              ))
            ) : (
              <li className="text-muted">No memberships expiring this week.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
