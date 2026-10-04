const Attendance = require('../models/attendance.model');
const Member = require('../models/member.model');
const AppError = require('../utils/AppError');
const { getSettings } = require('./settings.service');
const { syncMembershipStatuses } = require('./membership.service');
const {
  getDateKey,
  formatDisplayTime,
  formatDisplayDate,
  formatInputTime,
  dateTimeInTimeZone,
  dateKeyToUtcDate,
  compareDateKeys,
  startOfMonth,
  endOfMonth,
  addDaysToDateKey,
  daysBetween,
  listDateKeys,
} = require('../utils/date');
const {
  ATTENDANCE_STATUS,
  MEMBERSHIP_STATUS,
  ACCOUNT_STATUS,
  HTTP_STATUS,
  MESSAGES,
  TIME,
  PAGINATION,
} = require('../constants');

async function findActiveMember(memberId) {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return member;
}

function presentational(record) {
  return {
    id: record.id,
    member: record.member && record.member.fullName
      ? {
          id: record.member.id || record.member._id,
          memberId: record.member.memberId,
          fullName: record.member.fullName,
          email: record.member.email,
        }
      : record.member,
    dateKey: record.dateKey,
    dateLabel: formatDisplayDate(dateKeyToUtcDate(record.dateKey)),
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    checkInLabel: formatDisplayTime(record.checkInAt),
    checkOutLabel: formatDisplayTime(record.checkOutAt),
    checkInTime: formatInputTime(record.checkInAt),
    checkOutTime: formatInputTime(record.checkOutAt),
    status: record.status,
    presence: ATTENDANCE_STATUS.PRESENT,
  };
}

async function checkIn(memberId) {
  await syncMembershipStatuses();
  const member = await findActiveMember(memberId);
  if (member.status !== ACCOUNT_STATUS.ACTIVE || member.membershipStatus !== MEMBERSHIP_STATUS.ACTIVE) {
    throw new AppError(MESSAGES.MEMBERSHIP_NOT_ACTIVE, HTTP_STATUS.BAD_REQUEST);
  }

  const dateKey = getDateKey();
  const existing = await Attendance.findOne({ member: member._id, dateKey });
  if (existing) {
    throw new AppError(MESSAGES.ALREADY_CHECKED_IN, HTTP_STATUS.CONFLICT);
  }

  try {
    const record = await Attendance.create({
      member: member._id,
      dateKey,
      checkInAt: new Date(),
      status: ATTENDANCE_STATUS.CHECKED_IN,
    });
    record.member = member;
    return presentational(record);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(MESSAGES.ALREADY_CHECKED_IN, HTTP_STATUS.CONFLICT);
    }
    throw error;
  }
}

async function checkOut(memberId) {
  const member = await findActiveMember(memberId);
  const dateKey = getDateKey();
  const record = await Attendance.findOne({ member: member._id, dateKey });
  if (!record) {
    throw new AppError(MESSAGES.CHECK_IN_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }
  if (record.checkOutAt) {
    throw new AppError(MESSAGES.ALREADY_CHECKED_OUT, HTTP_STATUS.CONFLICT);
  }
  record.checkOutAt = new Date();
  record.status = ATTENDANCE_STATUS.CHECKED_OUT;
  await record.save();
  record.member = member;
  return presentational(record);
}

async function listByDate(dateKey = getDateKey()) {
  const records = await Attendance.find({ dateKey }).populate('member', 'memberId fullName email').sort({ checkInAt: -1 });
  return records.map(presentational);
}

async function listRange({ from, to, memberId, page, limit }) {
  const filter = { dateKey: { $gte: from, $lte: to } };
  if (memberId) filter.member = memberId;
  const query = Attendance.find(filter).populate('member', 'memberId fullName email').sort({ dateKey: -1, checkInAt: -1 });
  if (page && limit) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Attendance.countDocuments(filter),
    ]);
    return {
      items: items.map(presentational),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    };
  }
  const items = await query;
  return { items: items.map(presentational) };
}

async function recordManualAttendance(memberId, { date, checkInTime, checkOutTime }) {
  if (compareDateKeys(date, getDateKey()) >= 0) {
    throw new AppError(MESSAGES.PAST_DATE_ONLY, HTTP_STATUS.BAD_REQUEST);
  }

  const member = await findActiveMember(memberId);
  if (member.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.BAD_REQUEST);
  }

  const existing = await Attendance.findOne({ member: member._id, dateKey: date });
  if (existing) {
    throw new AppError(MESSAGES.ALREADY_CHECKED_IN_ON_DATE, HTTP_STATUS.CONFLICT);
  }

  const checkInAt = dateTimeInTimeZone(date, checkInTime);
  const checkOutAt = dateTimeInTimeZone(date, checkOutTime);
  if (checkOutAt <= checkInAt) {
    throw new AppError(MESSAGES.CHECK_OUT_BEFORE_CHECK_IN, HTTP_STATUS.UNPROCESSABLE, [
      { field: 'checkOutTime', message: 'Check-out must be after check-in' },
    ]);
  }

  try {
    const record = await Attendance.create({
      member: member._id,
      dateKey: date,
      checkInAt,
      checkOutAt,
      status: ATTENDANCE_STATUS.CHECKED_OUT,
    });
    record.member = member;
    return presentational(record);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(MESSAGES.ALREADY_CHECKED_IN_ON_DATE, HTTP_STATUS.CONFLICT);
    }
    throw error;
  }
}

