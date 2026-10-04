import { API } from '../constants';
import { buildQuery } from '../utils/format';
import { apiClient } from './apiClient';

export function listMembers(params) {
  return apiClient(`${API.MEMBERS}${buildQuery(params)}`);
}

export function getMember(id) {
  return apiClient(`${API.MEMBERS}/${id}`);
}

export function createMember(payload) {
  return apiClient(API.MEMBERS, { method: 'POST', body: payload });
}

export function updateMember(id, payload) {
  return apiClient(`${API.MEMBERS}/${id}`, { method: 'PATCH', body: payload });
}

export function deleteMember(id) {
  return apiClient(`${API.MEMBERS}/${id}`, { method: 'DELETE' });
}

export function recordPayment(id, payload) {
  return apiClient(`${API.MEMBERS}/${id}/payments`, { method: 'POST', body: payload });
}

export function getMemberAttendance(id, params) {
  return apiClient(`${API.MEMBERS}/${id}/attendance${buildQuery(params)}`);
}
