import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import { APP_NAME } from '../constants';
import { useFetch } from '../hooks/useFetch';
import { getPublicGym } from '../services/settingsService';

export default function AuthLayout() {
  const { data } = useFetch(() => getPublicGym(), []);
  const gymName = data?.gymName || APP_NAME;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-primary">Members club</p>
        <h1 className="mb-6 text-3xl font-semibold">{gymName}</h1>
        <div className="panel p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
