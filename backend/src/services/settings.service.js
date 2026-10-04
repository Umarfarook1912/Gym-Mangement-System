const GymSettings = require('../models/gymSettings.model');
const { DEFAULT_GYM_NAME, DEFAULT_GYM_HOURS, WORKING_DAYS, MEMBER_ID_PREFIX, LIMITS } = require('../constants');

async function getSettings() {
  let settings = await GymSettings.findOne();
  if (!settings) {
    settings = await GymSettings.create({
      gymName: DEFAULT_GYM_NAME,
      openTime: DEFAULT_GYM_HOURS.openTime,
      closeTime: DEFAULT_GYM_HOURS.closeTime,
      workingDays: WORKING_DAYS,
      checkoutRequired: true,
    });
  }
  return settings;
}

async function getPublicSettings() {
  const settings = await getSettings();
  return {
    gymName: settings.gymName,
    openTime: settings.openTime,
    closeTime: settings.closeTime,
    workingDays: settings.workingDays,
    checkoutRequired: settings.checkoutRequired,
  };
}

async function updateSettings(payload) {
  const settings = await getSettings();
  settings.gymName = payload.gymName.trim();
  settings.openTime = payload.openTime;
  settings.closeTime = payload.closeTime;
  settings.workingDays = payload.workingDays;
  settings.checkoutRequired = payload.checkoutRequired;
  await settings.save();
  return settings;
}

async function nextMemberId() {
  const settings = await GymSettings.findOneAndUpdate(
    {},
    {
      $inc: { memberSequence: 1 },
      $setOnInsert: {
        gymName: DEFAULT_GYM_NAME,
        openTime: DEFAULT_GYM_HOURS.openTime,
        closeTime: DEFAULT_GYM_HOURS.closeTime,
        workingDays: WORKING_DAYS,
        checkoutRequired: true,
      },
    },
    { upsert: true, new: true }
  );
  return `${MEMBER_ID_PREFIX}${String(settings.memberSequence).padStart(LIMITS.MEMBER_ID_PAD, '0')}`;
}

module.exports = { getSettings, getPublicSettings, updateSettings, nextMemberId };
