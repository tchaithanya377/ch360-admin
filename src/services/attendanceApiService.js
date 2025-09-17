// Attendance API Service encapsulating endpoints under /api/v1/attendance/
import { DJANGO_BASE_URL } from '../config/apiConfig';
import djangoAuthService from '../utils/djangoAuthService';

class AttendanceApiService {
  constructor() {
    this.baseURL = `${DJANGO_BASE_URL}`.replace(/\/$/, '');
    this.prefix = '/v1/attendance';
  }

  get token() {
    return localStorage.getItem('django_token') || localStorage.getItem('access_token') || '';
  }

  getHeaders(extra = {}) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', ...extra };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async request(path, options = {}) {
    const url = `${this.baseURL}${this.prefix}${path}`;
    let res = await fetch(url, { headers: this.getHeaders(options.headers), ...options });
    if (res.status === 401) {
      const refreshed = await djangoAuthService.refreshAccessToken();
      if (refreshed) {
        res = await fetch(url, { headers: this.getHeaders(options.headers), ...options });
      }
    }
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try { const data = await res.json(); detail = data.detail || data.message || detail; } catch {}
      const error = new Error(detail);
      error.status = res.status;
      try { error.data = await res.clone().json(); } catch {}
      throw error;
    }
    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }

  // Sessions CRUD
  listSessions() { return this.request('/attendance/sessions/'); }
  getSession(id) { return this.request(`/attendance/sessions/${id}/`); }
  createSession(payload) { return this.request('/attendance/sessions/', { method: 'POST', body: JSON.stringify(payload) }); }
  updateSession(id, payload) { return this.request(`/attendance/sessions/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }); }
  patchSession(id, payload) { return this.request(`/attendance/sessions/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); }
  deleteSession(id) { return this.request(`/attendance/sessions/${id}/`, { method: 'DELETE' }); }

  // Generate records for a session
  generateRecords(sessionId) { return this.request(`/attendance/sessions/${sessionId}/generate_records/`, { method: 'POST' }); }

  // Records CRUD
  listRecords(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const ep = qs ? `/attendance/records/?${qs}` : '/attendance/records/';
    return this.request(ep);
  }
  createRecord(payload) { return this.request('/attendance/records/', { method: 'POST', body: JSON.stringify(payload) }); }
  updateRecord(id, payload) { return this.request(`/attendance/records/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }); }
  patchRecord(id, payload) { return this.request(`/attendance/records/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); }
  deleteRecord(id) { return this.request(`/attendance/records/${id}/`, { method: 'DELETE' }); }

  // Students for a session (admin helper)
  getSessionStudents(sessionId) {
    return this.request(`/admin/attendance/attendance-record/get-students-for-session/?session_id=${encodeURIComponent(sessionId)}`);
  }
}

const AttendanceService = new AttendanceApiService();
export default AttendanceService;


