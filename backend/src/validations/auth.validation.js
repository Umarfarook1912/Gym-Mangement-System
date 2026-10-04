const { checkEmail, checkPassword, checkName, checkPhone, compactErrors } = require('./common');

const loginSchema = ({ body }) => compactErrors([checkEmail(body.email), checkPassword(body.password)]);

const forgotSchema = ({ body }) => compactErrors([checkEmail(body.email)]);

const resetSchema = ({ body }) =>
  compactErrors([
    !body.token ? { field: 'token', message: 'Reset token is required' } : null,
    checkPassword(body.password),
  ]);

const changePasswordSchema = ({ body }) =>
  compactErrors([checkPassword(body.currentPassword, 'currentPassword'), checkPassword(body.newPassword, 'newPassword')]);

const adminProfileSchema = ({ body }) => compactErrors([checkName(body.fullName), checkPhone(body.phone, 'phone', true)]);

const createAdminSchema = ({ body }) =>
  compactErrors([checkName(body.fullName), checkEmail(body.email), checkPassword(body.password), checkPhone(body.phone, 'phone', true)]);

const updateAdminSchema = ({ body }) =>
  compactErrors([
    checkName(body.fullName),
    checkEmail(body.email),
    checkPhone(body.phone, 'phone', true),
    body.password ? checkPassword(body.password) : null,
  ]);

module.exports = {
  loginSchema,
  forgotSchema,
  resetSchema,
  changePasswordSchema,
  adminProfileSchema,
  createAdminSchema,
  updateAdminSchema,
};
