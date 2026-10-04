const { compactErrors, checkTime } = require('./common');
const { isValidDateKey } = require('../utils/date');

const checkSchema = ({ body }) =>
  compactErrors([!body.memberId ? { field: 'memberId', message: 'Member is required' } : null]);

const attendanceQuerySchema = ({ query }) =>
  compactErrors([
    query.date && !isValidDateKey(query.date) ? { field: 'date', message: 'Enter a valid date' } : null,
    query.month && !/^\d{4}-\d{2}$/.test(query.month) ? { field: 'month', message: 'Enter a valid month' } : null,
  ]);

const manualAttendanceSchema = ({ body }) =>
  compactErrors([
    !body.memberId ? { field: 'memberId', message: 'Member is required' } : null,
    !isValidDateKey(body.date) ? { field: 'date', message: 'Enter a valid date' } : null,
    checkTime(body.checkInTime, 'checkInTime'),
    checkTime(body.checkOutTime, 'checkOutTime'),
  ]);

const updateAttendanceSchema = ({ body }) => {
  const checkOut = typeof body.checkOutTime === 'string' ? body.checkOutTime.trim() : '';
  return compactErrors([
    checkTime(body.checkInTime, 'checkInTime'),
    checkOut ? checkTime(checkOut, 'checkOutTime') : null,
  ]);
};

module.exports = { checkSchema, attendanceQuerySchema, manualAttendanceSchema, updateAttendanceSchema };
