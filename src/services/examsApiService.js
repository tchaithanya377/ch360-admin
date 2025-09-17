// Exams API Service
// Wraps all exams admin endpoints under api/v1/exams/api using djangoAuthService

import djangoAuthService from '../utils/djangoAuthService';
import { DJANGO_BASE_URL } from '../config/apiConfig';

const BASE_PATH = '/v1/exams/api';

const buildQuery = (params = {}) => {
	const qp = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return;
		if (Array.isArray(value)) value.forEach(v => qp.append(key, v));
		else qp.append(key, value);
	});
	const qs = qp.toString();
	return qs ? `?${qs}` : '';
};

const http = async (path, options = {}) => {
	const endpoint = `${BASE_PATH}${path}`;
	const res = await djangoAuthService.makeRequest(endpoint, options);
	return res;
};

const readJson = async (res) => {
	if (res.status === 204) return null;
	try { return await res.json(); } catch { return null; }
};

const ensureOk = async (res) => {
	if (res.ok) return res;
	let payload = null;
	try { payload = await res.json(); } catch {}
	const error = new Error(payload?.detail || payload?.message || `HTTP ${res.status}`);
	error.status = res.status;
	error.payload = payload;
	throw error;
};

const resource = (root) => ({
	list: async (params = {}) => readJson(await ensureOk(await http(`/${root}/${buildQuery(params)}`))),
	retrieve: async (id) => readJson(await ensureOk(await http(`/${root}/${id}/`))),
	create: async (data) => readJson(await ensureOk(await http(`/${root}/`, { method: 'POST', body: JSON.stringify(data) }))),
	update: async (id, data) => readJson(await ensureOk(await http(`/${root}/${id}/`, { method: 'PUT', body: JSON.stringify(data) }))),
	patch: async (id, data) => readJson(await ensureOk(await http(`/${root}/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }))),
	remove: async (id) => readJson(await ensureOk(await http(`/${root}/${id}/`, { method: 'DELETE' }))),
});

export const ExamsAPI = {
	// Dashboard & Reports
	dashboardStats: async () => readJson(await ensureOk(await http('/dashboard/stats/'))),
	examSummaryReport: async (params = {}) => readJson(await ensureOk(await http(`/reports/exam-summary/${buildQuery(params)}`))),
	studentPerformanceReport: async (params = {}) => readJson(await ensureOk(await http(`/reports/student-performance/${buildQuery(params)}`))),

	// Bulk operations
	bulkGenerateHallTickets: async (exam_schedule_id) => readJson(await ensureOk(await http('/bulk-operations/generate-hall-tickets/', { method: 'POST', body: JSON.stringify({ exam_schedule_id }) }))),
	bulkAssignRooms: async (exam_schedule_id, room_assignments) => readJson(await ensureOk(await http('/bulk-operations/assign-rooms/', { method: 'POST', body: JSON.stringify({ exam_schedule_id, room_assignments }) }))),
	bulkAssignStaff: async (exam_schedule_id, staff_assignments) => readJson(await ensureOk(await http('/bulk-operations/assign-staff/', { method: 'POST', body: JSON.stringify({ exam_schedule_id, staff_assignments }) }))),

	// Resources
	examSessions: {
		...resource('exam-sessions'),
		statistics: async (id) => readJson(await ensureOk(await http(`/exam-sessions/${id}/statistics/`))),
		examSchedules: async (id, params = {}) => readJson(await ensureOk(await http(`/exam-sessions/${id}/exam_schedules/${buildQuery(params)}`))),
		activeSessions: async () => readJson(await ensureOk(await http('/exam-sessions/active_sessions/'))),
	},
	examSchedules: {
		...resource('exam-schedules'),
		registrations: async (id, params = {}) => readJson(await ensureOk(await http(`/exam-schedules/${id}/registrations/${buildQuery(params)}`))),
		roomAllocations: async (id) => readJson(await ensureOk(await http(`/exam-schedules/${id}/room_allocations/`))),
		staffAssignments: async (id) => readJson(await ensureOk(await http(`/exam-schedules/${id}/staff_assignments/`))),
		startExam: async (id) => readJson(await ensureOk(await http(`/exam-schedules/${id}/start_exam/`, { method: 'POST' }))),
		endExam: async (id) => readJson(await ensureOk(await http(`/exam-schedules/${id}/end_exam/`, { method: 'POST' }))),
	},
	examRooms: {
		...resource('exam-rooms'),
		examAllocations: async (id, params = {}) => readJson(await ensureOk(await http(`/exam-rooms/${id}/exam_allocations/${buildQuery(params)}`))),
		availability: async (id, params = {}) => readJson(await ensureOk(await http(`/exam-rooms/${id}/availability/${buildQuery(params)}`))),
	},
	roomAllocations: resource('room-allocations'),
	staffAssignments: {
		...resource('staff-assignments'),
		toggleAvailability: async (id) => readJson(await ensureOk(await http(`/staff-assignments/${id}/toggle_availability/`, { method: 'POST' }))),
	},
	studentDues: {
		...resource('student-dues'),
		overdue: async (params = {}) => readJson(await ensureOk(await http(`/student-dues/overdue_dues/${buildQuery(params)}`))),
		studentDues: async (student_id) => readJson(await ensureOk(await http(`/student-dues/student_dues/${buildQuery({ student_id })}`))),
		updatePayment: async (id, payment_amount) => readJson(await ensureOk(await http(`/student-dues/${id}/update_payment/`, { method: 'POST', body: JSON.stringify({ payment_amount }) }))),
	},
	examRegistrations: {
		...resource('exam-registrations'),
		approve: async (id) => readJson(await ensureOk(await http(`/exam-registrations/${id}/approve_registration/`, { method: 'POST' }))),
		reject: async (id, rejection_reason) => readJson(await ensureOk(await http(`/exam-registrations/${id}/reject_registration/`, { method: 'POST', body: JSON.stringify({ rejection_reason }) }))),
		pendingApprovals: async (params = {}) => readJson(await ensureOk(await http(`/exam-registrations/pending_approvals/${buildQuery(params)}`))),
	},
	hallTickets: {
		...resource('hall-tickets'),
		print: async (id) => readJson(await ensureOk(await http(`/hall-tickets/${id}/print_ticket/`, { method: 'POST' }))),
		issue: async (id) => readJson(await ensureOk(await http(`/hall-tickets/${id}/issue_ticket/`, { method: 'POST' }))),
		downloadPdf: async (id) => ensureOk(await http(`/hall-tickets/${id}/download_pdf/`)), // caller handles blob
	},
	examAttendance: {
		...resource('exam-attendance'),
		markAttendance: async (id, payload) => readJson(await ensureOk(await http(`/exam-attendance/${id}/mark_attendance/`, { method: 'POST', body: JSON.stringify(payload) }))),
		checkOut: async (id) => readJson(await ensureOk(await http(`/exam-attendance/${id}/check_out/`, { method: 'POST' }))),
	},
	examViolations: {
		...resource('exam-violations'),
		resolve: async (id, payload) => readJson(await ensureOk(await http(`/exam-violations/${id}/resolve_violation/`, { method: 'POST', body: JSON.stringify(payload) }))),
	},
	examResults: {
		...resource('exam-results'),
		publish: async (id) => readJson(await ensureOk(await http(`/exam-results/${id}/publish_result/`, { method: 'POST' }))),
		studentResults: async (student_id, exam_session_id) => readJson(await ensureOk(await http(`/exam-results/student_results/${buildQuery({ student_id, exam_session_id })}`))),
		examResults: async (exam_schedule_id) => readJson(await ensureOk(await http(`/exam-results/exam_results/${buildQuery({ exam_schedule_id })}`))),
	},
};

export default ExamsAPI;
