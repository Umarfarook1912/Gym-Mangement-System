import { API } from '../constants';
import { buildQuery } from '../utils/format';
import { apiClient } from './apiClient';

export function listAnnouncements(params) {
  return apiClient(`${API.ANNOUNCEMENTS}${buildQuery(params)}`);
}

export function createAnnouncement(payload) {
  return apiClient(API.ANNOUNCEMENTS, { method: 'POST', body: payload });
}

export function updateAnnouncement(id, payload) {
  return apiClient(`${API.ANNOUNCEMENTS}/${id}`, { method: 'PATCH', body: payload });
}

export function deleteAnnouncement(id) {
  return apiClient(`${API.ANNOUNCEMENTS}/${id}`, { method: 'DELETE' });
}

export function listMemberAnnouncements(params) {
  return apiClient(`${API.MEMBER_ANNOUNCEMENTS}${buildQuery(params)}`);
}