async function updateAttendance(id, body) {
  const record = await Attendance.findById(id).populate('member', 'memberId fullName email');
  if (!record) {
    throw new AppError(MESSAGES.ATTENDANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const checkInTime = String(body.checkInTime || '').trim();
  const checkOutTime = String(body.checkOutTime || '').trim();
  const checkInAt = dateTimeInTimeZone(record.dateKey, checkInTime);
  const checkOutAt = checkOutTime ? dateTimeInTimeZone(record.dateKey, checkOutTime) : null;
  if (checkOutAt && checkOutAt <= checkInAt) {
    throw new AppError(MESSAGES.CHECK_OUT_BEFORE_CHECK_IN, HTTP_STATUS.UNPROCESSABLE, [
      { field: 'checkOutTime', message: 'Check-out must be after check-in' },
    ]);
  }

  record.checkInAt = checkInAt;
  record.checkOutAt = checkOutAt;
  record.status = checkOutAt ? ATTENDANCE_STATUS.CHECKED_OUT : ATTENDANCE_STATUS.CHECKED_IN;
  await record.save();
  return presentational(record);
}

async function deleteAttendance(id) {
  const record = await Attendance.findByIdAndDelete(id);
  if (!record) {
    throw new AppError(MESSAGES.ATTENDANCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return { id };
}

async function getTodaySummary() {
  const settings = await getSettings();
  const dateKey = getDateKey();
  const [records, activeMembers] = await Promise.all([
    listByDate(dateKey),
    Member.countDocuments({ status: ACCOUNT_STATUS.ACTIVE, membershipStatus: MEMBERSHIP_STATUS.ACTIVE }),
  ]);
  const present = records.length;
  return {
    dateKey,
    checkoutRequired: settings.checkoutRequired,
    records,
    present,
    absent: Math.max(activeMembers - present, 0),
    activeMembers,
  };
}

async function getCalendar(month) {
  const monthKey = month || getDateKey().slice(0, 7);
  const from = `${monthKey}-01`;
  const to = endOfMonth(from);
  const records = await Attendance.find({ dateKey: { $gte: from, $lte: to } }).select('dateKey');
  const counts = records.reduce((map, record) => {
    map[record.dateKey] = (map[record.dateKey] || 0) + 1;
    return map;
  }, {});
  return { month: monthKey, from, to, days: counts };
}

async function getMonthAttendance(memberId, month) {
  const anchor = month ? `${month}-01` : getDateKey();
  const from = startOfMonth(anchor);
  const to = endOfMonth(anchor);
  const presentDays = await Attendance.countDocuments({
    member: memberId,
    dateKey: { $gte: from, $lte: to },
  });
  const monthDays = daysBetween(from, to) + 1;
  const percentage = monthDays > 0 ? Math.round((presentDays / monthDays) * 100) : 0;
  return { presentDays, monthDays, percentage, from, to };
}

async function getMemberHistory(memberId, query = {}) {
  await findActiveMember(memberId);
  const settings = await getSettings();
  const todayKey = getDateKey();
  const todayRecord = await Attendance.findOne({ member: memberId, dateKey: todayKey });
  const monthAttendance = await getMonthAttendance(memberId, query.month);
  const page = Number.parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Number.parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
  const history = await listRange({
    from: monthAttendance.from,
    to: monthAttendance.to,
    memberId,
    page,
    limit,
  });
  return {
    ...history,
    percentage: monthAttendance,
    from: monthAttendance.from,
    to: monthAttendance.to,
    today: todayRecord ? presentational(todayRecord) : null,
    checkoutRequired: settings.checkoutRequired,
  };
}

async function getPercentage({ from, to, memberId }) {
  const totalDays = daysBetween(from, to) + 1;
  if (memberId) {
    const presentDays = await Attendance.countDocuments({ member: memberId, dateKey: { $gte: from, $lte: to } });
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    return { presentDays, totalDays, percentage };
  }

  const activeMembers = await Member.countDocuments({ status: ACCOUNT_STATUS.ACTIVE });
  const presentRecords = await Attendance.countDocuments({ dateKey: { $gte: from, $lte: to } });
  const possible = activeMembers * totalDays;
  const percentage = possible > 0 ? Math.round((presentRecords / possible) * 100) : 0;
  return { presentRecords, totalDays, activeMembers, percentage };
}

async function getPresenceReport(dateKey) {
  const members = await Member.find({ status: ACCOUNT_STATUS.ACTIVE }).select('memberId fullName email membershipStatus');
  const records = await Attendance.find({ dateKey, member: { $in: members.map((member) => member._id) } });
  const presentIds = new Set(records.map((record) => String(record.member)));
  return members.map((member) => ({
    memberId: member.memberId,
    fullName: member.fullName,
    email: member.email,
    membershipStatus: member.membershipStatus,
    attendanceStatus: presentIds.has(String(member._id)) ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT,
  }));
}

async function getChartSeries(days = TIME.DASHBOARD_CHART_DAYS) {
  const end = getDateKey();
  const start = addDaysToDateKey(end, -(days - 1));
  const keys = listDateKeys(start, end);
  const records = await Attendance.find({ dateKey: { $gte: start, $lte: end } }).select('dateKey');
  const counts = records.reduce((map, record) => {
    map[record.dateKey] = (map[record.dateKey] || 0) + 1;
    return map;
  }, {});
  return keys.map((dateKey) => ({
    dateKey,
    label: formatDisplayDate(dateKeyToUtcDate(dateKey)),
    count: counts[dateKey] || 0,
  }));
}

module.exports = {
  checkIn,
  checkOut,
  recordManualAttendance,
  updateAttendance,
  deleteAttendance,
  listByDate,
  listRange,
  getTodaySummary,
  getCalendar,
  getMemberHistory,
  getMonthAttendance,
  getPercentage,
  getPresenceReport,
  getChartSeries,
  presentational,
};
