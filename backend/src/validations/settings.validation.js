const { LIMITS } = require('../constants');
const { checkTime, compactErrors } = require('./common');

const settingsSchema = ({ body }) =>
  compactErrors([
    typeof body.gymName !== 'string' || body.gymName.trim().length < LIMITS.NAME_MIN
      ? { field: 'gymName', message: 'Enter the gym name' }
      : null,
    checkTime(body.openTime, 'openTime'),
    checkTime(body.closeTime, 'closeTime'),
    !Array.isArray(body.workingDays) || body.workingDays.some((day) => day < 0 || day > 6)
      ? { field: 'workingDays', message: 'Select valid working days' }
      : null,
    typeof body.checkoutRequired !== 'boolean' ? { field: 'checkoutRequired', message: 'Select a checkout rule' } : null,
  ]);

module.exports = { settingsSchema };
