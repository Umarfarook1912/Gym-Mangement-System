const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
};

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const PLAN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  PRESENT: 'present',
  ABSENT: 'absent',
};

const ANNOUNCEMENT_TYPES = {
  TIMING: 'timing',
  MAINTENANCE: 'maintenance',
  IMPORTANT: 'important',
};

const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  MEMBER: 'member',
  PRESENCE: 'presence',
  PERCENTAGE: 'percentage',
  RANGE: 'range',
};

const EXPORT_FORMATS = {
  CSV: 'csv',
  PDF: 'pdf',
};

const PLAN_DEFAULTS = [
  { name: 'Monthly', durationMonths: 1, price: 1000 },
  { name: 'Quarterly', durationMonths: 3, price: 2500 },
  { name: 'Half-Yearly', durationMonths: 6, price: 5000 },
  { name: 'Yearly', durationMonths: 12, price: 10000 },
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  EXPORT_MAX: 5000,
};

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  EMAIL_MAX: 120,
  PHONE_MIN: 10,
  PHONE_MAX: 15,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
  ADDRESS_MAX: 240,
  TITLE_MAX: 120,
  BODY_MAX: 2000,
  MEMBER_ID_PAD: 4,
  TEMP_PASSWORD_LENGTH: 10,
  SEARCH_MAX: 80,
};

const MEMBER_ID_PREFIX = 'GYM-';

const TIME = {
  RESET_TOKEN_TTL_MS: 60 * 60 * 1000,
  EXPIRY_REMINDER_DAYS: 7,
  DASHBOARD_CHART_DAYS: 7,
  RECENT_ITEMS: 6,
  WEEK_START_DAY: 1,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 30,
  JSON_BODY_LIMIT: '1mb',
  BCRYPT_ROUNDS: 12,
};

const DATE_FORMAT = {
  KEY: 'YYYY-MM-DD',
  DISPLAY: 'DD MMM YYYY',
  TIME: 'hh:mm A',
};

const EMAIL_SUBJECTS = {
  REGISTRATION: 'Welcome to the gym',
  EXPIRY_REMINDER: 'Your membership ends today',
  ANNOUNCEMENT: 'Gym announcement',
  PASSWORD_RESET: 'Reset your password',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_INACTIVE: 'This account is inactive',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have access to this resource',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'If the account exists, a reset link has been sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  INVALID_RESET_TOKEN: 'Reset link is invalid or has expired',
  PROFILE_FETCHED: 'Profile fetched successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  MEMBERS_FETCHED: 'Members fetched successfully',
  MEMBER_FETCHED: 'Member fetched successfully',
  MEMBER_CREATED: 'Member created successfully',
  MEMBER_UPDATED: 'Member updated successfully',
  MEMBER_DELETED: 'Member deleted successfully',
  PAYMENT_RECORDED: 'Payment recorded successfully',
  PAYMENT_ALREADY_RECORDED: 'This period is already marked as paid',
  MEMBER_NOT_FOUND: 'Member not found',
  PLANS_FETCHED: 'Membership plans fetched successfully',
  PLAN_CREATED: 'Membership plan created successfully',
  PLAN_UPDATED: 'Membership plan updated successfully',
  PLAN_DELETED: 'Membership plan deleted successfully',
  PLAN_NOT_FOUND: 'Membership plan not found',
  PLAN_IN_USE: 'Plan is assigned to members and cannot be deleted',
  PLAN_NAME_EXISTS: 'A plan with this name already exists',
  PLAN_INACTIVE: 'Selected membership plan is inactive',
  ATTENDANCE_FETCHED: 'Attendance fetched successfully',
  CHECK_IN_SUCCESS: 'Checked in successfully',
  CHECK_OUT_SUCCESS: 'Checked out successfully',
  ATTENDANCE_UPDATED: 'Attendance updated successfully',
  ATTENDANCE_RECORDED: 'Attendance recorded successfully',
  PAST_DATE_ONLY: 'Start and end times can be entered for a previous day',
  ATTENDANCE_DELETED: 'Attendance deleted successfully',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found',
  CHECK_OUT_BEFORE_CHECK_IN: 'Check-out must be after check-in',
  ALREADY_CHECKED_IN: 'Member has already checked in today',
  ALREADY_CHECKED_IN_ON_DATE: 'This member already has a check-in on that day',
  CHECK_IN_REQUIRED: 'Member has not checked in today',
  ALREADY_CHECKED_OUT: 'Member has already checked out today',
  MEMBERSHIP_NOT_ACTIVE: 'Only members with an active membership can check in',
  ANNOUNCEMENTS_FETCHED: 'Announcements fetched successfully',
  ANNOUNCEMENT_CREATED: 'Announcement created successfully',
  ANNOUNCEMENT_UPDATED: 'Announcement updated successfully',
  ANNOUNCEMENT_DELETED: 'Announcement deleted successfully',
  ANNOUNCEMENT_NOT_FOUND: 'Announcement not found',
  SETTINGS_FETCHED: 'Gym settings fetched successfully',
  SETTINGS_UPDATED: 'Gym settings updated successfully',
  DASHBOARD_FETCHED: 'Dashboard fetched successfully',
  REPORT_FETCHED: 'Report fetched successfully',
  ADMINS_FETCHED: 'Admins fetched successfully',
  ADMIN_CREATED: 'Admin created successfully',
  ADMIN_DELETED: 'Admin deleted successfully',
  ADMIN_UPDATED: 'Admin updated successfully',
  ADMIN_NOT_FOUND: 'Admin not found',
  CANNOT_DELETE_SELF: 'You cannot delete your own admin account',
  LAST_ADMIN: 'At least one admin account is required',
  REMINDERS_SENT: 'Membership expiry reminders processed',
  VALIDATION_FAILED: 'Please correct the highlighted fields',
  DUPLICATE_EMAIL: 'An account with this email already exists',
  DUPLICATE_RECORD: 'This record already exists',
  INVALID_ID: 'Invalid identifier',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  DATABASE_NOT_CONFIGURED: 'Database is not configured',
  DATABASE_CONNECTION_FAILED: 'Unable to connect to the database',
  EMAIL_EXISTS: 'Email is already in use',
  HEALTH_OK: 'Service is healthy',
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
  SEED_COMPLETE: 'Seed completed',
  SEED_ADMIN_MISSING: 'Seed admin credentials are missing',
};

const DEFAULT_GYM_NAME = 'Apex Gym';

const WORKING_DAYS = [1, 2, 3, 4, 5, 6];

const DEFAULT_GYM_HOURS = {
  openTime: '06:00',
  closeTime: '22:00',
};

module.exports = {
  USER_ROLES,
  MEMBERSHIP_STATUS,
  ACCOUNT_STATUS,
  PLAN_STATUS,
  ATTENDANCE_STATUS,
  ANNOUNCEMENT_TYPES,
  GENDER,
  REPORT_TYPES,
  EXPORT_FORMATS,
  PLAN_DEFAULTS,
  PAGINATION,
  LIMITS,
  MEMBER_ID_PREFIX,
  TIME,
  DATE_FORMAT,
  EMAIL_SUBJECTS,
  HTTP_STATUS,
  MESSAGES,
  DEFAULT_GYM_NAME,
  WORKING_DAYS,
  DEFAULT_GYM_HOURS,
};
