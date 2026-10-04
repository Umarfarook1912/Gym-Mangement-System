const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const settingsService = require('../services/settings.service');
const { MESSAGES } = require('../constants');

const getPublicSettings = asyncHandler(async (_req, res) => {
  const data = await settingsService.getPublicSettings();
  return sendSuccess(res, { message: MESSAGES.SETTINGS_FETCHED, data });
});

const getSettings = asyncHandler(async (_req, res) => {
  const data = await settingsService.getSettings();
  return sendSuccess(res, { message: MESSAGES.SETTINGS_FETCHED, data });
});

const updateSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.updateSettings(req.body);
  return sendSuccess(res, { message: MESSAGES.SETTINGS_UPDATED, data });
});

module.exports = { getPublicSettings, getSettings, updateSettings };
