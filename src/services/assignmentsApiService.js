import { DJANGO_BASE_URL } from '../config/apiConfig';

class AssignmentsApiService {
  constructor() {
    this.baseURL = `${DJANGO_BASE_URL}/v1/assignments`;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ==================== ASSIGNMENT CATEGORIES ====================
  
  // GET /api/v1/assignments/categories/
  async getCategories() {
    const response = await fetch(`${this.baseURL}/categories/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/categories/
  async createCategory(categoryData) {
    const response = await fetch(`${this.baseURL}/categories/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/categories/<uuid:pk>/
  async getCategory(categoryId) {
    const response = await fetch(`${this.baseURL}/categories/${categoryId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // PUT /api/v1/assignments/categories/<uuid:pk>/
  async updateCategory(categoryId, categoryData) {
    const response = await fetch(`${this.baseURL}/categories/${categoryId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse(response);
  }

  // PATCH /api/v1/assignments/categories/<uuid:pk>/
  async patchCategory(categoryId, categoryData) {
    const response = await fetch(`${this.baseURL}/categories/${categoryId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse(response);
  }

  // DELETE /api/v1/assignments/categories/<uuid:pk>/
  async deleteCategory(categoryId) {
    const response = await fetch(`${this.baseURL}/categories/${categoryId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) {
      return { success: true };
    }
    return this.handleResponse(response);
  }

  // ==================== ASSIGNMENT TEMPLATES ====================
  
  // GET /api/v1/assignments/templates/
  async getTemplates() {
    const response = await fetch(`${this.baseURL}/templates/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/templates/
  async createTemplate(templateData) {
    const response = await fetch(`${this.baseURL}/templates/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/templates/<uuid:pk>/
  async getTemplate(templateId) {
    const response = await fetch(`${this.baseURL}/templates/${templateId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // PUT /api/v1/assignments/templates/<uuid:pk>/
  async updateTemplate(templateId, templateData) {
    const response = await fetch(`${this.baseURL}/templates/${templateId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
    return this.handleResponse(response);
  }

  // PATCH /api/v1/assignments/templates/<uuid:pk>/
  async patchTemplate(templateId, templateData) {
    const response = await fetch(`${this.baseURL}/templates/${templateId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
    return this.handleResponse(response);
  }

  // DELETE /api/v1/assignments/templates/<uuid:pk>/
  async deleteTemplate(templateId) {
    const response = await fetch(`${this.baseURL}/templates/${templateId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) {
      return { success: true };
    }
    return this.handleResponse(response);
  }

  // ==================== ASSIGNMENTS ====================
  
  // GET /api/v1/assignments/simple/
  async getAssignmentsSimple(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/simple/?${queryParams.toString()}` , {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/simple/
  async createAssignmentSimple(assignmentData) {
    const response = await fetch(`${this.baseURL}/simple/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return this.handleResponse(response);
  }

  // PUT/PATCH /api/v1/assignments/simple/<uuid:pk>/
  async updateAssignmentSimple(assignmentId, assignmentData, method = 'PATCH') {
    const response = await fetch(`${this.baseURL}/simple/${assignmentId}/`, {
      method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/
  async getAssignments(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/
  async createAssignment(assignmentData) {
    const response = await fetch(`${this.baseURL}/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/<uuid:pk>/
  async getAssignment(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // PUT /api/v1/assignments/<uuid:pk>/
  async updateAssignment(assignmentId, assignmentData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return this.handleResponse(response);
  }

  // PATCH /api/v1/assignments/<uuid:pk>/
  async patchAssignment(assignmentId, assignmentData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return this.handleResponse(response);
  }

  // DELETE /api/v1/assignments/<uuid:pk>/
  async deleteAssignment(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) {
      return { success: true };
    }
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/my-assignments/
  async getMyAssignments() {
    const response = await fetch(`${this.baseURL}/my-assignments/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/publish/
  async publishAssignment(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/publish/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/close/
  async closeAssignment(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/close/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/assign-section/
  async assignSection(assignmentId, payload) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/assign-section/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/auto-groups/
  async autoCreateGroups(assignmentId, payload) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/auto-groups/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // ==================== ASSIGNMENT SUBMISSIONS ====================
  
  // GET /api/v1/assignments/<uuid:assignment_id>/submissions/
  async getAssignmentSubmissions(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/submissions/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/submit/
  async submitAssignment(assignmentId, submissionData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/submit/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/submissions/<uuid:pk>/
  async getSubmission(submissionId) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // PUT /api/v1/assignments/submissions/<uuid:pk>/
  async updateSubmission(submissionId, submissionData) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return this.handleResponse(response);
  }

  // PATCH /api/v1/assignments/submissions/<uuid:pk>/
  async patchSubmission(submissionId, submissionData) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return this.handleResponse(response);
  }

  // DELETE /api/v1/assignments/submissions/<uuid:pk>/
  async deleteSubmission(submissionId) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) {
      return { success: true };
    }
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/submissions/<uuid:submission_id>/grade/
  async gradeSubmission(submissionId, gradeData) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/grade/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(gradeData),
    });
    return this.handleResponse(response);
  }

  // ==================== ASSIGNMENT COMMENTS ====================
  
  // GET /api/v1/assignments/<uuid:assignment_id>/comments/
  async getAssignmentComments(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/comments/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/<uuid:assignment_id>/comments/
  async createAssignmentComment(assignmentId, commentData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/comments/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(commentData),
    });
    return this.handleResponse(response);
  }

  // ==================== FILE UPLOAD ====================
  
  // POST /api/v1/assignments/files/upload/
  async uploadFile(file, assignmentId = null, extra = {}) {
    const formData = new FormData();
    // Backend expects field name `file_path`
    formData.append('file_path', file);
    if (assignmentId) {
      formData.append('assignment_id', assignmentId);
    }
    // Allow passing optional metadata such as file_name
    Object.entries(extra || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${this.baseURL}/files/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // ==================== ASSIGNMENT STATISTICS ====================
  
  // GET /api/v1/assignments/stats
  async getAssignmentStats() {
    const response = await fetch(`${this.baseURL}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== RUBRICS ====================
  // GET /api/v1/assignments/rubrics/
  async getRubrics(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/rubrics/?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/rubrics/
  async createRubric(rubricData) {
    const response = await fetch(`${this.baseURL}/rubrics/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(rubricData),
    });
    return this.handleResponse(response);
  }

  // GET /api/v1/assignments/rubrics/{id}/
  async getRubric(rubricId) {
    const response = await fetch(`${this.baseURL}/rubrics/${rubricId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // PATCH /api/v1/assignments/rubrics/{id}/
  async updateRubric(rubricId, rubricData) {
    const response = await fetch(`${this.baseURL}/rubrics/${rubricId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(rubricData),
    });
    return this.handleResponse(response);
  }

  // DELETE /api/v1/assignments/rubrics/{id}/
  async deleteRubric(rubricId) {
    const response = await fetch(`${this.baseURL}/rubrics/${rubricId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) return { success: true };
    return this.handleResponse(response);
  }

  // POST/PATCH /api/v1/assignments/submissions/{submission_id}/rubric-grade/
  async upsertRubricGrade(submissionId, gradeData, method = 'POST') {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/rubric-grade/`, {
      method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(gradeData),
    });
    return this.handleResponse(response);
  }

  // ==================== LEARNING OUTCOMES ====================
  // GET/POST /api/v1/assignments/{assignment_id}/learning-outcomes/
  async getLearningOutcomes(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/learning-outcomes/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createLearningOutcome(assignmentId, outcomeData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/learning-outcomes/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(outcomeData),
    });
    return this.handleResponse(response);
  }

  // ==================== PEER REVIEWS ====================
  // GET/POST /api/v1/assignments/{assignment_id}/peer-reviews/
  async getPeerReviews(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/peer-reviews/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createPeerReview(assignmentId, reviewData) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/peer-reviews/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/{assignment_id}/assign-peer-reviews/
  async assignPeerReviews(assignmentId, payload = {}) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/assign-peer-reviews/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // ==================== PLAGIARISM CHECKS ====================
  // GET/POST /api/v1/assignments/{assignment_id}/plagiarism-checks/
  async getPlagiarismChecks(assignmentId) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/plagiarism-checks/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async triggerPlagiarismCheckForAssignment(assignmentId, payload = { trigger: 'MANUAL' }) {
    const response = await fetch(`${this.baseURL}/${assignmentId}/plagiarism-checks/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  // POST /api/v1/assignments/submissions/{submission_id}/run-plagiarism-check/
  async runPlagiarismCheckForSubmission(submissionId) {
    const response = await fetch(`${this.baseURL}/submissions/${submissionId}/run-plagiarism-check/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== ANALYTICS ====================
  // GET /api/v1/assignments/{assignment_id}/analytics/
  async getAssignmentAnalytics(assignmentId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/${assignmentId}/analytics/?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== NOTIFICATIONS ====================
  // GET/POST /api/v1/assignments/notifications/
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/notifications/?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createNotification(notificationData) {
    const response = await fetch(`${this.baseURL}/notifications/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });
    return this.handleResponse(response);
  }

  // GET/PATCH/DELETE /api/v1/assignments/notifications/{id}/
  async getNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async patchNotification(notificationId, data) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) return { success: true };
    return this.handleResponse(response);
  }

  // ==================== SCHEDULES ====================
  // GET/POST /api/v1/assignments/schedules/
  async getSchedules(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseURL}/schedules/?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createSchedule(scheduleData) {
    const response = await fetch(`${this.baseURL}/schedules/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(scheduleData),
    });
    return this.handleResponse(response);
  }

  // GET/PATCH/DELETE /api/v1/assignments/schedules/{id}/
  async getSchedule(scheduleId) {
    const response = await fetch(`${this.baseURL}/schedules/${scheduleId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async patchSchedule(scheduleId, data) {
    const response = await fetch(`${this.baseURL}/schedules/${scheduleId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteSchedule(scheduleId) {
    const response = await fetch(`${this.baseURL}/schedules/${scheduleId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (response.ok) return { success: true };
    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
const assignmentsApiService = new AssignmentsApiService();
export default assignmentsApiService;

