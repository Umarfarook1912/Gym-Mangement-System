const env = require('../config/env');
const { connectDB } = require('../config/db');
const Admin = require('../models/admin.model');
const MembershipPlan = require('../models/membershipPlan.model');
const { hashPassword } = require('../utils/password');
const { getSettings } = require('../services/settings.service');
const { PLAN_DEFAULTS, PLAN_STATUS, MESSAGES } = require('../constants');
const logger = require('../utils/logger');

async function seed() {
  if (!env.seed.adminEmail || !env.seed.adminPassword || !env.seed.adminName) {
    throw new Error(MESSAGES.SEED_ADMIN_MISSING);
  }

  await connectDB();
  await getSettings();

  const email = env.seed.adminEmail.trim().toLowerCase();
  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({
      fullName: env.seed.adminName.trim(),
      email,
      password: await hashPassword(env.seed.adminPassword),
    });
    logger.info('Seed admin created', { email });
  } else {
    logger.info('Seed admin already exists', { email });
  }

  for (const plan of PLAN_DEFAULTS) {
    const found = await MembershipPlan.findOne({ name: plan.name });
    if (!found) {
      await MembershipPlan.create({ ...plan, status: PLAN_STATUS.ACTIVE });
      logger.info('Seed plan created', { name: plan.name });
    }
  }

  logger.info(MESSAGES.SEED_COMPLETE);
  await require('mongoose').disconnect();
}

seed().catch((error) => {
  logger.error('Seed failed', { message: error.message });
  process.exit(1);
});
