const {
  getDateKey,
  startOfWeek,
  addDaysToDateKey,
  startOfMonth,
  endOfMonth,
  compareDateKeys,
  formatDisplayDate,
  dateKeyToUtcDate,
} = require('../utils/date');
const { REPORT_TYPES, TIME, PAGINATION, HTTP_STATUS, MESSAGES } = require('../constants');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const Member = require('../models/member.model');
const attendanceService = require('./attendance.service');
const { toCsv, toPdfBuffer } = require('../utils/export');
const { getPagination } = require('../helpers/pagination');

function resolveRange(query) {
  const today = getDateKey();
  const type = query.type;

  if (type === REPORT_TYPES.DAILY) {
    const day = query.from || query.date || today;
    return { from: day, to: day };
  }
  if (type === REPORT_TYPES.WEEKLY) {
    const anchor = query.from || today;
    const from = startOfWeek(anchor);
    return { from, to: addDaysToDateKey(from, 6) };
  }
  if (type === REPORT_TYPES.MONTHLY) {
    const anchor = query.from || today;
    const from = startOfMonth(anchor);
    return { from, to: endOfMonth(anchor) };
  }
  const from = query.from || addDaysToDateKey(today, -(TIME.DASHBOARD_CHART_DAYS - 1));
  const to = query.to || today;
  if (compareDateKeys(from, to) > 0) {
    throw new AppError(MESSAGES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE, [
      { field: 'from', message: 'Start date must be before the end date' },
    ]);
  }
  return { from, to };
}

async function resolveMemberFilter(value) {
  if (!value) return undefined;
  const code = String(value).trim();
  const byCode = await Member.findOne({ memberId: code }).select('_id');
  if (byCode) return byCode._id;
  if (mongoose.isValidObjectId(code)) return code;
  throw new AppError(MESSAGES.MEMBER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
}

async function buildReport(query) {
  const range = resolveRange(query);
  const type = query.type;
  const memberId = await resolveMemberFilter(query.memberId);
  let rows = [];
  let columns = [];

  if (type === REPORT_TYPES.PRESENCE) {
    rows = await attendanceService.getPresenceReport(range.from);
    if (memberId) {
      const member = await Member.findById(memberId).select('memberId');
      rows = rows.filter((row) => row.memberId === member?.memberId);
    }
    columns = [
      { key: 'memberId', label: 'Member ID' },
      { key: 'fullName', label: 'Name' },
      { key: 'attendanceStatus', label: 'Status' },
      { key: 'membershipStatus', label: 'Membership' },
    ];
  } else if (type === REPORT_TYPES.PERCENTAGE) {
    const summary = await attendanceService.getPercentage({
      from: range.from,
      to: range.to,
      memberId,
    });
    rows = [{ ...summary, from: range.from, to: range.to }];
    columns = [
      { key: 'from', label: 'From' },
      { key: 'to', label: 'To' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'presentDays', label: 'Present days' },
      { key: 'presentRecords', label: 'Present records' },
      { key: 'totalDays', label: 'Days' },
    ];
  } else {
    const history = await attendanceService.listRange({
      from: range.from,
      to: range.to,
      memberId,
    });
    rows = history.items.map((item) => ({
      date: item.dateLabel,
      memberId: item.member?.memberId || '',
      fullName: item.member?.fullName || '',
      checkIn: item.checkInLabel,
      checkOut: item.checkOutLabel || '—',
      status: item.presence,
    }));
    columns = [
      { key: 'date', label: 'Date' },
      { key: 'memberId', label: 'Member ID' },
      { key: 'fullName', label: 'Name' },
      { key: 'checkIn', label: 'Check in' },
      { key: 'checkOut', label: 'Check out' },
      { key: 'status', label: 'Status' },
    ];
  }

  const { page, limit } = getPagination(query);
  const total = rows.length;
  const items = rows.slice((page - 1) * limit, page * limit);

  return {
    type,
    from: range.from,
    to: range.to,
    fromLabel: formatDisplayDate(dateKeyToUtcDate(range.from)),
    toLabel: formatDisplayDate(dateKeyToUtcDate(range.to)),
    columns,
    items,
    rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

async function exportReport(query) {
  const report = await buildReport({ ...query, page: 1, limit: PAGINATION.EXPORT_MAX });
  const title = `Attendance report (${report.fromLabel} - ${report.toLabel})`;
  if (query.format === 'pdf') {
    const buffer = await toPdfBuffer({ title, columns: report.columns, rows: report.rows });
    return { buffer, contentType: 'application/pdf', filename: `attendance-${report.type}.pdf` };
  }
  const csv = toCsv(report.columns, report.rows);
  return { buffer: Buffer.from(csv, 'utf8'), contentType: 'text/csv', filename: `attendance-${report.type}.csv` };
}

module.exports = { buildReport, exportReport, resolveRange };
