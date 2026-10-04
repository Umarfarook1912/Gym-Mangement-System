import { API } from '../constants';
import { apiClient } from './apiClient';

export function getPublicGym() {
  return apiClient(API.GYM);
}

export function getSettings() {
  return apiClient(API.SETTINGS);
}

export function updateSettings(payload) {
  return apiClient(API.SETTINGS, { method: 'PUT', body: payload });
}
