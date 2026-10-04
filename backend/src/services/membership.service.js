const Member = require('../models/member.model');
const MembershipPayment = require('../models/membershipPayment.model');
const MembershipPlan = require('../models/membershipPlan.model');
const AppError = require('../utils/AppError');
const { MEMBERSHIP_STATUS, ACCOUNT_STATUS, EMAIL_SUBJECTS, MESSAGES, HTTP_STATUS } = require('../constants');
const { getDateKey, addMonthsToDateKey, compareDateKeys, formatDisplayDate, dateKeyToUtcDate, nextPeriodStart } = require('../utils/date');
const { sendEmail } = require('./email.service');
const { expiryTemplate } = require('../templates/email.templates');
const { getActivePlan } = require('./plan.service');
const logger = require('../utils/logger');

function resolveMembershipStatus({ accountStatus, membershipEndDate, todayKey = getDateKey() }) {
  if (accountStatus === ACCOUNT_STATUS.INACTIVE) {
    return MEMBERSHIP_STATUS.INACTIVE;
  }
  if (!membershipEndDate || compareDateKeys(membershipEndDate, todayKey) < 0) {
    return MEMBERSHIP_STATUS.EXPIRED;
  }
  return MEMBERSHIP_STATUS.ACTIVE;
}

function buildMembershipWindow({ startDate, durationMonths }) {
  return {
    membershipStartDate: startDate,
    membershipEndDate: addMonthsToDateKey(startDate, durationMonths),
  };
}

function selectCurrentPayment(payments, todayKey) {
  const covering = payments
    .filter((payment) => compareDateKeys(payment.startDate, todayKey) <= 0 && compareDateKeys(payment.endDate, todayKey) >= 0)
    .sort((left, right) => compareDateKeys(right.startDate, left.startDate));
  if (covering.length) return covering[0];

  const upcoming = payments
    .filter((payment) => compareDateKeys(payment.startDate, todayKey) > 0)
    .sort((left, right) => compareDateKeys(left.startDate, right.startDate));
  if (upcoming.length) return upcoming[0];

  return payments.slice().sort((left, right) => compareDateKeys(right.endDate, left.endDate))[0] || null;
}

function paymentFields(plan, startDate, paidOn) {
  return {
    plan: plan._id,
    planName: plan.name,
    durationMonths: plan.durationMonths,
    amount: plan.price,
    startDate,
    endDate: addMonthsToDateKey(startDate, plan.durationMonths),
    paidOn,
  };
}

async function ensureOpeningPayment(member) {
  const exists = await MembershipPayment.exists({ member: member._id });
  if (exists) return;
  const plan = member.membershipPlan?.name
    ? member.membershipPlan
    : await MembershipPlan.findById(member.membershipPlan);
  if (!plan || !member.membershipStartDate || !member.membershipEndDate) return;
  await MembershipPayment.create({
    member: member._id,
    plan: plan._id,
    planName: plan.name,
    durationMonths: plan.durationMonths,
    amount: plan.price,
    startDate: member.membershipStartDate,
    endDate: member.membershipEndDate,
    paidOn: member.joinDate || member.membershipStartDate,
  });
}

async function listPayments(memberId) {
  return MembershipPayment.find({ member: memberId }).sort({ startDate: -1 });
}

async function applyPaymentWindow(memberId) {
  const member = await Member.findById(memberId);
  if (!member) return null;
  const payments = await MembershipPayment.find({ member: memberId });
  const current = selectCurrentPayment(payments, getDateKey());
  if (!current) return member;

  const todayKey = getDateKey();
  const nextStatus = resolveMembershipStatus({
    accountStatus: member.status,
    membershipEndDate: current.endDate,
    todayKey,
  });
  const sameWindow = member.membershipStartDate === current.startDate
    && member.membershipEndDate === current.endDate
    && String(member.membershipPlan) === String(current.plan)
    && member.membershipStatus === nextStatus;
  const reminderMatches = !member.expiryReminderSentFor || member.expiryReminderSentFor === current.endDate;
  if (sameWindow && reminderMatches) return member;

  member.membershipPlan = current.plan;
  member.membershipStartDate = current.startDate;
  member.membershipEndDate = current.endDate;
  member.membershipStatus = nextStatus;
  if (!reminderMatches) member.expiryReminderSentFor = '';
  await member.save();
  return member;
}

async function recordOpeningPayment(member, plan) {
  await MembershipPayment.create({
    member: member._id,
    ...paymentFields(plan, member.membershipStartDate, member.joinDate || member.membershipStartDate),
  });
}

