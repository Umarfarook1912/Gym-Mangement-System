import { API_BASE_URL } from '../config';
import { PUBLIC_PATHS, ROUTES, STORAGE_KEYS, MESSAGES } from '../constants';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiClient(path, { method = 'GET', body, raw = false } = {}) {
  const headers = {};
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Please try again.', 0, null);
  }

  if (raw) {
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new ApiError(payload.message || MESSAGES.GENERIC_ERROR, response.status, payload.error);
    }
    return response;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const isPublic = PUBLIC_PATHS.some((route) => window.location.pathname.startsWith(route));
    if (response.status === 401 && !isPublic) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      window.location.assign(ROUTES.LOGIN);
    }
    throw new ApiError(payload.message || MESSAGES.GENERIC_ERROR, response.status, payload.error);
  }

  return payload.data;
}
