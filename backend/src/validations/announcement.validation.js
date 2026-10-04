const { ANNOUNCEMENT_TYPES, LIMITS } = require('../constants');
const { compactErrors } = require('./common');

const announcementSchema = ({ body }) =>
  compactErrors([
    !Object.values(ANNOUNCEMENT_TYPES).includes(body.type) ? { field: 'type', message: 'Select an announcement type' } : null,
    typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > LIMITS.TITLE_MAX
      ? { field: 'title', message: 'Enter a title' }
      : null,
    typeof body.body !== 'string' || !body.body.trim() || body.body.trim().length > LIMITS.BODY_MAX
      ? { field: 'body', message: 'Enter the announcement details' }
      : null,
  ]);

module.exports = { announcementSchema };
