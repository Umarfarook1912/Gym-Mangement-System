import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import Card from '../../components/cards/Card';
import MarkPaidForm from '../../components/forms/MarkPaidForm';
import MemberForm, { toMemberFormValues } from '../../components/forms/MemberForm';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import PaymentHistory from '../../components/tables/PaymentHistory';
import { MEMBERSHIP_STATUS, ROUTES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import * as memberService from '../../services/memberService';
import { listPlans } from '../../services/membershipService';
import { formatDate, formatTime } from '../../utils/date';
import { applyApiErrors, formatCurrency } from '../../utils/format';
import { validateMember } from '../../validations';

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => memberService.getMember(id), [id]);
  const { data: plans } = useFetch(() => listPlans(), []);
  const editor = useModal();
  const confirm = useModal();
  const paymentModal = useModal();
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);

  const form = useForm({
    initialValues: toMemberFormValues(null),
    validate: validateMember,
    onSubmit: async (values, { setErrors }) => {
      try {
        await memberService.updateMember(id, values);
        toast.success('Member updated');
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
      await memberService.deleteMember(id);
      toast.success('Member deleted');
      navigate(ROUTES.ADMIN_MEMBERS);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handlePayment(planId) {
    setPaying(true);
    try {
      await memberService.recordPayment(id, { membershipPlan: planId });
      toast.success('Payment recorded');
      paymentModal.closeModal();
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
      throw requestError;
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const member = data.member;
  const payments = data.payments || [];
  const currentPayment = payments.find((payment) => payment.startDate === member.membershipStartDate);
  const details = [
    ['Member ID', member.memberId],
    ['Email', member.email],
    ['Phone', member.phone],
    ['Date of birth', formatDate(member.dateOfBirth)],
    ['Gender', member.gender],
    ['Address', member.address || '—'],
    ['Join date', formatDate(member.joinDate)],
    ['Plan', currentPayment?.planName || member.membershipPlan?.name],
    ['Price', formatCurrency(currentPayment?.amount ?? member.membershipPlan?.price)],
    ['Start', formatDate(member.membershipStartDate)],
    ['End', formatDate(member.membershipEndDate)],
    ['Emergency contact', member.emergencyContactName || '—'],
    ['Emergency phone', member.emergencyContactPhone || '—'],
    ['Height', member.height ? `${member.height} cm` : '—'],
    ['Weight', member.weight ? `${member.weight} kg` : '—'],
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Members', to: ROUTES.ADMIN_MEMBERS }, { label: member.fullName }]} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{member.fullName}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {member.membershipStatus === MEMBERSHIP_STATUS.EXPIRED ? (
            <Button onClick={() => paymentModal.openModal()}>Mark as paid</Button>
          ) : (
            <Button variant="ghost" onClick={() => paymentModal.openModal()}>Next period</Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              form.reset(toMemberFormValues(member));
              editor.openModal(member);
            }}
          >
            Edit
          </Button>
          <Button variant="danger" onClick={() => confirm.openModal(member)}>
            Delete
          </Button>
          <StatusBadge status={member.membershipStatus} />
        </div>
      </div>
      <Card title="Membership">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
              <dd className="mt-1 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="mt-4">
        <Card title="Payment history">
          <p className="mb-4 text-sm text-muted">
            {member.membershipStatus === MEMBERSHIP_STATUS.EXPIRED
              ? 'This period has ended. Mark as paid and choose the plan for the new month.'
              : 'This period is already paid. Next period sets the following month, and the plan can be different.'}
          </p>
          <PaymentHistory payments={payments} currentStart={member.membershipStartDate} />
        </Card>
      </div>
      <div className="mt-4">
        <Card
          title="Attendance"
          action={
            <Link to={ROUTES.ADMIN_ATTENDANCE} className="text-sm text-primary">
              Open attendance
            </Link>
          }
        >
          <DataTable
            rows={data.attendance || []}
            rowKey="_id"
            emptyTitle="No attendance yet"
            columns={[
              { key: 'dateKey', label: 'Date', render: (row) => formatDate(row.dateKey) },
              { key: 'checkInAt', label: 'Check in', render: (row) => formatTime(row.checkInAt) },
              { key: 'checkOutAt', label: 'Check out', render: (row) => formatTime(row.checkOutAt) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </Card>
      </div>
      <Modal open={editor.open} title="Edit member" onClose={editor.closeModal} size="lg">
        <MemberForm
          values={form.values}
          errors={form.errors}
          submitting={form.submitting}
          plans={plans || []}
          onChange={form.handleChange}
          onSubmit={form.handleSubmit}
          onCancel={editor.closeModal}
          isEdit
        />
      </Modal>
      <Modal
        open={paymentModal.open}
        title={member.membershipStatus === MEMBERSHIP_STATUS.EXPIRED ? 'Mark as paid' : 'Next period'}
        onClose={paymentModal.closeModal}
      >
        <MarkPaidForm
          member={member}
          payments={payments}
          plans={plans || []}
          submitting={paying}
          onSubmit={handlePayment}
          onCancel={paymentModal.closeModal}
        />
      </Modal>
      <ConfirmationModal
        open={confirm.open}
        title="Delete member"
        message={`Delete ${member.fullName}, their attendance, and their payment history?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={confirm.closeModal}
      />
    </div>
  );
}
