const Member = require('../models/member.model');
const Admin = require('../models/admin.model');
const Attendance = require('../models/attendance.model');
const MembershipPayment = require('../models/membershipPayment.model');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../helpers/sanitize');
const { getPagination, buildPagedResult } = require('../helpers/pagination');
const { hashPassword, createTemporaryPassword } = require('../utils/password');
const { formatDisplayDate, dateKeyToUtcDate } = require('../utils/date');
const { nextMemberId } = require('./settings.service');
const MembershipPlan = require('../models/membershipPlan.model');
const { getActivePlan } = require('./plan.service');
const {
  buildMembershipWindow,
  resolveMembershipStatus,
  syncMembershipStatuses,
  ensureOpeningPayment,
  listPayments,
  applyPaymentWindow,
  recordOpeningPayment,
  reviseCurrentPayment,
} = require('./membership.service');
const { sendEmail } = require('./email.service');
const { registrationTemplate } = require('../templates/email.templates');
const {
  ACCOUNT_STATUS,
  MEMBERSHIP_STATUS,
  HTTP_STATUS,
  MESSAGES,
  EMAIL_SUBJECTS,
  LIMITS,
  TIME,
} = require('../constants');
const logger = require('../utils/logger');

const MEMBER_LIST_FIELDS =
  'memberId fullName email phone dateOfBirth gender address joinDate membershipPlan membershipStartDate membershipEndDate membershipStatus emergencyContactName emergencyContactPhone height weight status createdAt';

function mapMemberPayload(body, plan) {
  const window = buildMembershipWindow({
    startDate: body.membershipStartDate,
    durationMonths: plan.durationMonths,
  });
  const status = body.status || ACCOUNT_STATUS.ACTIVE;
  return {
    fullName: body.fullName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    dateOfBirth: dateKeyToUtcDate(body.dateOfBirth),
    gender: body.gender,
    address: (body.address || '').trim(),
    joinDate: body.joinDate,
    membershipPlan: plan._id,
    membershipStartDate: window.membershipStartDate,
    membershipEndDate: window.membershipEndDate,
    membershipStatus: resolveMembershipStatus({
      accountStatus: status,
      membershipEndDate: window.membershipEndDate,
    }),
    emergencyContactName: (body.emergencyContactName || '').trim(),
    emergencyContactPhone: (body.emergencyContactPhone || '').trim(),
    height: body.height === '' || body.height === null || body.height === undefined ? null : Number(body.height),
    weight: body.weight === '' || body.weight === null || body.weight === undefined ? null : Number(body.weight),
    status,
  };
}

async function assertEmailAvailable(email, excludeMemberId) {
  const normalized = email.trim().toLowerCase();
  const adminExists = await Admin.exists({ email: normalized });
  const memberQuery = { email: normalized };
  if (excludeMemberId) memberQuery._id = { $ne: excludeMemberId };
  const memberExists = await Member.exists(memberQuery);
  if (adminExists || memberExists) {
    throw new AppError(MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT, [
      { field: 'email', message: MESSAGES.EMAIL_EXISTS },
    ]);
  }
}

async function listMembers(query) {
  await syncMembershipStatuses();
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status && Object.values(MEMBERSHIP_STATUS).includes(query.status)) {
    filter.membershipStatus = query.status;
  }
  if (query.plan) {
    filter.membershipPlan = query.plan;
  }
  if (query.search) {
    const search = escapeRegex(String(query.search).slice(0, LIMITS.SEARCH_MAX));
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } },
    ];
  }

  const sortField = ['fullName', 'joinDate', 'memberId', 'createdAt'].includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Member.find(filter).select(MEMBER_LIST_FIELDS).populate('membershipPlan', 'name durationMonths price').sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
    Member.countDocuments(filter),
  ]);

  return buildPagedResult({ items, total, page, limit });
}

async function getMember(id) {
  const member = await Member.findById(id).populate('membershipPlan', 'name durationMonths price status');
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await ensureOpeningPayment(member);
  await applyPaymentWindow(member._id);
  const [refreshed, attendance, payments] = await Promise.all([
    Member.findById(id).populate('membershipPlan', 'name durationMonths price status'),
    Attendance.find({ member: member._id }).sort({ dateKey: -1 }).limit(TIME.RECENT_ITEMS),
    listPayments(member._id),
  ]);
  return { member: refreshed, attendance, payments };
}

async function createMember(body) {
  await assertEmailAvailable(body.email);
  const plan = await getActivePlan(body.membershipPlan);
  const temporaryPassword = createTemporaryPassword();
  const memberId = await nextMemberId();
  const payload = mapMemberPayload(body, plan);

  const member = await Member.create({
    ...payload,
    memberId,
    password: await hashPassword(temporaryPassword),
  });

  await recordOpeningPayment(member, plan);
  const populated = await member.populate('membershipPlan', 'name durationMonths price');

  try {
    await sendEmail({
      to: populated.email,
      subject: EMAIL_SUBJECTS.REGISTRATION,
      html: registrationTemplate({
        fullName: populated.fullName,
        memberId: populated.memberId,
        email: populated.email,
        temporaryPassword,
        planName: plan.name,
        endDate: formatDisplayDate(dateKeyToUtcDate(populated.membershipEndDate)),
      }),
    });
  } catch (error) {
    logger.error('Registration email failed', { memberId: populated.memberId, message: error.message });
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.info('Member temporary password issued', { memberId: populated.memberId, email: populated.email });
  }

  return { member: populated, temporaryPassword };
}

async function updateMember(id, body) {
  const member = await Member.findById(id);
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await assertEmailAvailable(body.email, member._id);
  const plan = String(member.membershipPlan) === String(body.membershipPlan)
    ? await MembershipPlan.findById(body.membershipPlan)
    : await getActivePlan(body.membershipPlan);
  if (!plan) {
    throw new AppError(MESSAGES.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  const previousStart = member.membershipStartDate;
  const planChanged = String(member.membershipPlan) !== String(plan._id);
  const startChanged = previousStart !== body.membershipStartDate;
  const payload = mapMemberPayload(body, plan);
  if (planChanged || startChanged) {
    await reviseCurrentPayment(id, previousStart, plan, payload.membershipStartDate, payload.membershipEndDate);
  }
  const updated = await Member.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).populate(
    'membershipPlan',
    'name durationMonths price status'
  );
  if (!updated) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  if (!planChanged && !startChanged) {
    await ensureOpeningPayment(updated);
  }
  return updated;
}

async function deleteMember(id) {
  const member = await Member.findById(id);
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await Attendance.deleteMany({ member: member._id });
  await MembershipPayment.deleteMany({ member: member._id });
  await member.deleteOne();
  return { id };
}

async function getMemberSelf(id) {
  const member = await Member.findById(id).populate('membershipPlan', 'name durationMonths price');
  if (!member) {
    throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await ensureOpeningPayment(member);
  await applyPaymentWindow(member._id);
  return Member.findById(id).populate('membershipPlan', 'name durationMonths price');
}

async function getOwnMembership(id) {
  const member = await getMemberSelf(id);
  const payments = await listPayments(id);
  return { member, payments };
}

module.exports = {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberSelf,
  getOwnMembership,
  assertEmailAvailable,
};
