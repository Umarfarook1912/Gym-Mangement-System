import { useState } from 'react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Dropdown from '../../components/common/Dropdown';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import PlanForm, { emptyPlan } from '../../components/forms/PlanForm';
import { PLAN_STATUS } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import * as membershipService from '../../services/membershipService';
import { applyApiErrors, formatCurrency } from '../../utils/format';
import { validatePlan } from '../../validations';

export default function PlansPage() {
  const toast = useToast();
  const editor = useModal();
  const confirm = useModal();
  const [deleting, setDeleting] = useState(false);
  const { data, loading, error, reload } = useFetch(() => membershipService.listPlans(), []);
  const form = useForm({
    initialValues: emptyPlan,
    validate: validatePlan,
    onSubmit: async (values, { setErrors }) => {
      const payload = { ...values, durationMonths: Number(values.durationMonths), price: Number(values.price) };
      try {
        if (editor.payload?._id) {
          await membershipService.updatePlan(editor.payload._id, payload);
          toast.success('Plan updated');
        } else {
          await membershipService.createPlan(payload);
          toast.success('Plan created');
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
      if (confirm.payload?.deactivate) {
        await membershipService.updatePlan(confirm.payload._id, {
          name: confirm.payload.name,
          durationMonths: confirm.payload.durationMonths,
          price: confirm.payload.price,
          status: PLAN_STATUS.INACTIVE,
        });
        toast.success('Plan deactivated');
      } else {
        await membershipService.deletePlan(confirm.payload._id);
        toast.success('Plan deleted');
      }
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
        title="Membership plans"
        subtitle="Durations and prices are managed here, then applied when a member is enrolled."
        actions={
          <Button
            onClick={() => {
              form.reset(emptyPlan);
              editor.openModal(null);
            }}
          >
            Add plan
          </Button>
        }
      />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="panel p-2 sm:p-4">
        <DataTable
          loading={loading}
          rows={data || []}
          rowKey="_id"
          emptyTitle="No plans yet"
          columns={[
            { key: 'name', label: 'Plan' },
            { key: 'durationMonths', label: 'Duration', render: (row) => `${row.durationMonths} months` },
            { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'memberCount', label: 'Members', render: (row) => row.memberCount || 0 },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => {
                const items = [
                  {
                    label: 'Edit',
                    onClick: () => {
                      form.reset({
                        name: row.name,
                        durationMonths: String(row.durationMonths),
                        price: String(row.price),
                        status: row.status,
                      });
                      editor.openModal(row);
                    },
                  },
                ];
                if (row.memberCount && row.status === PLAN_STATUS.ACTIVE) {
                  items.push({
                    label: 'Deactivate',
                    danger: true,
                    onClick: () => confirm.openModal({ ...row, deactivate: true }),
                  });
                }
                if (!row.memberCount) {
                  items.push({ label: 'Delete', danger: true, onClick: () => confirm.openModal(row) });
                }
                return <Dropdown inline items={items} />;
              },
            },
          ]}
        />
      </div>
      <Modal open={editor.open} title={editor.payload ? 'Edit plan' : 'Add plan'} onClose={editor.closeModal}>
        <PlanForm
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
        title={confirm.payload?.deactivate ? 'Deactivate plan' : 'Delete plan'}
        message={
          confirm.payload?.deactivate
            ? `${confirm.payload.name} is assigned to ${confirm.payload.memberCount} member${confirm.payload.memberCount === 1 ? '' : 's'}. Deactivate it so it cannot be assigned to new members.`
            : `Delete ${confirm.payload?.name || 'this plan'}?`
        }
        confirmLabel={confirm.payload?.deactivate ? 'Deactivate' : 'Delete'}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={confirm.closeModal}
      />
    </div>
  );
}
