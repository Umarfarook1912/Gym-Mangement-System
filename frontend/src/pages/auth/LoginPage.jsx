import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { applyApiErrors } from '../../utils/format';
import { validateLogin } from '../../validations';

export default function LoginPage() {
  const { login, homeFor } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: async (values, { setErrors }) => {
      try {
        const user = await login(values);
        navigate(homeFor(user.role));
      } catch (error) {
        applyApiErrors(error, setErrors);
        toast.error(error.message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Sign in</h2>
        <p className="mt-1 text-sm text-muted">Admin and member access</p>
      </div>
      <FormField label="Email" error={form.errors.email}>
        <Input name="email" type="email" value={form.values.email} onChange={form.handleChange} />
      </FormField>
      <FormField label="Password" error={form.errors.password}>
        <Input name="password" type="password" value={form.values.password} onChange={form.handleChange} />
      </FormField>
      <Button type="submit" loading={form.submitting}>
        Sign in
      </Button>
      <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary">
        Forgot password
      </Link>
    </form>
  );
}
