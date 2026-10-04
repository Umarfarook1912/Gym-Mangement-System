const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const attendanceService = require('../services/attendance.service');
const { MESSAGES, PAGINATION, HTTP_STATUS } = require('../constants');
const { getDateKey, endOfMonth } = require('../utils/date');

const checkIn = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkIn(req.body.memberId);
  return sendSuccess(res, { message: MESSAGES.CHECK_IN_SUCCESS, data });
});

const checkOut = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkOut(req.body.memberId);
  return sendSuccess(res, { message: MESSAGES.CHECK_OUT_SUCCESS, data });
});

const recordManual = asyncHandler(async (req, res) => {
  const data = await attendanceService.recordManualAttendance(req.body.memberId, req.body);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.ATTENDANCE_RECORDED, data });
});

const checkInSelf = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkIn(req.user.id);
  return sendSuccess(res, { message: MESSAGES.CHECK_IN_SUCCESS, data });
});

const checkOutSelf = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkOut(req.user.id);
  return sendSuccess(res, { message: MESSAGES.CHECK_OUT_SUCCESS, data });
});

const getToday = asyncHandler(async (_req, res) => {
  const data = await attendanceService.getTodaySummary();
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

const getCalendar = asyncHandler(async (req, res) => {
  const data = await attendanceService.getCalendar(req.query.month);
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

const getByDate = asyncHandler(async (req, res) => {
  const data = await attendanceService.listByDate(req.query.date || getDateKey());
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

const getMonthly = asyncHandler(async (req, res) => {
  const month = req.query.month || getDateKey().slice(0, 7);
  const data = await attendanceService.listRange({
    from: `${month}-01`,
    to: endOfMonth(`${month}-01`),
    page: Number.parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE,
    limit: Number.parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
  });
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.updateAttendance(req.params.id, req.body);
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_UPDATED, data });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.deleteAttendance(req.params.id);
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_DELETED, data });
});

module.exports = {
  checkIn,
  checkOut,
  recordManual,
  checkInSelf,
  checkOutSelf,
  getToday,
  getCalendar,
  getByDate,
  getMonthly,
  updateAttendance,
  deleteAttendance,
};
