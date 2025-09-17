// Placements API Service
// Base: DJANGO_BASE_URL + "/v1/placements/api"
import djangoAuthService from "../utils/djangoAuthService";

// Important: DJANGO_BASE_URL already ends with "/api" → do NOT prefix "/api" here
const BASE = "/v1/placements/api";

const json = async (response) => {
	if (!response) return { success: false, error: "No response" };
	try {
		const data = await response.json();
		return { ok: response.ok, status: response.status, data };
	} catch (_) {
		return { ok: response.ok, status: response.status, data: null };
	}
};

const buildQuery = (params = {}) => {
	const qs = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") qs.append(k, v);
	});
	return qs.toString() ? `?${qs.toString()}` : "";
};

// Normalize absolute/relative cursor URLs to endpoints consumable by djangoAuthService
const normalizeCursorEndpoint = (cursorUrl) => {
	if (!cursorUrl) return null;
	try {
		const base = new URL(djangoAuthService.baseURL, window.location.origin);
		const u = new URL(cursorUrl, window.location.origin);
		// If cursor already includes the same base, reduce to path+search so makeRequest can prefix correctly
		if (u.href.startsWith(base.href)) {
			return `${u.pathname}${u.search}`;
		}
		// If cursor looks like a relative API path already, pass through
		if (cursorUrl.startsWith("/")) return cursorUrl;
		return `${u.pathname}${u.search}`;
	} catch (_) {
		return cursorUrl;
	}
};

