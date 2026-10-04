import { API } from '../constants';
import { apiClient } from './apiClient';

export function getAdminDashboard() {
  return apiClient(API.ADMIN_DASHBOARD);
}

export function getMemberDashboard() {
  return apiClient(API.MEMBER_DASHBOARD);
}
