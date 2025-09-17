// Events API Service
// Provides CRUD for events, venues, categories, registrations with JWT
import { DJANGO_BASE_URL } from '../config/apiConfig';

class EventsApiService {
  constructor() {
    this.baseURL = `${DJANGO_BASE_URL}/v1/events`;
  }

  getAuthToken() {
    return localStorage.getItem('django_token') || localStorage.getItem('access_token') || '';
  }

  getHeaders(extra = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
    return headers;
  }

  buildQuery(params = {}) {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      qp.append(key, value);
    });
    const qs = qp.toString();
    return qs ? `?${qs}` : '';
  }

  async request(path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const config = { headers: this.getHeaders(options.headers), ...options };
    // If sending FormData, let browser set boundary header
    if (config.body instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) delete config.headers['Content-Type'];
    }
    let res = await fetch(url, config);
    if (res.status === 401 && (localStorage.getItem('refresh_token') || localStorage.getItem('django_refresh_token'))) {
      // try refresh flow if available in app's auth service endpoint
      try {
        const refreshToken = localStorage.getItem('django_refresh_token') || localStorage.getItem('refresh_token');
        const refreshRes = await fetch(`${DJANGO_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.access) {
            localStorage.setItem('access_token', data.access);
            this.token = data.access;
            config.headers = this.getHeaders(options.headers);
            res = await fetch(url, config);
          }
        }
      } catch {}
    }
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        message = data.detail || data.message || message;
      } catch {}
      throw new Error(message);
    }
    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }

  // Generic REST helpers
  list(resource, params = {}) { return this.request(`/${resource}/${this.buildQuery(params)}`); }
  retrieve(resource, id) { return this.request(`/${resource}/${id}/`); }
  create(resource, payload) { return this.request(`/${resource}/`, { method: 'POST', body: JSON.stringify(payload) }); }
  update(resource, id, payload) { return this.request(`/${resource}/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }); }
  partialUpdate(resource, id, payload) { return this.request(`/${resource}/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); }
  delete(resource, id) { return this.request(`/${resource}/${id}/`, { method: 'DELETE' }); }

  // Domain-specific conveniences
  // Events
  listEvents(params = {}) { return this.list('events', params); }
  getEvent(id) { return this.retrieve('events', id); }
  createEvent(payload) { return this.create('events', payload); }
  updateEvent(id, payload) { return this.update('events', id, payload); }
  patchEvent(id, payload) { return this.partialUpdate('events', id, payload); }
  deleteEvent(id) { return this.delete('events', id); }

  // Venues
  listVenues(params = {}) { return this.list('venues', params); }
  getVenue(id) { return this.retrieve('venues', id); }
  createVenue(payload) { return this.create('venues', payload); }
  updateVenue(id, payload) { return this.update('venues', id, payload); }
  patchVenue(id, payload) { return this.partialUpdate('venues', id, payload); }
  deleteVenue(id) { return this.delete('venues', id); }

  // Categories
  listCategories(params = {}) { return this.list('categories', params); }
  getCategory(id) { return this.retrieve('categories', id); }
  createCategory(payload) { return this.create('categories', payload); }
  updateCategory(id, payload) { return this.update('categories', id, payload); }
  patchCategory(id, payload) { return this.partialUpdate('categories', id, payload); }
  deleteCategory(id) { return this.delete('categories', id); }

  // Registrations
  listRegistrations(params = {}) { return this.list('registrations', params); }
  getRegistration(id) { return this.retrieve('registrations', id); }
  createRegistration(payload) { return this.create('registrations', payload); }
  updateRegistration(id, payload) { return this.update('registrations', id, payload); }
  patchRegistration(id, payload) { return this.partialUpdate('registrations', id, payload); }
  deleteRegistration(id) { return this.delete('registrations', id); }
}

const eventsApiService = new EventsApiService();
export default eventsApiService;


