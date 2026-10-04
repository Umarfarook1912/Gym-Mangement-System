const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');
const { MESSAGES } = require('../constants');

const getAdminDashboard = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return sendSuccess(res, { message: MESSAGES.DASHBOARD_FETCHED, data });
});

const getMemberDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMemberDashboard(req.user.id);
  return sendSuccess(res, { message: MESSAGES.DASHBOARD_FETCHED, data });
});

module.exports = { getAdminDashboard, getMemberDashboard };