export const placementsApi = {
	// Companies
	getCompanies: (params = {}) => {
		// CursorPagination support: if params.cursor provided, follow it
		if (params && params.cursor) {
			const endpoint = normalizeCursorEndpoint(params.cursor);
			return djangoAuthService.makeRequest(endpoint);
		}
		return djangoAuthService.makeRequest(`${BASE}/companies/${buildQuery(params)}`);
	},
	getCompany: (id) => djangoAuthService.makeRequest(`${BASE}/companies/${id}/`),
	createCompany: (payload) => djangoAuthService.makeRequest(`${BASE}/companies/`, { method: "POST", body: JSON.stringify(payload) }),
	updateCompany: (id, payload) => djangoAuthService.makeRequest(`${BASE}/companies/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteCompany: (id) => djangoAuthService.makeRequest(`${BASE}/companies/${id}/`, { method: "DELETE" }),
	getCompanyStatistics: (id) => djangoAuthService.makeRequest(`${BASE}/companies/${id}/statistics/`),

	// Jobs
	getJobs: (params = {}) => {
		if (params && params.cursor) {
			const endpoint = normalizeCursorEndpoint(params.cursor);
			return djangoAuthService.makeRequest(endpoint);
		}
		return djangoAuthService.makeRequest(`${BASE}/jobs/${buildQuery(params)}`);
	},
	getJob: (id) => djangoAuthService.makeRequest(`${BASE}/jobs/${id}/`),
	createJob: (payload) => djangoAuthService.makeRequest(`${BASE}/jobs/`, { method: "POST", body: JSON.stringify(payload) }),
	updateJob: (id, payload) => djangoAuthService.makeRequest(`${BASE}/jobs/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteJob: (id) => djangoAuthService.makeRequest(`${BASE}/jobs/${id}/`, { method: "DELETE" }),
	getJobApplications: (id, params = {}) => djangoAuthService.makeRequest(`${BASE}/jobs/${id}/applications/${buildQuery(params)}`),

	// Applications
	getApplications: (params = {}) => djangoAuthService.makeRequest(`${BASE}/applications/${buildQuery(params)}`),
	getApplication: (id) => djangoAuthService.makeRequest(`${BASE}/applications/${id}/`),
	createApplication: (payload) => djangoAuthService.makeRequest(`${BASE}/applications/`, { method: "POST", body: JSON.stringify(payload) }),
	updateApplication: (id, payload) => djangoAuthService.makeRequest(`${BASE}/applications/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteApplication: (id) => djangoAuthService.makeRequest(`${BASE}/applications/${id}/`, { method: "DELETE" }),

	// Drives
	getDrives: (params = {}) => djangoAuthService.makeRequest(`${BASE}/drives/${buildQuery(params)}`),
	getDrive: (id) => djangoAuthService.makeRequest(`${BASE}/drives/${id}/`),
	createDrive: (payload) => djangoAuthService.makeRequest(`${BASE}/drives/`, { method: "POST", body: JSON.stringify(payload) }),
	updateDrive: (id, payload) => djangoAuthService.makeRequest(`${BASE}/drives/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteDrive: (id) => djangoAuthService.makeRequest(`${BASE}/drives/${id}/`, { method: "DELETE" }),

	// Rounds
	getRounds: (params = {}) => djangoAuthService.makeRequest(`${BASE}/rounds/${buildQuery(params)}`),
	getRound: (id) => djangoAuthService.makeRequest(`${BASE}/rounds/${id}/`),
	createRound: (payload) => djangoAuthService.makeRequest(`${BASE}/rounds/`, { method: "POST", body: JSON.stringify(payload) }),
	updateRound: (id, payload) => djangoAuthService.makeRequest(`${BASE}/rounds/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteRound: (id) => djangoAuthService.makeRequest(`${BASE}/rounds/${id}/`, { method: "DELETE" }),

	// Offers
	getOffers: (params = {}) => djangoAuthService.makeRequest(`${BASE}/offers/${buildQuery(params)}`),
	getOffer: (id) => djangoAuthService.makeRequest(`${BASE}/offers/${id}/`),
	createOffer: (payload) => djangoAuthService.makeRequest(`${BASE}/offers/`, { method: "POST", body: JSON.stringify(payload) }),
	updateOffer: (id, payload) => djangoAuthService.makeRequest(`${BASE}/offers/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteOffer: (id) => djangoAuthService.makeRequest(`${BASE}/offers/${id}/`, { method: "DELETE" }),

	// Statistics
	getStatistics: (params = {}) => djangoAuthService.makeRequest(`${BASE}/statistics/${buildQuery(params)}`),
	getStatistic: (id) => djangoAuthService.makeRequest(`${BASE}/statistics/${id}/`),
	createStatistic: (payload) => djangoAuthService.makeRequest(`${BASE}/statistics/`, { method: "POST", body: JSON.stringify(payload) }),
	updateStatistic: (id, payload) => djangoAuthService.makeRequest(`${BASE}/statistics/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteStatistic: (id) => djangoAuthService.makeRequest(`${BASE}/statistics/${id}/`, { method: "DELETE" }),
	getStatisticsOverview: () => djangoAuthService.makeRequest(`${BASE}/statistics/overview/`),

	// Feedbacks
	getFeedbacks: (params = {}) => djangoAuthService.makeRequest(`${BASE}/feedbacks/${buildQuery(params)}`),
	getFeedback: (id) => djangoAuthService.makeRequest(`${BASE}/feedbacks/${id}/`),
	createFeedback: (payload) => djangoAuthService.makeRequest(`${BASE}/feedbacks/`, { method: "POST", body: JSON.stringify(payload) }),
	updateFeedback: (id, payload) => djangoAuthService.makeRequest(`${BASE}/feedbacks/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteFeedback: (id) => djangoAuthService.makeRequest(`${BASE}/feedbacks/${id}/`, { method: "DELETE" }),

	// Documents
	getDocuments: (params = {}) => djangoAuthService.makeRequest(`${BASE}/documents/${buildQuery(params)}`),
	getDocument: (id) => djangoAuthService.makeRequest(`${BASE}/documents/${id}/`),
	createDocument: (payload) => djangoAuthService.makeRequest(`${BASE}/documents/`, { method: "POST", body: JSON.stringify(payload) }),
	updateDocument: (id, payload) => djangoAuthService.makeRequest(`${BASE}/documents/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteDocument: (id) => djangoAuthService.makeRequest(`${BASE}/documents/${id}/`, { method: "DELETE" }),

	// Alumni
	getAlumni: (params = {}) => djangoAuthService.makeRequest(`${BASE}/alumni/${buildQuery(params)}`),
	getAlumnus: (id) => djangoAuthService.makeRequest(`${BASE}/alumni/${id}/`),
	createAlumnus: (payload) => djangoAuthService.makeRequest(`${BASE}/alumni/`, { method: "POST", body: JSON.stringify(payload) }),
	updateAlumnus: (id, payload) => djangoAuthService.makeRequest(`${BASE}/alumni/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
	deleteAlumnus: (id) => djangoAuthService.makeRequest(`${BASE}/alumni/${id}/`, { method: "DELETE" }),
	getAlumniNetwork: () => djangoAuthService.makeRequest(`${BASE}/alumni/alumni-network/`),

	// Analytics
	getTrends: (params = {}) => djangoAuthService.makeRequest(`${BASE}/analytics/trends/${buildQuery(params)}`),
	getNirfReport: (params = {}) => djangoAuthService.makeRequest(`${BASE}/analytics/nirf-report/${buildQuery(params)}`),
};

export const placementsApiJson = {
	...Object.fromEntries(
		Object.entries(placementsApi).map(([k, fn]) => [
			k,
			async (...args) => {
				const res = await fn(...args);
				return json(res);
			},
		])
	),
};

// Specialized helpers
export const placementsUploads = {
	// Documents: always multipart/form-data
	createDocumentUpload: async (payload = {}) => {
		const form = new FormData();
		Object.entries(payload).forEach(([k, v]) => {
			if (v !== undefined && v !== null) form.append(k, v);
		});
		const res = await djangoAuthService.makeRequest(`${BASE}/documents/`, {
			method: "POST",
			body: form,
		});
		return json(res);
	},
	// Applications with resume upload (optional)
	createApplicationUpload: async (payload = {}) => {
		const form = new FormData();
		Object.entries(payload).forEach(([k, v]) => {
			if (v !== undefined && v !== null) form.append(k, v);
		});
		const res = await djangoAuthService.makeRequest(`${BASE}/applications/`, {
			method: "POST",
			body: form,
		});
		return json(res);
	},
};

// Cursor helper for following `next`/`previous` links (JSON-wrapped)
export const placementsCursorJson = {
	get: async (cursorUrl) => {
		const endpoint = normalizeCursorEndpoint(cursorUrl);
		const res = await djangoAuthService.makeRequest(endpoint);
		return json(res);
	},
};

export default placementsApi;


