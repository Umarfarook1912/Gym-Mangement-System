import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { APP_NAME, ROUTES, USER_ROLES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getPublicGym } from '../services/settingsService';
import { formatClock } from '../utils/date';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data } = useFetch(() => getPublicGym(), []);
  const gymName = data?.gymName || APP_NAME;
  const hoursLabel =
    user?.role === USER_ROLES.MEMBER && data?.openTime && data?.closeTime
      ? `${formatClock(data.openTime)} – ${formatClock(data.closeTime)}`
      : '';

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:overflow-visible">
      {open ? <button type="button" className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <Sidebar role={user?.role} gymName={gymName} open={open} onNavigate={() => setOpen(false)} />
      <div className="flex h-screen min-w-0 flex-1 flex-col print:h-auto">
        <Navbar user={user} gymName={gymName} hoursLabel={hoursLabel} onMenu={() => setOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 print:overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
