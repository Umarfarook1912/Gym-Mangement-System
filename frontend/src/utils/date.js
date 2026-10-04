import { TIMEZONE } from '../constants';

export function toDateKey(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDate(value) {
  const key = toDateKey(value);
  if (!key) return '—';
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatClock(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return '—';
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 1, hour, minute)));
}

export function todayKey() {
  return toDateKey(new Date());
}

export function monthKey(value = new Date()) {
  return toDateKey(value).slice(0, 7);
}

export function addDaysToDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const monthText = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dayText = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${monthText}-${dayText}`;
}

export function nextPeriodStart(endDate, today = todayKey()) {
  if (!endDate || endDate < today) return today;
  return addDaysToDateKey(endDate, 1);
}

export function addMonthsToDateKey(dateKey, months) {
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
