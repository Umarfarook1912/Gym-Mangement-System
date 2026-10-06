const Announcement = require('../models/announcement.model');
const Member = require('../models/member.model');
const AppError = require('../utils/AppError');
const { getPagination, buildPagedResult } = require('../helpers/pagination');
const { sendEmail } = require('./email.service');
const { announcementTemplate } = require('../templates/email.templates');
const { EMAIL_SUBJECTS, HTTP_STATUS, MESSAGES, ACCOUNT_STATUS, ANNOUNCEMENT_TYPES } = require('../constants');
const { dateKeyToUtcDate, formatDisplayDate } = require('../utils/date');
const logger = require('../utils/logger');

function formatClockLabel(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return '';
  const [hour, minute] = value.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function displayDate(value) {
  return value ? formatDisplayDate(dateKeyToUtcDate(value)) : '';
}

function mapAnnouncement(payload) {
  const sendEmail = Boolean(payload.sendEmail);
  if (payload.type === ANNOUNCEMENT_TYPES.TIMING) {
    const note = (payload.body || '').trim();
    return {
      type: payload.type,
      title: `Gym timing · ${formatClockLabel(payload.openTime)} – ${formatClockLabel(payload.closeTime)}`,
      body: note,
      openTime: payload.openTime,
      closeTime: payload.closeTime,
      effectiveDate: payload.effectiveDate,
      startDate: '',
      endDate: '',
      sendEmail,
    };
  }
  if (payload.type === ANNOUNCEMENT_TYPES.MAINTENANCE) {
    return {
      type: payload.type,
      title: `Maintenance · ${displayDate(payload.startDate)} – ${displayDate(payload.endDate)}`,
      body: payload.body.trim(),
      openTime: '',
      closeTime: '',
      effectiveDate: '',
      startDate: payload.startDate,
      endDate: payload.endDate,
      sendEmail,
    };
  }
  return {
    type: payload.type,
    title: payload.title.trim(),
    body: payload.body.trim(),
    openTime: '',
    closeTime: '',
    effectiveDate: '',
    startDate: '',
    endDate: '',
    sendEmail,
  };
}

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
    ...mapAnnouncement(payload),
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
            html: announcementTemplate({
              title: announcement.title,
              body: announcement.body,
              type: announcement.type,
              openTime: formatClockLabel(announcement.openTime),
              closeTime: formatClockLabel(announcement.closeTime),
              effectiveDate: displayDate(announcement.effectiveDate),
              startDate: displayDate(announcement.startDate),
              endDate: displayDate(announcement.endDate),
            }),
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
  Object.assign(announcement, mapAnnouncement(payload));
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
