import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import Dropdown from '../../components/common/Dropdown';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import MemberForm, { emptyMember, toMemberFormValues } from '../../components/forms/MemberForm';
import { PAGINATION, ROUTES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import { usePagination } from '../../hooks/usePagination';
import * as memberService from '../../services/memberService';
import { listPlans } from '../../services/membershipService';
import { formatDate } from '../../utils/date';
import { applyApiErrors } from '../../utils/format';
import { validateMember } from '../../validations';

export default function MembersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { page, setPage, limit, resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const debouncedSearch = useDebounce(search);
  const editor = useModal();
  const confirm = useModal();
  const [deleting, setDeleting] = useState(false);
  const [credential, setCredential] = useState(null);
  const [formError, setFormError] = useState('');
  const { data: plans } = useFetch(() => listPlans(), []);

  const { data, loading, error, reload } = useFetch(
    () => memberService.listMembers({ page, limit, search: debouncedSearch, sortBy, sortOrder }),
    [page, limit, debouncedSearch, sortBy, sortOrder]
  );

  const form = useForm({
    initialValues: emptyMember,
    validate: validateMember,
    onSubmit: async (values, { setErrors }) => {
      setFormError('');
      const memberId = editor.payload?._id || editor.payload?.id;
      try {
        if (memberId) {
          await memberService.updateMember(memberId, values);
          toast.success('Member updated');
        } else {
          const created = await memberService.createMember(values);
          setCredential(created.temporaryPassword);
          toast.success('Member created');
        }
        editor.closeModal();
        form.reset(emptyMember);
        reload();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        setFormError(requestError.message);
        toast.error(requestError.message);
      }
    },
  });

  function openCreate() {
    setFormError('');
    form.reset(emptyMember);
    editor.openModal(null);
  }

  function openEdit(member) {
    setFormError('');
    form.reset(toMemberFormValues(member));
    editor.openModal(member);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await memberService.deleteMember(confirm.payload._id);
      toast.success('Member deleted');
      confirm.closeModal();
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleSort(key) {
    if (sortBy === key) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Registered members. Renewals and payment history are under Payments."
        actions={<Button onClick={openCreate}>Add member</Button>}
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          placeholder="Search name, email, phone, or ID"
          onChange={(value) => {
            setSearch(value);
            resetPage();
          }}
        />
      </div>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="panel p-2 sm:p-4">
        <DataTable
          loading={loading}
          rows={data?.items || []}
          emptyTitle="No members found"
          emptyDescription="Add a member or adjust the search."
          rowKey="_id"
          pagination={{
            page,
            totalPages: data?.pagination?.totalPages || PAGINATION.DEFAULT_PAGE,
            onPageChange: setPage,
            onSort: handleSort,
          }}
          columns={[
            { key: 'memberId', label: 'Member ID', sortable: true },
            { key: 'fullName', label: 'Name', sortable: true },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'joinDate', label: 'Joined', sortable: true, render: (row) => formatDate(row.joinDate) },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <Dropdown
                  inline
                  items={[
                    { label: 'View', onClick: () => navigate(ROUTES.ADMIN_MEMBER_DETAIL.replace(':id', row._id)) },
                    { label: 'Edit', onClick: () => openEdit(row) },
                    { label: 'Delete', danger: true, onClick: () => confirm.openModal(row) },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
      <Modal open={editor.open} title={editor.payload ? 'Edit member' : 'Add member'} onClose={editor.closeModal} size="lg">
        <MemberForm
          values={form.values}
          errors={form.errors}
          submitting={form.submitting}
          plans={plans || []}
          onChange={form.handleChange}
          onSubmit={form.handleSubmit}
          onCancel={editor.closeModal}
          formError={formError}
          isEdit={Boolean(editor.payload)}
        />
      </Modal>
      <Modal open={Boolean(credential)} title="Temporary password" onClose={() => setCredential(null)}>
        <p className="text-sm text-muted">Share this password with the member. It is also included in the registration email.</p>
        <p className="mt-4 rounded-xl border border-primary/40 px-4 py-3 font-semibold text-primary">{credential}</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setCredential(null)}>Done</Button>
        </div>
      </Modal>
      <ConfirmationModal
        open={confirm.open}
        title="Delete member"
        message={`Delete ${confirm.payload?.fullName || 'this member'}, their attendance, and their payment history?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={confirm.closeModal}
      />
    </div>
  );
}
