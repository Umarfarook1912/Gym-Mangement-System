import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES, USER_ROLES } from '../constants';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AdminAnnouncementsPage from '../pages/admin/AnnouncementsPage';
import AdminAttendancePage from '../pages/admin/AttendancePage';
import AdminDashboardPage from '../pages/admin/DashboardPage';
import MemberDetailPage from '../pages/admin/MemberDetailPage';
import MembersPage from '../pages/admin/MembersPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import PlansPage from '../pages/admin/PlansPage';
import AdminProfilePage from '../pages/admin/ProfilePage';
import ReportsPage from '../pages/admin/ReportsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import MemberAnnouncementsPage from '../pages/member/AnnouncementsPage';
import MemberAttendancePage from '../pages/member/AttendancePage';
import MemberDashboardPage from '../pages/member/DashboardPage';
import MembershipPage from '../pages/member/MembershipPage';
import MemberProfilePage from '../pages/member/ProfilePage';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_MEMBERS} element={<MembersPage />} />
          <Route path={ROUTES.ADMIN_PAYMENTS} element={<PaymentsPage />} />
          <Route path={ROUTES.ADMIN_MEMBER_DETAIL} element={<MemberDetailPage />} />
          <Route path={ROUTES.ADMIN_PLANS} element={<PlansPage />} />
          <Route path={ROUTES.ADMIN_ATTENDANCE} element={<AdminAttendancePage />} />
          <Route path={ROUTES.ADMIN_REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.ADMIN_ANNOUNCEMENTS} element={<AdminAnnouncementsPage />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role={USER_ROLES.MEMBER} />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.MEMBER_DASHBOARD} element={<MemberDashboardPage />} />
          <Route path={ROUTES.MEMBER_PROFILE} element={<MemberProfilePage />} />
          <Route path={ROUTES.MEMBER_MEMBERSHIP} element={<MembershipPage />} />
          <Route path={ROUTES.MEMBER_ATTENDANCE} element={<MemberAttendancePage />} />
          <Route path={ROUTES.MEMBER_ANNOUNCEMENTS} element={<MemberAnnouncementsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
