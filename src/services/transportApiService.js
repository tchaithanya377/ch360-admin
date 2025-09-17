// Transport API Service
// Provides typed helper methods for all Transportation module resources

import { DJANGO_BASE_URL } from '../config/apiConfig';
import djangoAuthService from '../utils/djangoAuthService';

const BASE = `${DJANGO_BASE_URL}/v1/transport`;

const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('django_token') || localStorage.getItem('access_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handleResponse = async (res) => {
  if (res.ok) {
    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }
  let payload = null;
  try { payload = await res.json(); } catch {}
  const error = new Error(payload?.detail || `HTTP ${res.status}`);
  error.status = res.status;
  error.payload = payload;
  throw error;
};

const buildQuery = (params = {}) => {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qp.append(k, v);
  });
  const qs = qp.toString();
  return qs ? `?${qs}` : '';
};

// Use central djangoAuthService so 401s can auto-refresh tokens
const http = async (path, options = {}) => {
  // Build endpoint relative to base for djangoAuthService
  const endpoint = `/v1/transport${path}`;
  const res = await djangoAuthService.makeRequest(endpoint, options);
  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch {}
    const error = new Error(payload?.detail || `HTTP ${res.status}`);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
};

// Generic REST helpers for a resource root (e.g., /vehicles)
const resource = (root) => ({
  list: (params = {}) => http(`/${root}/${buildQuery(params)}`),
  retrieve: (id) => http(`/${root}/${id}/`),
  create: (data) => http(`/${root}/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => http(`/${root}/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (id, data) => http(`/${root}/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id) => http(`/${root}/${id}/`, { method: 'DELETE' }),
});

export const TransportAPI = {
  vehicles: resource('vehicles'),
  drivers: resource('drivers'),
  stops: resource('stops'),
  routes: resource('routes'),
  routeStops: resource('route-stops'),
  assignments: resource('assignments'),
  schedules: resource('schedules'),
  passes: resource('passes'),
};

// Reusable selects
export const SelectLoaders = {
  vehicles: (params = {}) => TransportAPI.vehicles.list({ ordering: 'number_plate', page_size: 100, ...params }),
  drivers: (params = {}) => TransportAPI.drivers.list({ ordering: 'full_name', page_size: 100, ...params }),
  routes: (params = {}) => TransportAPI.routes.list({ ordering: 'name', page_size: 100, ...params }),
  stops: (params = {}) => TransportAPI.stops.list({ ordering: 'name', page_size: 100, ...params }),
};

export const isStaffWriteError = (e) => e?.status === 403;
export const isAuthError = (e) => e?.status === 401;


