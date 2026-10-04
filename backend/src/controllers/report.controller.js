const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const reportService = require('../services/report.service');
const { MESSAGES } = require('../constants');

const getReport = asyncHandler(async (req, res) => {
  const data = await reportService.buildReport(req.query);
  const { rows, ...payload } = data;
  return sendSuccess(res, { message: MESSAGES.REPORT_FETCHED, data: payload });
});

const exportReport = asyncHandler(async (req, res) => {
  const file = await reportService.exportReport(req.query);
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.buffer);
});

module.exports = { getReport, exportReport };
