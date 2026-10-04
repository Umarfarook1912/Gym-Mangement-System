import { API } from '../constants';
import { apiClient } from './apiClient';

export function listPlans() {
  return apiClient(API.PLANS);
}

export function createPlan(payload) {
  return apiClient(API.PLANS, { method: 'POST', body: payload });
}

export function updatePlan(id, payload) {
  return apiClient(`${API.PLANS}/${id}`, { method: 'PATCH', body: payload });
}

export function deletePlan(id) {
  return apiClient(`${API.PLANS}/${id}`, { method: 'DELETE' });
}

export function sendExpiryReminders() {
  return apiClient(API.PLAN_REMINDERS, { method: 'POST' });
}

export function getOwnMembership() {
  return apiClient(API.MEMBER_MEMBERSHIP);
}
