const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const planService = require('../services/plan.service');
const membershipService = require('../services/membership.service');
const { HTTP_STATUS, MESSAGES } = require('../constants');

const getPlans = asyncHandler(async (_req, res) => {
  const data = await planService.listPlans();
  return sendSuccess(res, { message: MESSAGES.PLANS_FETCHED, data });
});

const createPlan = asyncHandler(async (req, res) => {
  const data = await planService.createPlan(req.body);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.PLAN_CREATED, data });
});

const updatePlan = asyncHandler(async (req, res) => {
  const data = await planService.updatePlan(req.params.id, req.body);
  return sendSuccess(res, { message: MESSAGES.PLAN_UPDATED, data });
});

const deletePlan = asyncHandler(async (req, res) => {
  const data = await planService.deletePlan(req.params.id);
  return sendSuccess(res, { message: MESSAGES.PLAN_DELETED, data });
});

const sendExpiryReminders = asyncHandler(async (_req, res) => {
  const data = await membershipService.sendExpiryReminders();
  return sendSuccess(res, { message: MESSAGES.REMINDERS_SENT, data });
});

module.exports = { getPlans, createPlan, updatePlan, deletePlan, sendExpiryReminders };
