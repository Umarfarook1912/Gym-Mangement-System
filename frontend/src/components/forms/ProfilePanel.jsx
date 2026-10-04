import { useState } from 'react';
import { USER_ROLES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import * as authService from '../../services/authService';
import { applyApiErrors } from '../../utils/format';
import { validatePasswordChange, validateProfile } from '../../validations';
import Button from '../common/Button';
import Card from '../cards/Card';
import FormField from '../common/FormField';
import Input from '../common/Input';

export default function ProfilePanel() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const canEdit = user?.role === USER_ROLES.ADMIN;
  const [passwordMessage, setPasswordMessage] = useState('');

  const profileForm = useForm({
    initialValues: { fullName: user?.fullName || '', phone: user?.phone || '' },
    validate: validateProfile,
    onSubmit: async (values, { setErrors }) => {
      try {
        const updated = await authService.updateProfile(values);
        setUser(updated);
        toast.success('Profile updated');
      } catch (error) {
        applyApiErrors(error, setErrors);
        toast.error(error.message);
      }
    },
  });

  const passwordForm = useForm({
    initialValues: { currentPassword: '', newPassword: '' },
    validate: validatePasswordChange,
    onSubmit: async (values, { setErrors }) => {
      try {
        await authService.changePassword(values);
        passwordForm.reset();
        setPasswordMessage('Password changed successfully');
        toast.success('Password changed');
      } catch (error) {
        applyApiErrors(error, setErrors);
        toast.error(error.message);
      }
    },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Profile">
        {canEdit ? (
          <form onSubmit={profileForm.handleSubmit} className="grid gap-4">
            <FormField label="Full name" error={profileForm.errors.fullName}>
              <Input name="fullName" value={profileForm.values.fullName} onChange={profileForm.handleChange} />
            </FormField>
            <FormField label="Phone" error={profileForm.errors.phone}>
              <Input name="phone" value={profileForm.values.phone} onChange={profileForm.handleChange} />
            </FormField>
            <p className="text-sm text-muted">{user?.email}</p>
            <Button type="submit" loading={profileForm.submitting}>
              Save profile
            </Button>
          </form>
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd>{user?.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>{user?.email}</dd>
            </div>
            {user?.memberId ? (
              <div>
                <dt className="text-muted">Member ID</dt>
                <dd>{user.memberId}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </Card>
      <Card title="Change password">
        <form onSubmit={passwordForm.handleSubmit} className="grid gap-4">
          <FormField label="Current password" error={passwordForm.errors.currentPassword}>
            <Input name="currentPassword" type="password" value={passwordForm.values.currentPassword} onChange={passwordForm.handleChange} />
          </FormField>
          <FormField label="New password" error={passwordForm.errors.newPassword}>
            <Input name="newPassword" type="password" value={passwordForm.values.newPassword} onChange={passwordForm.handleChange} />
          </FormField>
          {passwordMessage ? <p className="text-sm text-success">{passwordMessage}</p> : null}
          <Button type="submit" loading={passwordForm.submitting}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
