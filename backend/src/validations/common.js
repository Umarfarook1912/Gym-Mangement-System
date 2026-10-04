const { LIMITS } = require('../constants');
const { isValidDateKey, isValidTime } = require('../utils/date');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

function required(field, message) {
  return { field, message };
}

function checkName(value, field = 'fullName') {
  const name = typeof value === 'string' ? value.trim() : '';
  if (name.length < LIMITS.NAME_MIN || name.length > LIMITS.NAME_MAX) {
    return required(field, `Enter ${LIMITS.NAME_MIN}-${LIMITS.NAME_MAX} characters`);
  }
  return null;
}

function checkEmail(value) {
  const email = typeof value === 'string' ? value.trim() : '';
  if (!email || email.length > LIMITS.EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    return required('email', 'Enter a valid email address');
  }
  return null;
}

function checkPassword(value, field = 'password') {
  const password = typeof value === 'string' ? value : '';
  if (password.length < LIMITS.PASSWORD_MIN || password.length > LIMITS.PASSWORD_MAX) {
    return required(field, `Password must be ${LIMITS.PASSWORD_MIN}-${LIMITS.PASSWORD_MAX} characters`);
  }
  return null;
}

function checkPhone(value, field = 'phone', optional = false) {
  const phone = typeof value === 'string' ? value.trim() : '';
  if (!phone && optional) return null;
  if (!PHONE_PATTERN.test(phone)) {
    return required(field, 'Enter a valid phone number');
  }
  return null;
}

function checkDateKey(value, field) {
  if (!isValidDateKey(value)) {
    return required(field, 'Enter a valid date');
  }
  return null;
}

function checkTime(value, field) {
  if (!isValidTime(value)) {
    return required(field, 'Enter a valid time');
  }
  return null;
}

function compactErrors(items) {
  return items.filter(Boolean);
}

module.exports = {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  checkName,
  checkEmail,
  checkPassword,
  checkPhone,
  checkDateKey,
  checkTime,
  compactErrors,
};
