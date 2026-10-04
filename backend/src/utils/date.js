const env = require('../config/env');
const { TIME } = require('../constants');

const KEY_FORMAT = { timeZone: env.timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
const DISPLAY_FORMAT = { timeZone: env.timezone, day: '2-digit', month: 'short', year: 'numeric' };
const TIME_FORMAT = { timeZone: env.timezone, hour: '2-digit', minute: '2-digit', hour12: true };

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(value = new Date()) {
  const date = toDate(value) || new Date();
  const parts = new Intl.DateTimeFormat('en-US', KEY_FORMAT).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function dateKeyToUtcDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDisplayDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', DISPLAY_FORMAT).format(date);
}

function formatDisplayTime(value) {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', TIME_FORMAT).format(date);
}

function addMonthsToDateKey(dateKey, months) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, 1));
  utc.setUTCMonth(utc.getUTCMonth() + Number(months));
  const lastDay = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth() + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDay);
  const result = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), clampedDay));
  const monthText = String(result.getUTCMonth() + 1).padStart(2, '0');
  const dayText = String(result.getUTCDate()).padStart(2, '0');
  return `${result.getUTCFullYear()}-${monthText}-${dayText}`;
}

function addDaysToDateKey(dateKey, days) {
  const date = dateKeyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  const monthText = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dayText = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${monthText}-${dayText}`;
}

function compareDateKeys(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function nextPeriodStart(endDate, todayKey = getDateKey()) {
  if (!endDate || compareDateKeys(endDate, todayKey) < 0) return todayKey;
  return addDaysToDateKey(endDate, 1);
}

function startOfWeek(dateKey) {
  const date = dateKeyToUtcDate(dateKey);
  const day = date.getUTCDay();
  const diff = (day - TIME.WEEK_START_DAY + 7) % 7;
  return addDaysToDateKey(dateKey, -diff);
}

function endOfMonth(dateKey) {
  const [year, month] = dateKey.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

function startOfMonth(dateKey) {
  const [year, month] = dateKey.split('-');
  return `${year}-${month}-01`;
}

function daysBetween(startKey, endKey) {
  const start = dateKeyToUtcDate(startKey).getTime();
  const end = dateKeyToUtcDate(endKey).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function listDateKeys(startKey, endKey) {
  const keys = [];
  let cursor = startKey;
  while (compareDateKeys(cursor, endKey) <= 0) {
    keys.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }
  return keys;
}

function isValidDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Boolean(toDate(dateKeyToUtcDate(value)));
}

function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function formatInputTime(value) {
  const date = toDate(value);
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: env.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = String(lookup.hour).padStart(2, '0') === '24' ? '00' : String(lookup.hour).padStart(2, '0');
  return `${hour}:${String(lookup.minute).padStart(2, '0')}`;
}

function dateTimeInTimeZone(dateKey, time) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
  const guess = new Date(desired);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.timezone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(guess);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const shown = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second)
  );
  return new Date(guess.getTime() - (shown - desired));
}

module.exports = {
  toDate,
  getDateKey,
  dateKeyToUtcDate,
  formatDisplayDate,
  formatDisplayTime,
  addMonthsToDateKey,
  addDaysToDateKey,
  compareDateKeys,
  nextPeriodStart,
  startOfWeek,
  endOfMonth,
  startOfMonth,
  daysBetween,
  listDateKeys,
  isValidDateKey,
  isValidTime,
  formatInputTime,
  dateTimeInTimeZone,
};
