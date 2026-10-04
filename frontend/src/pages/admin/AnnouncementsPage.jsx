import { useState } from 'react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Dropdown from '../../components/common/Dropdown';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import AnnouncementForm, { emptyAnnouncement } from '../../components/forms/AnnouncementForm';
import { PAGINATION } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import { usePagination } from '../../hooks/usePagination';
import * as announcementService from '../../services/announcementService';
import { formatDate } from '../../utils/date';
import { applyApiErrors } from '../../utils/format';
import { validateAnnouncement } from '../../validations';

export default function AnnouncementsPage() {
  const toast = useToast();
  const { page, setPage, limit } = usePagination();
  const editor = useModal();
  const confirm = useModal();
  const [deleting, setDeleting] = useState(false);
  const { data, loading, error, reload } = useFetch(
    () => announcementService.listAnnouncements({ page, limit }),
    [page, limit]
  );
  const form = useForm({
    initialValues: emptyAnnouncement,
    validate: validateAnnouncement,
    onSubmit: async (values, { setErrors }) => {
      try {
        if (editor.payload?._id) {
          await announcementService.updateAnnouncement(editor.payload._id, values);
          toast.success('Announcement updated');
        } else {
          await announcementService.createAnnouncement(values);
          toast.success('Announcement published');
        }
        editor.closeModal();
        reload();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        toast.error(requestError.message);
      }
    },
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      await announcementService.deleteAnnouncement(confirm.payload._id);
      toast.success('Announcement deleted');
      confirm.closeModal();
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Timing changes, maintenance, and important updates. Email is optional."
        actions={
          <Button
            onClick={() => {
              form.reset(emptyAnnouncement);
              editor.openModal(null);
            }}
          >
            New announcement
          </Button>
        }
      />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="panel p-2 sm:p-4">
        <DataTable
          loading={loading}
          rows={data?.items || []}
          rowKey="_id"
          emptyTitle="No announcements"
          pagination={{ page, totalPages: data?.pagination?.totalPages || PAGINATION.DEFAULT_PAGE, onPageChange: setPage }}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type', render: (row) => <StatusBadge status={row.type} /> },
            { key: 'createdAt', label: 'Published', render: (row) => formatDate(row.createdAt) },
            { key: 'sendEmail', label: 'Email', render: (row) => (row.sendEmail ? 'Sent' : 'No') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <Dropdown
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => {
                        form.reset({ type: row.type, title: row.title, body: row.body, sendEmail: row.sendEmail });
                        editor.openModal(row);
                      },
                    },
                    { label: 'Delete', onClick: () => confirm.openModal(row) },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
      <Modal open={editor.open} title={editor.payload ? 'Edit announcement' : 'New announcement'} onClose={editor.closeModal}>
        <AnnouncementForm
          values={form.values}
          errors={form.errors}
          submitting={form.submitting}
          onChange={form.handleChange}
          onSubmit={form.handleSubmit}
          onCancel={editor.closeModal}
        />
      </Modal>
      <ConfirmationModal
        open={confirm.open}
        title="Delete announcement"
        message="This removes the announcement for members."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={confirm.closeModal}
      />
    </div>
  );
}
