const { GENDER, ACCOUNT_STATUS, LIMITS } = require('../constants');
const { checkName, checkEmail, checkPhone, checkDateKey, compactErrors } = require('./common');

function memberSchema({ body }) {
  const height = body.height === '' || body.height === null || body.height === undefined ? null : Number(body.height);
  const weight = body.weight === '' || body.weight === null || body.weight === undefined ? null : Number(body.weight);

  return compactErrors([
    checkName(body.fullName),
    checkEmail(body.email),
    checkPhone(body.phone),
    checkDateKey(body.dateOfBirth, 'dateOfBirth'),
    !Object.values(GENDER).includes(body.gender) ? { field: 'gender', message: 'Select a gender' } : null,
    typeof body.address === 'string' && body.address.length > LIMITS.ADDRESS_MAX
      ? { field: 'address', message: 'Address is too long' }
      : null,
    checkDateKey(body.joinDate, 'joinDate'),
    !body.membershipPlan ? { field: 'membershipPlan', message: 'Select a membership plan' } : null,
    checkDateKey(body.membershipStartDate, 'membershipStartDate'),
    body.emergencyContactName && checkName(body.emergencyContactName, 'emergencyContactName'),
    body.emergencyContactPhone ? checkPhone(body.emergencyContactPhone, 'emergencyContactPhone') : null,
    height !== null && (Number.isNaN(height) || height <= 0) ? { field: 'height', message: 'Enter a valid height' } : null,
    weight !== null && (Number.isNaN(weight) || weight <= 0) ? { field: 'weight', message: 'Enter a valid weight' } : null,
    body.status && !Object.values(ACCOUNT_STATUS).includes(body.status)
      ? { field: 'status', message: 'Select a valid status' }
      : null,
  ]);
}

function paymentSchema({ body }) {
  return compactErrors([
    !body.membershipPlan ? { field: 'membershipPlan', message: 'Select a membership plan' } : null,
  ]);
}

module.exports = { memberSchema, paymentSchema };
