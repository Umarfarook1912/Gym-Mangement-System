const { ANNOUNCEMENT_TYPES, LIMITS } = require('../constants');
const { compareDateKeys } = require('../utils/date');
const { checkDateKey, checkTime, compactErrors } = require('./common');

function checkDetails(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > LIMITS.BODY_MAX) {
    return { field: 'body', message: 'Enter the announcement details' };
  }
  return null;
}

const announcementSchema = ({ body }) => {
  if (!Object.values(ANNOUNCEMENT_TYPES).includes(body.type)) {
    return compactErrors([{ field: 'type', message: 'Select an announcement type' }]);
  }

  if (body.type === ANNOUNCEMENT_TYPES.TIMING) {
    const openError = checkTime(body.openTime, 'openTime');
    const closeError = checkTime(body.closeTime, 'closeTime');
    return compactErrors([
      openError,
      closeError,
      !openError && !closeError && body.closeTime <= body.openTime
        ? { field: 'closeTime', message: 'Closing time must be after opening time' }
        : null,
      checkDateKey(body.effectiveDate, 'effectiveDate'),
      body.body && body.body.length > LIMITS.BODY_MAX ? { field: 'body', message: 'Note is too long' } : null,
    ]);
  }

  if (body.type === ANNOUNCEMENT_TYPES.MAINTENANCE) {
    const startError = checkDateKey(body.startDate, 'startDate');
    const endError = checkDateKey(body.endDate, 'endDate');
    return compactErrors([
      startError,
      endError,
      !startError && !endError && compareDateKeys(body.endDate, body.startDate) < 0
        ? { field: 'endDate', message: 'End date must be on or after the start date' }
        : null,
      checkDetails(body.body),
    ]);
  }

  return compactErrors([
    typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > LIMITS.TITLE_MAX
      ? { field: 'title', message: 'Enter a title' }
      : null,
    checkDetails(body.body),
  ]);
};

module.exports = { announcementSchema };
