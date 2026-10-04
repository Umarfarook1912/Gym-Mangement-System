import Card from './Card';
import AttendanceChart from '../charts/AttendanceChart';

export default function ChartCard({ title, series, className = '' }) {
  return (
    <Card title={title} className={className}>
      <AttendanceChart series={series} />
    </Card>
  );
}
