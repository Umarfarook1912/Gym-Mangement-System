import AnnouncementDetails, { announcementHeading } from '../../components/cards/AnnouncementDetails';
import Card from '../../components/cards/Card';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { PAGINATION } from '../../constants';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { listMemberAnnouncements } from '../../services/announcementService';
import { formatDate } from '../../utils/date';
import Pagination from '../../components/common/Pagination';

export default function MemberAnnouncementsPage() {
  const { page, setPage, limit } = usePagination();
  const { data, loading, error, reload } = useFetch(() => listMemberAnnouncements({ page, limit }), [page, limit]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Gym timing, maintenance, and important updates." />
      {data?.items?.length ? (
        <div className="space-y-3">
          {data.items.map((item) => (
            <Card key={item._id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{announcementHeading(item)}</h2>
                <StatusBadge status={item.type} />
              </div>
              <AnnouncementDetails item={item} />
              <p className="mt-3 text-xs text-muted">{formatDate(item.createdAt)}</p>
            </Card>
          ))}
          <Pagination page={page} totalPages={data.pagination?.totalPages || PAGINATION.DEFAULT_PAGE} onPageChange={setPage} />
        </div>
      ) : (
        <Card>
          <p className="text-sm text-muted">No announcements right now.</p>
        </Card>
      )}
    </div>
  );
}
