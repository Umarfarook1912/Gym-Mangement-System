import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import { ROUTES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { resetPassword } from '../../services/authService';
import { applyApiErrors } from '../../utils/format';
import { validateReset } from '../../validations';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = params.get('token') || '';
  const form = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: validateReset,
    onSubmit: async (values, { setErrors }) => {
      try {
        await resetPassword({ token, password: values.password });
        toast.success('Password reset successfully');
        navigate(ROUTES.LOGIN);
      } catch (error) {
        applyApiErrors(error, setErrors);
        toast.error(error.message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Reset password</h2>
        <p className="mt-1 text-sm text-muted">Choose a new password for your account.</p>
      </div>
      {!token ? <p className="text-sm text-danger">This reset link is missing a token.</p> : null}
      <FormField label="New password" error={form.errors.password}>
        <Input name="password" type="password" value={form.values.password} onChange={form.handleChange} />
      </FormField>
      <FormField label="Confirm password" error={form.errors.confirmPassword}>
        <Input name="confirmPassword" type="password" value={form.values.confirmPassword} onChange={form.handleChange} />
      </FormField>
      <Button type="submit" loading={form.submitting} disabled={!token}>
        Update password
      </Button>
      <Link to={ROUTES.LOGIN} className="text-sm text-primary">
        Back to sign in
      </Link>
    </form>
  );
}
