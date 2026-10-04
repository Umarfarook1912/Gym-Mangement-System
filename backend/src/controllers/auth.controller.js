const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const { HTTP_STATUS, MESSAGES } = require('../constants');

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, { message: MESSAGES.LOGIN_SUCCESS, data });
});

const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { message: MESSAGES.LOGOUT_SUCCESS, data: null });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user);
  return sendSuccess(res, { message: MESSAGES.PROFILE_FETCHED, data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateAdminProfile(req.user.id, req.body);
  return sendSuccess(res, { message: MESSAGES.PROFILE_UPDATED, data });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body);
  return sendSuccess(res, { message: MESSAGES.PASSWORD_CHANGED, data: null });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return sendSuccess(res, { message: MESSAGES.PASSWORD_RESET_SENT, data: null });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, { message: MESSAGES.PASSWORD_RESET_SUCCESS, data: null });
});

const listAdmins = asyncHandler(async (_req, res) => {
  const data = await authService.listAdmins();
  return sendSuccess(res, { message: MESSAGES.ADMINS_FETCHED, data });
});

const createAdmin = asyncHandler(async (req, res) => {
  const data = await authService.createAdmin(req.body);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.ADMIN_CREATED, data });
});

const updateAdmin = asyncHandler(async (req, res) => {
  const data = await authService.updateAdmin(req.params.id, req.body);
  return sendSuccess(res, { message: MESSAGES.ADMIN_UPDATED, data });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const data = await authService.deleteAdmin(req.params.id, req.user.id);
  return sendSuccess(res, { message: MESSAGES.ADMIN_DELETED, data });
});

module.exports = {
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
