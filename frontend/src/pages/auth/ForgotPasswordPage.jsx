import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import { ROUTES } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { forgotPassword } from '../../services/authService';
import { validateForgot } from '../../validations';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const form = useForm({
    initialValues: { email: '' },
    validate: validateForgot,
    onSubmit: async (values) => {
      try {
        await forgotPassword(values);
        toast.success('If the account exists, a reset link has been sent');
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Forgot password</h2>
        <p className="mt-1 text-sm text-muted">We will email a reset link if the account exists.</p>
      </div>
      <FormField label="Email" error={form.errors.email}>
        <Input name="email" type="email" value={form.values.email} onChange={form.handleChange} />
      </FormField>
      <Button type="submit" loading={form.submitting}>
        Send reset link
      </Button>
      <Link to={ROUTES.LOGIN} className="text-sm text-primary">
        Back to sign in
      </Link>
    </form>
  );
}
