const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const announcementService = require('../services/announcement.service');
const { HTTP_STATUS, MESSAGES } = require('../constants');

const getAnnouncements = asyncHandler(async (req, res) => {
  const data = await announcementService.listAnnouncements(req.query);
  return sendSuccess(res, { message: MESSAGES.ANNOUNCEMENTS_FETCHED, data });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const data = await announcementService.createAnnouncement(req.body, req.user.id);
  return sendSuccess(res, { status: HTTP_STATUS.CREATED, message: MESSAGES.ANNOUNCEMENT_CREATED, data });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const data = await announcementService.updateAnnouncement(req.params.id, req.body);
  return sendSuccess(res, { message: MESSAGES.ANNOUNCEMENT_UPDATED, data });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const data = await announcementService.deleteAnnouncement(req.params.id);
  return sendSuccess(res, { message: MESSAGES.ANNOUNCEMENT_DELETED, data });
});

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
