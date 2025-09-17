import { DJANGO_BASE_URL } from '../config/apiConfig';
import djangoAuthService from '../utils/djangoAuthService';

const FEES_BASE = '/v1/fees/api';

const buildUrl = (path, params = null) => {
  const base = `${DJANGO_BASE_URL}${FEES_BASE}${path}`;
  if (!params) return base;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${base}?${qs}` : base;
};

// Build auth headers (always read the latest token)
const authHeaders = () => {
  const token = djangoAuthService.getToken();
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handle = async (res) => {
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch {}
    const message = data?.detail || data?.message || `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
};

// Generic helpers with token refresh + single retry on 401
const request = async (method, path, { params, body } = {}) => {
  await djangoAuthService.ensureValidToken();
  const url = buildUrl(path, params);
  const options = {
    method,
    headers: authHeaders(),
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  let res = await fetch(url, options);
  if (res.status === 401) {
    const refreshed = await djangoAuthService.refreshAccessToken();
    if (refreshed) {
      options.headers = authHeaders();
      res = await fetch(url, options);
    }
  }
  return handle(res);
};

const get = (path, params) => request('GET', path, { params });
const post = (path, body) => request('POST', path, { body });
const put = (path, body) => request('PUT', path, { body });
const patch = (path, body) => request('PATCH', path, { body });
const del = (path) => request('DELETE', path);

// Fees API
export const FeesAPI = {
  // Categories
  listCategories: (params) => get('/categories/', params),
  getCategory: (id) => get(`/categories/${id}/`),
  createCategory: (payload) => post('/categories/', payload),
  updateCategory: (id, payload) => put(`/categories/${id}/`, payload),
  partialUpdateCategory: (id, payload) => patch(`/categories/${id}/`, payload),
  deleteCategory: (id) => del(`/categories/${id}/`),
  listActiveCategories: () => get('/categories/active/'),

  // Structures
  listStructures: (params) => get('/structures/', params),
  getStructure: (id) => get(`/structures/${id}/`),
  createStructure: (payload) => post('/structures/', payload),
  updateStructure: (id, payload) => put(`/structures/${id}/`, payload),
  partialUpdateStructure: (id, payload) => patch(`/structures/${id}/`, payload),
  deleteStructure: (id) => del(`/structures/${id}/`),
  getStructureDetails: (id) => get(`/structures/${id}/details/`),
  listActiveStructures: () => get('/structures/active/'),
  listStructuresByAcademicYear: (academic_year) => get('/structures/by_academic_year/', { academic_year }),

  // Structure Details
  listStructureDetails: (params) => get('/structure-details/', params),
  getStructureDetail: (id) => get(`/structure-details/${id}/`),
  createStructureDetail: (payload) => post('/structure-details/', payload),
  updateStructureDetail: (id, payload) => put(`/structure-details/${id}/`, payload),
  partialUpdateStructureDetail: (id, payload) => patch(`/structure-details/${id}/`, payload),
  deleteStructureDetail: (id) => del(`/structure-details/${id}/`),

  // Student Fees
  listStudentFees: (params) => get('/student-fees/', params),
  getStudentFee: (id) => get(`/student-fees/${id}/`),
  createStudentFee: (payload) => post('/student-fees/', payload),
  updateStudentFee: (id, payload) => put(`/student-fees/${id}/`, payload),
  partialUpdateStudentFee: (id, payload) => patch(`/student-fees/${id}/`, payload),
  deleteStudentFee: (id) => del(`/student-fees/${id}/`),
  listOverdueStudentFees: () => get('/student-fees/overdue/'),
  listStudentFeesByStudent: (student_id) => get('/student-fees/by_student/', { student_id }),
  getStudentFeesSummary: () => get('/student-fees/summary/'),
  getStudentFeesStudentSummary: () => get('/student-fees/student_summary/'),

  // Payments
  listPayments: (params) => get('/payments/', params),
  getPayment: (id) => get(`/payments/${id}/`),
  createPayment: (payload) => post('/payments/', payload),
  updatePayment: (id, payload) => put(`/payments/${id}/`, payload),
  partialUpdatePayment: (id, payload) => patch(`/payments/${id}/`, payload),
  deletePayment: (id) => del(`/payments/${id}/`),
  listPaymentsByDateRange: (start_date, end_date) => get('/payments/by_date_range/', { start_date, end_date }),
  listPaymentsByMethod: (method) => get('/payments/by_method/', { method }),
  markPaymentCompleted: (id) => post(`/payments/${id}/mark_completed/`, {}),

  // Waivers
  listWaivers: (params) => get('/waivers/', params),
  getWaiver: (id) => get(`/waivers/${id}/`),
  createWaiver: (payload) => post('/waivers/', payload),
  updateWaiver: (id, payload) => put(`/waivers/${id}/`, payload),
  partialUpdateWaiver: (id, payload) => patch(`/waivers/${id}/`, payload),
  deleteWaiver: (id) => del(`/waivers/${id}/`),
  listActiveWaivers: () => get('/waivers/active/'),
  approveWaiver: (id) => post(`/waivers/${id}/approve/`, {}),

  // Discounts
  listDiscounts: (params) => get('/discounts/', params),
  getDiscount: (id) => get(`/discounts/${id}/`),
  createDiscount: (payload) => post('/discounts/', payload),
  updateDiscount: (id, payload) => put(`/discounts/${id}/`, payload),
  partialUpdateDiscount: (id, payload) => patch(`/discounts/${id}/`, payload),
  deleteDiscount: (id) => del(`/discounts/${id}/`),
  listActiveDiscounts: () => get('/discounts/active/'),
  listValidDiscounts: () => get('/discounts/valid/'),

  // Receipts
  listReceipts: (params) => get('/receipts/', params),
  getReceipt: (id) => get(`/receipts/${id}/`),
  createReceipt: (payload) => post('/receipts/', payload),
  updateReceipt: (id, payload) => put(`/receipts/${id}/`, payload),
  partialUpdateReceipt: (id, payload) => patch(`/receipts/${id}/`, payload),
  deleteReceipt: (id) => del(`/receipts/${id}/`),
  listUnprintedReceipts: () => get('/receipts/unprinted/'),
  markReceiptPrinted: (id) => post(`/receipts/${id}/mark_printed/`, {}),
  downloadReceipt: (id) => get(`/receipts/${id}/download/`),
};

export default FeesAPI;


