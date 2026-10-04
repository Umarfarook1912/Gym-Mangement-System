const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const memberService = require('../services/member.service');
const membershipService = require('../services/membership.service');
const attendanceService = require('../services/attendance.service');
const { HTTP_STATUS, MESSAGES } = require('../constants');

const getMembers = asyncHandler(async (req, res) => {
  const data = await memberService.listMembers(req.query);
  return sendSuccess(res, { message: MESSAGES.MEMBERS_FETCHED, data });
});

const getMember = asyncHandler(async (req, res) => {
  const data = await memberService.getMember(req.params.id);
  return sendSuccess(res, { message: MESSAGES.MEMBER_FETCHED, data });
});

const createMember = asyncHandler(async (req, res) => {
  const data = await memberService.createMember(req.body);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.MEMBER_CREATED, data });
});

const updateMember = asyncHandler(async (req, res) => {
  const data = await memberService.updateMember(req.params.id, req.body);
  return sendSuccess(res, { message: MESSAGES.MEMBER_UPDATED, data });
});

const deleteMember = asyncHandler(async (req, res) => {
  const data = await memberService.deleteMember(req.params.id);
  return sendSuccess(res, { message: MESSAGES.MEMBER_DELETED, data });
});

const getMemberAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getMemberHistory(req.params.id, req.query);
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

const getOwnMembership = asyncHandler(async (req, res) => {
  const data = await memberService.getOwnMembership(req.user.id);
  return sendSuccess(res, { message: MESSAGES.MEMBER_FETCHED, data });
});

const recordPayment = asyncHandler(async (req, res) => {
  const data = await membershipService.recordRenewal(req.params.id, req.body.membershipPlan);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.PAYMENT_RECORDED, data });
});

const getOwnAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getMemberHistory(req.user.id, req.query);
  return sendSuccess(res, { message: MESSAGES.ATTENDANCE_FETCHED, data });
});

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberAttendance,
  getOwnMembership,
  getOwnAttendance,
  recordPayment,
};
