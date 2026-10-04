import { API_BASE_URL } from '../config';
import { API, STORAGE_KEYS } from '../constants';
import { buildQuery } from '../utils/format';
import { apiClient } from './apiClient';

export function getReport(params) {
  return apiClient(`${API.REPORTS}${buildQuery(params)}`);
}

export async function downloadReport(params) {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const response = await fetch(`${API_BASE_URL}${API.REPORTS}/export${buildQuery(params)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Unable to export the report');
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match?.[1] || `attendance-report.${params.format}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
