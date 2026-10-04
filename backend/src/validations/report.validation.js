const { REPORT_TYPES, EXPORT_FORMATS } = require('../constants');
const { isValidDateKey } = require('../utils/date');
const { compactErrors } = require('./common');

const reportQuerySchema = ({ query }) =>
  compactErrors([
    !Object.values(REPORT_TYPES).includes(query.type) ? { field: 'type', message: 'Select a report type' } : null,
    query.from && !isValidDateKey(query.from) ? { field: 'from', message: 'Enter a valid start date' } : null,
    query.to && !isValidDateKey(query.to) ? { field: 'to', message: 'Enter a valid end date' } : null,
    query.format && !Object.values(EXPORT_FORMATS).includes(query.format)
      ? { field: 'format', message: 'Select a valid export format' }
      : null,
  ]);

module.exports = { reportQuerySchema };
