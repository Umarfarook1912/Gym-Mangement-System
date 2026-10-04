import PageHeader from '../../components/common/PageHeader';
import ProfilePanel from '../../components/forms/ProfilePanel';

export default function MemberProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account details and password." />
      <ProfilePanel />
    </div>
  );
}
