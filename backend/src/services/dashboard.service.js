const Member = require('../models/member.model');
const Announcement = require('../models/announcement.model');
const MembershipPlan = require('../models/membershipPlan.model');
const { ACCOUNT_STATUS, MEMBERSHIP_STATUS, TIME } = require('../constants');
const { getDateKey, addDaysToDateKey, formatDisplayDate, dateKeyToUtcDate } = require('../utils/date');
const { syncMembershipStatuses } = require('./membership.service');
const { getTodaySummary, getChartSeries, getMonthAttendance } = require('./attendance.service');
const { getMemberSelf } = require('./member.service');
const Attendance = require('../models/attendance.model');

async function getAdminDashboard() {
  await syncMembershipStatuses();
  const today = getDateKey();
  const expiryLimit = addDaysToDateKey(today, TIME.EXPIRY_REMINDER_DAYS);
  const [totalMembers, activeMembers, expiredMembers, todaySummary, chart, plans, recentMembers, expiringCount, expiring, recentAnnouncements] =
    await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ membershipStatus: MEMBERSHIP_STATUS.ACTIVE, status: ACCOUNT_STATUS.ACTIVE }),
      Member.countDocuments({ membershipStatus: MEMBERSHIP_STATUS.EXPIRED }),
      getTodaySummary(),
      getChartSeries(),
      MembershipPlan.find().select('name'),
      Member.find().sort({ createdAt: -1 }).limit(TIME.RECENT_ITEMS).select('fullName memberId createdAt membershipStatus'),
      Member.countDocuments({
        status: ACCOUNT_STATUS.ACTIVE,
        membershipStatus: MEMBERSHIP_STATUS.ACTIVE,
        membershipEndDate: { $gte: today, $lte: expiryLimit },
      }),
      Member.find({
        status: ACCOUNT_STATUS.ACTIVE,
        membershipStatus: MEMBERSHIP_STATUS.ACTIVE,
        membershipEndDate: { $gte: today, $lte: expiryLimit },
      })
        .sort({ membershipEndDate: 1 })
        .limit(TIME.RECENT_ITEMS)
        .select('fullName memberId membershipEndDate'),
      Announcement.find().sort({ createdAt: -1 }).limit(TIME.RECENT_ITEMS).select('title type createdAt'),
    ]);

  const planCounts = await Promise.all(
    plans.map(async (plan) => ({
      planName: plan.name,
      count: await Member.countDocuments({ membershipPlan: plan._id, status: ACCOUNT_STATUS.ACTIVE }),
    }))
  );

  const activities = [
    ...recentMembers.map((member) => ({
      id: `member-${member.id}`,
      message: `${member.fullName} joined as ${member.memberId}`,
      createdAt: member.createdAt,
    })),
    ...recentAnnouncements.map((item) => ({
      id: `announcement-${item.id}`,
      message: `Announcement published: ${item.title}`,
      createdAt: item.createdAt,
    })),
    ...todaySummary.records.slice(0, TIME.RECENT_ITEMS).map((record) => ({
      id: `attendance-${record.id}`,
      message: `${record.member?.fullName || 'A member'} checked in`,
      createdAt: record.checkInAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, TIME.RECENT_ITEMS);

  return {
    stats: {
      totalMembers,
      activeMembers,
      expiredMembers,
      todayAttendance: todaySummary.present,
      presentMembers: todaySummary.present,
      absentMembers: todaySummary.absent,
      expiringMemberships: expiringCount,
    },
    attendanceChart: chart,
    membershipStats: planCounts,
    recentMembers,
    expiring: expiring.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      memberId: member.memberId,
      membershipEndDate: member.membershipEndDate,
      endLabel: formatDisplayDate(dateKeyToUtcDate(member.membershipEndDate)),
    })),
    activities,
  };
}

async function getMemberDashboard(userId) {
  const member = await getMemberSelf(userId);
  const [recentAttendance, announcements, monthAttendance] = await Promise.all([
    Attendance.find({ member: userId }).sort({ dateKey: -1 }).limit(TIME.RECENT_ITEMS),
    Announcement.find().sort({ createdAt: -1 }).limit(TIME.RECENT_ITEMS).select('title body type createdAt'),
    getMonthAttendance(userId),
  ]);

  return {
    member,
    recentAttendance,
    announcements,
    monthAttendance,
  };
}

module.exports = { getAdminDashboard, getMemberDashboard };
