const Announcement = require('../models/announcement.model');
const Member = require('../models/member.model');
const AppError = require('../utils/AppError');
const { getPagination, buildPagedResult } = require('../helpers/pagination');
const { sendEmail } = require('./email.service');
const { announcementTemplate } = require('../templates/email.templates');
const { EMAIL_SUBJECTS, HTTP_STATUS, MESSAGES, ACCOUNT_STATUS } = require('../constants');
const logger = require('../utils/logger');

async function listAnnouncements(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.type) filter.type = query.type;
  const [items, total] = await Promise.all([
    Announcement.find(filter).populate('createdBy', 'fullName').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Announcement.countDocuments(filter),
  ]);
  return buildPagedResult({ items, total, page, limit });
}

async function createAnnouncement(payload, adminId) {
  const announcement = await Announcement.create({
    type: payload.type,
    title: payload.title.trim(),
    body: payload.body.trim(),
    sendEmail: Boolean(payload.sendEmail),
    createdBy: adminId,
  });

  if (announcement.sendEmail) {
    const members = await Member.find({ status: ACCOUNT_STATUS.ACTIVE }).select('email');
    await Promise.all(
      members.map(async (member) => {
        try {
          await sendEmail({
            to: member.email,
            subject: `${EMAIL_SUBJECTS.ANNOUNCEMENT}: ${announcement.title}`,
            html: announcementTemplate({ title: announcement.title, body: announcement.body, type: announcement.type }),
          });
        } catch (error) {
          logger.error('Announcement email failed', { message: error.message });
        }
      })
    );
  }

  return announcement.populate('createdBy', 'fullName');
}

async function updateAnnouncement(id, payload) {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AppError(MESSAGES.ANNOUNCEMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  announcement.type = payload.type;
  announcement.title = payload.title.trim();
  announcement.body = payload.body.trim();
  announcement.sendEmail = Boolean(payload.sendEmail);
  await announcement.save();
  return announcement.populate('createdBy', 'fullName');
}

async function deleteAnnouncement(id) {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw new AppError(MESSAGES.ANNOUNCEMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return { id };
}

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