async function reviseCurrentPayment(memberId, previousStart, plan, startDate, endDate) {
  const payment = (await MembershipPayment.findOne({ member: memberId, startDate: previousStart }))
    || (await MembershipPayment.findOne({ member: memberId }).sort({ startDate: -1 }));
  const fields = {
    plan: plan._id,
    planName: plan.name,
    durationMonths: plan.durationMonths,
    amount: plan.price,
    startDate,
    endDate,
  };
  if (!payment) {
    const member = await Member.findById(memberId).select('joinDate');
    await MembershipPayment.create({
      member: memberId,
      paidOn: member?.joinDate || startDate,
      ...fields,
    });
    return;
  }
  Object.assign(payment, fields);
  await payment.save();
}

async function recordRenewal(memberId, planId) {
  const member = await Member.findById(memberId).populate('membershipPlan', 'name durationMonths price');
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await ensureOpeningPayment(member);
  const plan = await getActivePlan(planId);
  const latest = await MembershipPayment.findOne({ member: member._id }).sort({ endDate: -1 });
  const startDate = nextPeriodStart(latest?.endDate || member.membershipEndDate);
  try {
    await MembershipPayment.create({
      member: member._id,
      ...paymentFields(plan, startDate, getDateKey()),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(MESSAGES.PAYMENT_ALREADY_RECORDED, HTTP_STATUS.CONFLICT);
    }
    throw error;
  }
  await applyPaymentWindow(member._id);
  const updated = await Member.findById(memberId).populate('membershipPlan', 'name durationMonths price status');
  const payments = await listPayments(memberId);
  return { member: updated, payments };
}

async function syncMembershipStatuses() {
  const todayKey = getDateKey();
  const members = await Member.find({
    status: ACCOUNT_STATUS.ACTIVE,
    membershipStatus: { $ne: MEMBERSHIP_STATUS.INACTIVE },
  }).select('membershipEndDate membershipStartDate membershipPlan membershipStatus status');

  const payments = await MembershipPayment.find({
    member: { $in: members.map((member) => member._id) },
  }).select('member plan startDate endDate');

  const byMember = new Map();
  payments.forEach((payment) => {
    const key = String(payment.member);
    const list = byMember.get(key) || [];
    list.push(payment);
    byMember.set(key, list);
  });

  const updates = members
    .map((member) => {
      const history = byMember.get(String(member._id)) || [];
      const current = history.length ? selectCurrentPayment(history, todayKey) : null;
      const nextStatus = resolveMembershipStatus({
        accountStatus: member.status,
        membershipEndDate: current ? current.endDate : member.membershipEndDate,
        todayKey,
      });
      const sameWindow = !current
        || (member.membershipStartDate === current.startDate
          && member.membershipEndDate === current.endDate
          && String(member.membershipPlan) === String(current.plan));
      if (nextStatus === member.membershipStatus && sameWindow) return null;
      return Member.updateOne(
        { _id: member._id },
        {
          membershipStatus: nextStatus,
          ...(current
            ? {
                membershipPlan: current.plan,
                membershipStartDate: current.startDate,
                membershipEndDate: current.endDate,
              }
            : {}),
        }
      );
    })
    .filter(Boolean);

  await Promise.all(updates);
}

async function sendExpiryReminders() {
  await syncMembershipStatuses();
  const todayKey = getDateKey();
  const members = await Member.find({
    status: ACCOUNT_STATUS.ACTIVE,
    membershipStatus: MEMBERSHIP_STATUS.ACTIVE,
    membershipEndDate: todayKey,
  }).populate('membershipPlan', 'name');

  let sent = 0;
  for (const member of members) {
    if (member.expiryReminderSentFor === member.membershipEndDate) continue;
    try {
      await sendEmail({
        to: member.email,
        subject: EMAIL_SUBJECTS.EXPIRY_REMINDER,
        html: expiryTemplate({
          fullName: member.fullName,
          endDate: formatDisplayDate(dateKeyToUtcDate(member.membershipEndDate)),
          planName: member.membershipPlan?.name || 'membership',
        }),
      });
      member.expiryReminderSentFor = member.membershipEndDate;
      await member.save();
      sent += 1;
    } catch (error) {
      logger.error(MESSAGES.INTERNAL_ERROR, { action: 'expiry-reminder', memberId: member.memberId, message: error.message });
    }
  }

  return { processed: members.length, sent };
}

module.exports = {
  resolveMembershipStatus,
  buildMembershipWindow,
  syncMembershipStatuses,
  sendExpiryReminders,
  ensureOpeningPayment,
  listPayments,
  applyPaymentWindow,
  recordOpeningPayment,
  reviseCurrentPayment,
  recordRenewal,
};
