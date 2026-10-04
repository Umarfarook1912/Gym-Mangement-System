import { LIMITS } from './limits';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

export function validateLogin(values) {
  const errors = {};
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  if (!values.password || values.password.length < LIMITS.PASSWORD_MIN) errors.password = `Use at least ${LIMITS.PASSWORD_MIN} characters`;
  return errors;
}

export function validateForgot(values) {
  const errors = {};
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  return errors;
}

export function validateReset(values) {
  const errors = {};
  if (!values.password || values.password.length < LIMITS.PASSWORD_MIN) errors.password = `Use at least ${LIMITS.PASSWORD_MIN} characters`;
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validatePasswordChange(values) {
  const errors = {};
  if (!values.currentPassword) errors.currentPassword = 'Enter your current password';
  if (!values.newPassword || values.newPassword.length < LIMITS.PASSWORD_MIN) {
    errors.newPassword = `Use at least ${LIMITS.PASSWORD_MIN} characters`;
  }
  return errors;
}

export function validateProfile(values) {
  const errors = {};
  if (!values.fullName || values.fullName.trim().length < LIMITS.NAME_MIN) errors.fullName = 'Enter your name';
  if (values.phone && !PHONE_PATTERN.test(values.phone)) errors.phone = 'Enter a valid phone number';
  return errors;
}

export function validateMember(values) {
  const errors = {};
  if (!values.fullName || values.fullName.trim().length < LIMITS.NAME_MIN) errors.fullName = 'Enter the full name';
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  if (!PHONE_PATTERN.test(values.phone || '')) errors.phone = 'Enter a valid phone number';
  if (!values.dateOfBirth) errors.dateOfBirth = 'Select a date of birth';
  if (!values.gender) errors.gender = 'Select a gender';
  if (!values.joinDate) errors.joinDate = 'Select a join date';
  if (!values.membershipPlan) errors.membershipPlan = 'Select a plan';
  if (!values.membershipStartDate) errors.membershipStartDate = 'Select a start date';
  if (values.emergencyContactPhone && !PHONE_PATTERN.test(values.emergencyContactPhone)) {
    errors.emergencyContactPhone = 'Enter a valid phone number';
  }
  return errors;
}

export function validatePlan(values) {
  const errors = {};
  if (!values.name || values.name.trim().length < LIMITS.NAME_MIN) errors.name = 'Enter the plan name';
  if (!values.durationMonths || Number(values.durationMonths) < 1) errors.durationMonths = 'Duration must be at least 1 month';
  if (values.price === '' || Number(values.price) < 0) errors.price = 'Enter a valid price';
  return errors;
}

export function validateAnnouncement(values) {
  const errors = {};
  if (!values.type) errors.type = 'Select a type';
  if (!values.title?.trim()) errors.title = 'Enter a title';
  if (!values.body?.trim()) errors.body = 'Enter the announcement';
  return errors;
}

export function validateSettings(values) {
  const errors = {};
  if (!values.gymName?.trim()) errors.gymName = 'Enter the gym name';
  if (!values.openTime) errors.openTime = 'Select an opening time';
  if (!values.closeTime) errors.closeTime = 'Select a closing time';
  return errors;
}

export function validateAdmin(values, { passwordOptional = false } = {}) {
  const errors = {};
  if (!values.fullName || values.fullName.trim().length < LIMITS.NAME_MIN) errors.fullName = 'Enter the name';
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  if (!passwordOptional || values.password) {
    if (!values.password || values.password.length < LIMITS.PASSWORD_MIN) {
      errors.password = `Use at least ${LIMITS.PASSWORD_MIN} characters`;
    }
  }
  return errors;
}

export function validateAttendanceTimes(values) {
  const errors = {};
  if (!values.checkInTime) errors.checkInTime = 'Enter a check-in time';
  if (values.checkOutTime && values.checkInTime && values.checkOutTime <= values.checkInTime) {
    errors.checkOutTime = 'Check-out must be after check-in';
  }
  return errors;
}

export function validatePastAttendance(values) {
  const errors = validateAttendanceTimes(values);
  if (!values.checkOutTime) errors.checkOutTime = 'Enter an end time';
  return errors;
}
