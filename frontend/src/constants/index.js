export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const PLAN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  PRESENT: 'present',
  ABSENT: 'absent',
};

export const ANNOUNCEMENT_TYPES = {
  TIMING: 'timing',
  MAINTENANCE: 'maintenance',
  IMPORTANT: 'important',
};

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  MEMBER: 'member',
  PRESENCE: 'presence',
  PERCENTAGE: 'percentage',
  RANGE: 'range',
};

export const EXPORT_FORMATS = {
  CSV: 'csv',
  PDF: 'pdf',
};

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MEMBER_DETAIL: '/admin/members/:id',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PLANS: '/admin/membership-plans',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PROFILE: '/admin/profile',
  MEMBER_DASHBOARD: '/member/dashboard',
  MEMBER_PROFILE: '/member/profile',
  MEMBER_MEMBERSHIP: '/member/membership',
  MEMBER_ATTENDANCE: '/member/attendance',
  MEMBER_ANNOUNCEMENTS: '/member/announcements',
};

export const API = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  ADMINS: '/api/auth/admins',
  MEMBERS: '/api/admin/members',
  PLANS: '/api/admin/plans',
  PLAN_REMINDERS: '/api/admin/plans/reminders',
  ATTENDANCE: '/api/admin/attendance',
  ANNOUNCEMENTS: '/api/admin/announcements',
  SETTINGS: '/api/admin/settings',
  REPORTS: '/api/admin/reports',
  ADMIN_DASHBOARD: '/api/dashboard/admin',
  MEMBER_DASHBOARD: '/api/dashboard/member',
  MEMBER_MEMBERSHIP: '/api/member/membership',
  MEMBER_ATTENDANCE: '/api/member/attendance',
  MEMBER_ANNOUNCEMENTS: '/api/member/announcements',
  GYM: '/api/gym',
};

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const STORAGE_KEYS = {
  TOKEN: 'gym_auth_token',
  THEME: 'gym_theme',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const TIME = {
  TOAST_DURATION: 4000,
  SEARCH_DEBOUNCE: 400,
};

export const APP_NAME = 'Apex Gym';
export const TIMEZONE = 'Asia/Kolkata';

export const STATUS_LABELS = {
  active: 'Active',
  expired: 'Expired',
  inactive: 'Inactive',
  present: 'Present',
  absent: 'Absent',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  timing: 'Gym timing',
  maintenance: 'Maintenance',
  important: 'Important',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  current: 'Current',
  upcoming: 'Upcoming',
  paid: 'Paid',
};

export const WEEK_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const MESSAGES = {
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  LOGIN_REQUIRED: 'Please sign in to continue.',
  REQUIRED: 'This field is required',
  SAVED: 'Saved successfully',
  DELETED: 'Deleted successfully',
};

export const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

export const NAV_ITEMS = {
  [USER_ROLES.ADMIN]: [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD },
    { label: 'Members', to: ROUTES.ADMIN_MEMBERS },
    { label: 'Payments', to: ROUTES.ADMIN_PAYMENTS },
    { label: 'Plans', to: ROUTES.ADMIN_PLANS },
    { label: 'Attendance', to: ROUTES.ADMIN_ATTENDANCE },
    { label: 'Reports', to: ROUTES.ADMIN_REPORTS },
    { label: 'Announcements', to: ROUTES.ADMIN_ANNOUNCEMENTS },
    { label: 'Settings', to: ROUTES.ADMIN_SETTINGS },
  ],
  [USER_ROLES.MEMBER]: [
    { label: 'Dashboard', to: ROUTES.MEMBER_DASHBOARD },
    { label: 'Payments', to: ROUTES.MEMBER_MEMBERSHIP },
    { label: 'Attendance', to: ROUTES.MEMBER_ATTENDANCE },
    { label: 'Announcements', to: ROUTES.MEMBER_ANNOUNCEMENTS },
    { label: 'Profile', to: ROUTES.MEMBER_PROFILE },
  ],
};
