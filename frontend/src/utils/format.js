import { STATUS_LABELS } from '../constants';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '—';
}

export function applyApiErrors(error, setErrors) {
  if (!Array.isArray(error?.details)) return;
  const mapped = {};
  error.details.forEach((item) => {
    if (item?.field) mapped[item.field] = item.message;
  });
  setErrors((current) => ({ ...current, ...mapped }));
}

export function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}
