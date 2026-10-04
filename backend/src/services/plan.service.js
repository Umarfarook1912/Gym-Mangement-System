const MembershipPlan = require('../models/membershipPlan.model');
const Member = require('../models/member.model');
const AppError = require('../utils/AppError');
const { PLAN_STATUS, HTTP_STATUS, MESSAGES } = require('../constants');

async function listPlans() {
  const [plans, counts] = await Promise.all([
    MembershipPlan.find().sort({ durationMonths: 1, name: 1 }),
    Member.aggregate([{ $group: { _id: '$membershipPlan', count: { $sum: 1 } } }]),
  ]);
  const countByPlan = new Map(counts.map((item) => [String(item._id), item.count]));
  return plans.map((plan) => ({
    ...plan.toJSON(),
    memberCount: countByPlan.get(String(plan._id)) || 0,
  }));
}

async function assertPlanNameAvailable(name, excludeId) {
  const query = { name: name.trim() };
  if (excludeId) query._id = { $ne: excludeId };
  const exists = await MembershipPlan.exists(query);
  if (exists) {
    throw new AppError(MESSAGES.PLAN_NAME_EXISTS, HTTP_STATUS.CONFLICT, [
      { field: 'name', message: MESSAGES.PLAN_NAME_EXISTS },
    ]);
  }
}

async function createPlan(payload) {
  await assertPlanNameAvailable(payload.name);
  return MembershipPlan.create({
    name: payload.name.trim(),
    durationMonths: Number(payload.durationMonths),
    price: Number(payload.price),
    status: payload.status || PLAN_STATUS.ACTIVE,
  });
}

async function updatePlan(id, payload) {
  const plan = await MembershipPlan.findById(id);
  if (!plan) {
    throw new AppError(MESSAGES.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  await assertPlanNameAvailable(payload.name, plan._id);
  plan.name = payload.name.trim();
  plan.durationMonths = Number(payload.durationMonths);
  plan.price = Number(payload.price);
  plan.status = payload.status || plan.status;
  await plan.save();
  return plan;
}

async function deletePlan(id) {
  const inUse = await Member.exists({ membershipPlan: id });
  if (inUse) {
    throw new AppError(MESSAGES.PLAN_IN_USE, HTTP_STATUS.CONFLICT);
  }
  const plan = await MembershipPlan.findByIdAndDelete(id);
  if (!plan) {
    throw new AppError(MESSAGES.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return plan;
}

async function getActivePlan(id) {
  const plan = await MembershipPlan.findById(id);
  if (!plan) {
    throw new AppError(MESSAGES.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  if (plan.status !== PLAN_STATUS.ACTIVE) {
    throw new AppError(MESSAGES.PLAN_INACTIVE, HTTP_STATUS.BAD_REQUEST);
  }
  return plan;
}

module.exports = { listPlans, createPlan, updatePlan, deletePlan, getActivePlan };
