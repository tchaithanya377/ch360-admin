import { DJANGO_BASE_URL } from '../config/apiConfig';

const BASE = `${DJANGO_BASE_URL}`.replace(/\/$/, '') + '/v1/mentoring';

function getAuthHeaders() {
  const token = localStorage.getItem('django_token') || localStorage.getItem('access_token') || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function http(url, options = {}) {
  const res = await fetch(url, { headers: getAuthHeaders(), ...options });
  if (res.status === 401) {
    // bubble up 401 to allow redirect to login
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { const data = await res.json(); message = data.detail || data.message || message; } catch {}
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

// Cursor pagination helper: accepts either query params or full next/previous URL
export async function listWithCursor(path, paramsOrUrl) {
  let url;
  if (typeof paramsOrUrl === 'string') {
    url = paramsOrUrl.startsWith('http') ? paramsOrUrl : `${BASE}${paramsOrUrl}`;
  } else {
    const qs = new URLSearchParams(paramsOrUrl || {}).toString();
    url = `${BASE}${path}${qs ? `?${qs}` : ''}`;
  }
  return http(url);
}

// Mentorships
export const MentorshipsApi = {
  list: (paramsOrUrl) => listWithCursor('/mentorships/', paramsOrUrl),
  create: (payload) => http(`${BASE}/mentorships/`, { method: 'POST', body: JSON.stringify(payload) }),
  retrieve: (id) => http(`${BASE}/mentorships/${id}/`),
  update: (id, payload) => http(`${BASE}/mentorships/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => http(`${BASE}/mentorships/${id}/`, { method: 'DELETE' }),
  computeRisk: (id) => http(`${BASE}/mentorships/${id}/compute-risk/`, { method: 'POST' }),
  analyticsSummary: (params) => listWithCursor('/mentorships/analytics/summary/', params)
};

// Projects
export const ProjectsApi = {
  list: (paramsOrUrl) => listWithCursor('/projects/', paramsOrUrl),
  create: (payload) => http(`${BASE}/projects/`, { method: 'POST', body: JSON.stringify(payload) }),
  retrieve: (id) => http(`${BASE}/projects/${id}/`),
  update: (id, payload) => http(`${BASE}/projects/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => http(`${BASE}/projects/${id}/`, { method: 'DELETE' }),
};

// Meetings
export const MeetingsApi = {
  list: (paramsOrUrl) => listWithCursor('/meetings/', paramsOrUrl),
  create: (payload) => http(`${BASE}/meetings/`, { method: 'POST', body: JSON.stringify(payload) }),
  retrieve: (id) => http(`${BASE}/meetings/${id}/`),
  update: (id, payload) => http(`${BASE}/meetings/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => http(`${BASE}/meetings/${id}/`, { method: 'DELETE' }),
};

// Feedback
export const FeedbackApi = {
  list: (paramsOrUrl) => listWithCursor('/feedback/', paramsOrUrl),
  create: (payload) => http(`${BASE}/feedback/`, { method: 'POST', body: JSON.stringify(payload) }),
  retrieve: (id) => http(`${BASE}/feedback/${id}/`),
  update: (id, payload) => http(`${BASE}/feedback/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => http(`${BASE}/feedback/${id}/`, { method: 'DELETE' }),
};

// Action Items
export const ActionItemsApi = {
  list: (paramsOrUrl) => listWithCursor('/action-items/', paramsOrUrl),
  create: (payload) => http(`${BASE}/action-items/`, { method: 'POST', body: JSON.stringify(payload) }),
  retrieve: (id) => http(`${BASE}/action-items/${id}/`),
  update: (id, payload) => http(`${BASE}/action-items/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => http(`${BASE}/action-items/${id}/`, { method: 'DELETE' }),
};

// Admin-only endpoint
export const AutoAssignApi = {
  run: (payload) => http(`${BASE}/mentorships/auto-assign/`, { method: 'POST', body: JSON.stringify(payload) }),
};

export default {
  MentorshipsApi,
  ProjectsApi,
  MeetingsApi,
  FeedbackApi,
  ActionItemsApi,
  AutoAssignApi,
};


