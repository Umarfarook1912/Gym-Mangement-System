import { API } from '../constants';
import { buildQuery } from '../utils/format';
import { apiClient } from './apiClient';

export function checkIn(memberId) {
  return apiClient(`${API.ATTENDANCE}/check-in`, { method: 'POST', body: { memberId } });
}

export function checkOut(memberId) {
  return apiClient(`${API.ATTENDANCE}/check-out`, { method: 'POST', body: { memberId } });
}

export function recordManual(payload) {
  return apiClient(`${API.ATTENDANCE}/manual`, { method: 'POST', body: payload });
}

export function getToday() {
  return apiClient(`${API.ATTENDANCE}/today`);
}

export function getByDate(date) {
  return apiClient(`${API.ATTENDANCE}${buildQuery({ date })}`);
}

export function getCalendar(month) {
  return apiClient(`${API.ATTENDANCE}/calendar${buildQuery({ month })}`);
}

export function getMonthly(params) {
  return apiClient(`${API.ATTENDANCE}/monthly${buildQuery(params)}`);
}

export function updateAttendance(id, payload) {
  return apiClient(`${API.ATTENDANCE}/${id}`, { method: 'PATCH', body: payload });
}

export function deleteAttendance(id) {
  return apiClient(`${API.ATTENDANCE}/${id}`, { method: 'DELETE' });
}

export function getOwnAttendance(params) {
  return apiClient(`${API.MEMBER_ATTENDANCE}${buildQuery(params)}`);
}

export function checkInSelf() {
  return apiClient(`${API.MEMBER_ATTENDANCE}/check-in`, { method: 'POST' });
}

export function checkOutSelf() {
  return apiClient(`${API.MEMBER_ATTENDANCE}/check-out`, { method: 'POST' });
}
