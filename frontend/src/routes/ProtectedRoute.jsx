import { Navigate, Outlet } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';
import { ROUTES, USER_ROLES } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState label="Checking session" />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (role && user.role !== role) {
    const destination = user.role === USER_ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.MEMBER_DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading, homeFor } = useAuth();
  if (loading) return <LoadingState label="Checking session" />;
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
