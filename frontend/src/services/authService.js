import { API } from '../constants';
import { apiClient } from './apiClient';

export function login(payload) {
  return apiClient(API.LOGIN, { method: 'POST', body: payload });
}

export function logout() {
  return apiClient(API.LOGOUT, { method: 'POST' });
}

export function getProfile() {
  return apiClient(API.ME);
}

export function updateProfile(payload) {
  return apiClient(API.PROFILE, { method: 'PATCH', body: payload });
}

export function changePassword(payload) {
  return apiClient(API.CHANGE_PASSWORD, { method: 'POST', body: payload });
}

export function forgotPassword(payload) {
  return apiClient(API.FORGOT_PASSWORD, { method: 'POST', body: payload });
}

export function resetPassword(payload) {
  return apiClient(API.RESET_PASSWORD, { method: 'POST', body: payload });
}

export function listAdmins() {
  return apiClient(API.ADMINS);
}

export function createAdmin(payload) {
  return apiClient(API.ADMINS, { method: 'POST', body: payload });
}

export function updateAdmin(id, payload) {
  return apiClient(`${API.ADMINS}/${id}`, { method: 'PATCH', body: payload });
}

export function deleteAdmin(id) {
  return apiClient(`${API.ADMINS}/${id}`, { method: 'DELETE' });
}
