import { DJANGO_BASE_URL } from '../config/apiConfig';

// Lightweight generic API wrapper
class GenericApiService {
  constructor(basePath) {
    this.baseURL = `${DJANGO_BASE_URL}`.replace(/\/$/, '');
    this.basePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
    this.token = localStorage.getItem('django_token') || localStorage.getItem('access_token') || '';
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async request(endpoint = '/', options = {}) {
    const url = `${this.baseURL}${this.basePath}${endpoint}`;
    const res = await fetch(url, { headers: this.getHeaders(), ...options });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const data = await res.json(); msg = data.detail || data.message || msg; } catch {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }

  list(params = {}) {
    const qp = new URLSearchParams(params).toString();
    const ep = qp ? `/?${qp}` : '/';
    return this.request(ep);
  }
  retrieve(id) { return this.request(`/${id}/`); }
  create(payload) { return this.request('/', { method: 'POST', body: JSON.stringify(payload) }); }
  update(id, payload) { return this.request(`/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }); }
  partialUpdate(id, payload) { return this.request(`/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); }
  delete(id) { return this.request(`/${id}/`, { method: 'DELETE' }); }
}

// Central registry of API roots
export const API_ENDPOINTS = {
  auth: {
    token_obtain_pair: '/auth/token/',
    token_refresh: '/auth/token/refresh/'
  },
  accounts: '/accounts',
  students: '/v1/students',
  faculty: '/v1/faculty/api',
  academics: '/v1/academics',
  departments: '/v1/departments',
  attendance: '/v1/attendance',
  grads: '/v1/grads',
  rnd: '/v1/rnd',
  facilities: '/v1/facilities',
  exams: '/v1/exams',
  fees: '/v1/fees/api',
  transport: '/v1/transport',
  mentoring: '/v1/mentoring',
  feedback: '/v1/feedback',
  open_requests: '/v1/open-requests',
  assignments: '/v1/assignments'
};

// Export ready-to-use service instances
export const AccountsApi = new GenericApiService(API_ENDPOINTS.accounts);
export const StudentsApi = new GenericApiService(API_ENDPOINTS.students);
export const FacultyApi = new GenericApiService(API_ENDPOINTS.faculty);
export const AcademicsApi = new GenericApiService(API_ENDPOINTS.academics);
export const DepartmentsApi = new GenericApiService(API_ENDPOINTS.departments);
export const AttendanceApi = new GenericApiService(API_ENDPOINTS.attendance);
export const GradsApi = new GenericApiService(API_ENDPOINTS.grads);
export const RnDApi = new GenericApiService(API_ENDPOINTS.rnd);
export const FacilitiesApi = new GenericApiService(API_ENDPOINTS.facilities);
export const ExamsApi = new GenericApiService(API_ENDPOINTS.exams);
export const FeesApi = new GenericApiService(API_ENDPOINTS.fees);
export const TransportApi = new GenericApiService(API_ENDPOINTS.transport);
export const MentoringApi = new GenericApiService(API_ENDPOINTS.mentoring);
export const FeedbackApi = new GenericApiService(API_ENDPOINTS.feedback);
export const OpenRequestsApi = new GenericApiService(API_ENDPOINTS.open_requests);
export const AssignmentsApi = new GenericApiService(API_ENDPOINTS.assignments);

// Fees resources (specialized service lives in feesApiService.js)
export const FeesCategoriesApi = new GenericApiService(`${API_ENDPOINTS.fees}/categories`);
export const FeesStructuresApi = new GenericApiService(`${API_ENDPOINTS.fees}/structures`);
export const FeesStructureDetailsApi = new GenericApiService(`${API_ENDPOINTS.fees}/structure-details`);
export const StudentFeesApi = new GenericApiService(`${API_ENDPOINTS.fees}/student-fees`);
export const PaymentsApi = new GenericApiService(`${API_ENDPOINTS.fees}/payments`);
export const WaiversApi = new GenericApiService(`${API_ENDPOINTS.fees}/waivers`);
export const DiscountsApi = new GenericApiService(`${API_ENDPOINTS.fees}/discounts`);
export const ReceiptsApi = new GenericApiService(`${API_ENDPOINTS.fees}/receipts`);

export default GenericApiService;


