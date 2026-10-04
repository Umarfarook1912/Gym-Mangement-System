import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/cards/Card';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/modals/Modal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { WEEK_DAYS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useModal } from '../../hooks/useModal';
import * as authService from '../../services/authService';
import { sendExpiryReminders } from '../../services/membershipService';
import { getSettings, updateSettings } from '../../services/settingsService';
import { applyApiErrors } from '../../utils/format';
import { validateAdmin, validateSettings } from '../../validations';

const emptyAdmin = { fullName: '', email: '', password: '', phone: '' };

export default function SettingsPage() {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const { data, loading, error, reload } = useFetch(() => getSettings(), []);
  const admins = useFetch(() => authService.listAdmins(), []);
  const editor = useModal();
  const confirm = useModal();
  const [busy, setBusy] = useState('');

  const form = useForm({
    initialValues: {
      gymName: '',
      openTime: '06:00',
      closeTime: '22:00',
      workingDays: [],
      checkoutRequired: true,
    },
    validate: validateSettings,
    onSubmit: async (values, { setErrors }) => {
      try {
        await updateSettings({ ...values, workingDays: values.workingDays.map(Number) });
        toast.success('Gym settings saved');
        reload();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        toast.error(requestError.message);
      }
    },
  });

  const adminForm = useForm({
    initialValues: emptyAdmin,
    validate: (values) => validateAdmin(values, { passwordOptional: Boolean(editor.payload?._id) }),
    onSubmit: async (values, { setErrors }) => {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
      };
      if (values.password) payload.password = values.password;
      try {
        if (editor.payload?._id) {
          await authService.updateAdmin(editor.payload._id, payload);
          if (user?.id === editor.payload._id || user?.id === editor.payload.id) {
            setUser({ ...user, fullName: payload.fullName, email: payload.email, phone: payload.phone || '' });
          }
          toast.success('Admin updated');
        } else {
          await authService.createAdmin(payload);
          toast.success('Admin created');
        }
        editor.closeModal();
        adminForm.reset(emptyAdmin);
        admins.reload();
      } catch (requestError) {
        applyApiErrors(requestError, setErrors);
        toast.error(requestError.message);
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    form.setValues({
      gymName: data.gymName || '',
      openTime: data.openTime || '06:00',
      closeTime: data.closeTime || '22:00',
      workingDays: data.workingDays || [],
      checkoutRequired: Boolean(data.checkoutRequired),
    });
  }, [data]);

  function toggleDay(day) {
    form.setValues((current) => {
      const workingDays = current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : [...current.workingDays, day];
      return { ...current, workingDays };
    });
  }

  async function runJob(key, action, success) {
    setBusy(key);
    try {
      const result = await action();
      toast.success(`${success} (${result.sent} sent)`);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div>
      <PageHeader title="Gym settings" subtitle="Hours, checkout rules, and additional admin accounts." />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Timings">
          <form onSubmit={form.handleSubmit} className="grid gap-4">
            <FormField label="Gym name" error={form.errors.gymName}>
              <Input name="gymName" value={form.values.gymName} onChange={form.handleChange} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Opens" error={form.errors.openTime}>
                <input type="time" name="openTime" value={form.values.openTime} onChange={form.handleChange} className="field" />
              </FormField>
              <FormField label="Closes" error={form.errors.closeTime}>
                <input type="time" name="closeTime" value={form.values.closeTime} onChange={form.handleChange} className="field" />
              </FormField>
            </div>
            <div>
              <p className="field-label">Working days</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const active = form.values.workingDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-full px-3 py-1 text-xs ${active ? 'bg-primary text-on-primary' : 'border border-white/10 text-muted'}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="checkoutRequired" checked={form.values.checkoutRequired} onChange={form.handleChange} />
              Checkout is required after check-in
            </label>
            <Button type="submit" loading={form.submitting || loading}>
              Save settings
            </Button>
          </form>
        </Card>
        <Card title="Notifications">
          <p className="text-sm text-muted">Send the expiry reminder to members whose plan ends today.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" loading={busy === 'expiry'} onClick={() => runJob('expiry', sendExpiryReminders, 'Expiry reminders processed')}>
              Expiry reminders
            </Button>
          </div>
        </Card>
      </div>
      <div className="mt-4">
        <Card
          title="Admins"
          action={
            <Button
              onClick={() => {
                adminForm.reset(emptyAdmin);
                editor.openModal(null);
              }}
            >
              Add admin
            </Button>
          }
        >
          <DataTable
            loading={admins.loading}
            rows={admins.data || []}
            rowKey="_id"
            emptyTitle="No admins"
            columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Dropdown
                    items={[
                      {
                        label: 'Edit',
                        onClick: () => {
                          adminForm.reset({
                            fullName: row.fullName || '',
                            email: row.email || '',
                            phone: row.phone || '',
                            password: '',
                          });
                          editor.openModal(row);
                        },
                      },
                      { label: 'Remove', onClick: () => confirm.openModal(row) },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
      <Modal open={editor.open} title={editor.payload?._id ? 'Edit admin' : 'Add admin'} onClose={editor.closeModal}>
        <form onSubmit={adminForm.handleSubmit} className="grid gap-4">
          <FormField label="Name" error={adminForm.errors.fullName}>
            <Input name="fullName" value={adminForm.values.fullName} onChange={adminForm.handleChange} />
          </FormField>
          <FormField label="Email" error={adminForm.errors.email}>
            <Input name="email" type="email" value={adminForm.values.email} onChange={adminForm.handleChange} />
          </FormField>
          <FormField label="Phone" error={adminForm.errors.phone}>
            <Input name="phone" value={adminForm.values.phone} onChange={adminForm.handleChange} />
          </FormField>
          <FormField
            label={editor.payload?._id ? 'New password' : 'Password'}
            error={adminForm.errors.password}
          >
            <Input
              name="password"
              type="password"
              value={adminForm.values.password}
              onChange={adminForm.handleChange}
              placeholder={editor.payload?._id ? 'Leave blank to keep the current password' : ''}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={editor.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={adminForm.submitting}>
              {editor.payload?._id ? 'Save admin' : 'Create admin'}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        open={confirm.open}
        title="Remove admin"
        message={`Remove ${confirm.payload?.fullName || 'this admin'}?`}
        confirmLabel="Remove"
        onClose={confirm.closeModal}
        onConfirm={async () => {
          try {
            await authService.deleteAdmin(confirm.payload._id);
            toast.success('Admin removed');
            confirm.closeModal();
            admins.reload();
          } catch (requestError) {
            toast.error(requestError.message);
          }
        }}
      />
    </div>
  );
}
