import ProfilePanel from '../../components/forms/ProfilePanel';
import PageHeader from '../../components/common/PageHeader';

export default function AdminProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Update your admin details and password." />
      <ProfilePanel />
    </div>
  );
}
