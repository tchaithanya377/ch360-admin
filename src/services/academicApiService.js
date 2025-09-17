import { getApiConfig } from '../config/apiConfig';

const API_BASE_URL = getApiConfig().baseURL;

class AcademicApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/v1/academics/api`;
    this.studentsBaseURL = `${API_BASE_URL}/v1/students`;
  }

  // Build query string from params while removing undefined/null/empty values
  buildQuery(params = {}) {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined, null, empty string, or strings that are just whitespace
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && value.trim() === '') return;
      cleaned[key] = value;
    });
    const queryString = new URLSearchParams(cleaned).toString();
    return queryString ? `?${queryString}` : '';
  }

  // Generic request method with error handling
  async makeRequest(endpoint, options = {}) {
    // Try both token storage keys for compatibility
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const fullURL = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${fullURL}`);
      console.log('Request config:', config);
      
      const response = await fetch(fullURL, config);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Return empty data structure for 404 errors (endpoints not implemented)
          console.warn(`Academic API endpoint not implemented: ${fullURL}`);
          return { results: [], count: 0, next: null, previous: null };
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        console.error('Response Status:', response.status);
        console.error('Response Headers:', response.headers);
        
        // Handle different error formats
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // Handle field validation errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // Return empty data structure for network errors
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return { results: [], count: 0, next: null, previous: null };
      }
      throw error;
    }
  }

  // Students API request (separate base URL)
  async makeStudentsRequest(endpoint, options = {}) {
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    const config = {
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    try {
      const fullURL = endpoint.startsWith('http') ? endpoint : `${this.studentsBaseURL}${endpoint}`;
      console.log(`Making Students API request to: ${fullURL}`);
      const response = await fetch(fullURL, config);
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Students API error ${response.status}: ${errorText}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error(`Students API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== COURSES API ====================
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/courses/${queryString ? `?${queryString}` : ''}`);
  }

  async getCourse(id) {
    return this.makeRequest(`/courses/${id}/`);
  }

  async createCourse(data) {
    return this.makeRequest('/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id, data) {
    return this.makeRequest(`/courses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchCourse(id, data) {
    return this.makeRequest(`/courses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id) {
    return this.makeRequest(`/courses/${id}/`, {
      method: 'DELETE',
    });
  }

  // Course Custom Actions
  async getCourseDetail(id) {
    return this.makeRequest(`/courses/${id}/detail/`);
  }

  async getCoursesByFaculty(facultyId) {
    return this.makeRequest(`/courses/by_faculty/?faculty_id=${facultyId}`);
  }

  async getCoursesByLevel(level) {
    return this.makeRequest(`/courses/by_level/?level=${level}`);
  }

  async getCourseStatistics() {
    return this.makeRequest('/courses/statistics/');
  }

  // ==================== SYLLABI API ====================
  async getSyllabi(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/syllabi/${queryString ? `?${queryString}` : ''}`);
  }

  async getSyllabus(id) {
    return this.makeRequest(`/syllabi/${id}/`);
  }

  async createSyllabus(data) {
    return this.makeRequest('/syllabi/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSyllabus(id, data) {
    return this.makeRequest(`/syllabi/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchSyllabus(id, data) {
    return this.makeRequest(`/syllabi/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSyllabus(id) {
    return this.makeRequest(`/syllabi/${id}/`, {
      method: 'DELETE',
    });
  }

  // Syllabi Custom Actions
  async getSyllabusDetail(id) {
    return this.makeRequest(`/syllabi/${id}/detail/`);
  }

  async approveSyllabus(id) {
    return this.makeRequest(`/syllabi/${id}/approve/`, {
      method: 'POST',
    });
  }

  async getSyllabiByAcademicYear(year) {
    return this.makeRequest(`/syllabi/by_academic_year/?academic_year=${year}`);
  }

  // ==================== SYLLABUS TOPICS API ====================
  async getSyllabusTopics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/syllabus-topics/${queryString ? `?${queryString}` : ''}`);
  }

  async getSyllabusTopic(id) {
    return this.makeRequest(`/syllabus-topics/${id}/`);
  }

  async createSyllabusTopic(data) {
    return this.makeRequest('/syllabus-topics/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSyllabusTopic(id, data) {
    return this.makeRequest(`/syllabus-topics/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchSyllabusTopic(id, data) {
    return this.makeRequest(`/syllabus-topics/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSyllabusTopic(id) {
    return this.makeRequest(`/syllabus-topics/${id}/`, {
      method: 'DELETE',
    });
  }

  // ==================== TIMETABLES API ====================
  async getTimetables(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/timetables/${queryString ? `?${queryString}` : ''}`);
  }

  async getTimetable(id) {
    return this.makeRequest(`/timetables/${id}/`);
  }

  async createTimetable(data) {
    return this.makeRequest('/timetables/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimetable(id, data) {
    return this.makeRequest(`/timetables/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchTimetable(id, data) {
    return this.makeRequest(`/timetables/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTimetable(id) {
    return this.makeRequest(`/timetables/${id}/`, {
      method: 'DELETE',
    });
  }

  // Timetables Custom Actions
  async getTimetableDetail(id) {
    return this.makeRequest(`/timetables/${id}/detail/`);
  }

  async getWeeklySchedule(facultyId, courseId) {
    return this.makeRequest(`/timetables/weekly_schedule/?faculty_id=${facultyId}&course_id=${courseId}`);
  }

  async checkTimetableConflicts(facultyId, room) {
    return this.makeRequest(`/timetables/conflicts/?faculty_id=${facultyId}&room=${room}`);
  }

  // ==================== COURSE SECTIONS API ====================
  async getCourseSections(params = {}) {
    return this.makeRequest(`/course-sections/${this.buildQuery(params)}`);
  }

  // ==================== STUDENT BATCHES (Students service) ====================
  // Lock to the canonical path: /api/v1/students/api/student-batches/
  async getStudentBatches(params = {}) {
    // Ensure is_active default true; strip empty values
    const queryString = this.buildQuery({ is_active: 'true', page_size: 100, ...params });

    // 0) First, try the EXACT endpoint the user specified:
    // /api/v1/students/student-batches/
    try {
      const exactData = await this.makeStudentsRequest(`/student-batches/${queryString}`);
      const exactResults = Array.isArray(exactData) ? exactData : (exactData?.results || exactData?.items || []);
      if (Array.isArray(exactResults) && exactResults.length > 0) {
        return { results: exactResults };
      }
    } catch (err) {
      const message = String(err?.message || '').toLowerCase();
      if (!(message.includes('404') || message.includes('not found'))) {
        throw err;
      }
    }

    // 1) Prefer a Divisions-style endpoint and normalize if present
    try {
      const divData = await this.makeStudentsRequest(`/students/divisions/${queryString}`);
      const divResults = Array.isArray(divData) ? divData : (divData?.results || divData?.items || []);
      if (Array.isArray(divResults)) {
        const normalized = divResults.map(d => ({
          id: d.id ?? d.pk ?? d.uuid ?? d.division_id,
          batch_name: d.batch_name ?? d.name ?? d.title ?? d.division_name ?? `Division ${d.id ?? d.pk ?? ''}`,
          academic_year: d.academic_year_display ?? d.academic_year ?? d.ay,
          semester: d.semester ?? d.sem,
          section: d.section ?? d.sec,
          department: d.department ?? d.department_id,
          department_name: d.department_name ?? d.department,
          academic_program: d.academic_program ?? d.program_id,
          academic_program_name: d.academic_program_name ?? d.program_name,
          students_count: d.students_count ?? d.count ?? 0,
          _source: 'division',
          ...d,
        })).filter(x => x.id != null);
        // Only use divisions if we actually have some; otherwise fall through to student-batches endpoints
        if (normalized.length > 0) {
          return { results: normalized };
        }
      }
    } catch (err) {
      const message = String(err?.message || '').toLowerCase();
      if (!(message.includes('404') || message.includes('not found'))) {
        throw err;
      }
    }

    // 2) If not found yet, try a sequence of likely batch endpoints
    const candidateEndpoints = [
      `/student-batches/${queryString}`,
      `/students/batches/${queryString}`,
      `/batches/${queryString}`,
      `/student_batches/${queryString}`,
      `/students/student-batches/${queryString}`,
    ];
    for (const ep of candidateEndpoints) {
      try {
        const data = await this.makeStudentsRequest(ep);
        const results = Array.isArray(data) ? data : (data?.results || data?.items || []);
        if (Array.isArray(results)) {
          return { results };
        }
      } catch (err) {
        const message = String(err?.message || '').toLowerCase();
        if (!(message.includes('404') || message.includes('not found'))) {
          throw err;
        }
      }
    }
    // As a final fallback, try the Academics API namespace
    const academicsCandidates = [
      `/student-batches/${queryString}`,
      `/batches/${queryString}`,
      `/students/batches/${queryString}`,
    ];
    for (const ep of academicsCandidates) {
      try {
        const data = await this.makeRequest(ep);
        const results = Array.isArray(data) ? data : (data?.results || data?.items || []);
        if (Array.isArray(results)) {
          return { results };
        }
      } catch (err) {
        const message = String(err?.message || '').toLowerCase();
        if (!(message.includes('404') || message.includes('not found'))) {
          throw err;
        }
      }
    }
    // If none worked, return empty list to keep UI functional
    console.warn('Student batches endpoint not found on Students or Academics API. Returning empty list.');
    return { results: [] };
  }

  async getCourseSection(id) {
    return this.makeRequest(`/course-sections/${id}/`);
  }

  async createCourseSection(data) {
    return this.makeRequest('/course-sections/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourseSection(id, data) {
    return this.makeRequest(`/course-sections/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchCourseSection(id, data) {
    return this.makeRequest(`/course-sections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCourseSection(id) {
    return this.makeRequest(`/course-sections/${id}/`, {
      method: 'DELETE',
    });
  }

  // Course Sections Custom Actions
  async getCourseSectionsByCourse(courseId) {
    return this.makeRequest(`/course-sections/by_course/?course_id=${courseId}`);
  }

  async getCourseSectionsByFaculty(facultyId) {
    return this.makeRequest(`/course-sections/by_faculty/?faculty_id=${facultyId}`);
  }

  async getCourseSectionsByBatch(batchId) {
    return this.makeRequest(`/course-sections/by_batch/?batch_id=${batchId}`);
  }

  async getAvailableSections(courseId) {
    return this.makeRequest(`/course-sections/available_sections/?course_id=${courseId}`);
  }

  // ==================== ENROLLMENTS API ====================
  async getEnrollments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/enrollments/${queryString ? `?${queryString}` : ''}`);
  }

  async getEnrollment(id) {
    return this.makeRequest(`/enrollments/${id}/`);
  }

  async createEnrollment(data) {
    return this.makeRequest('/enrollments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEnrollment(id, data) {
    return this.makeRequest(`/enrollments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchEnrollment(id, data) {
    return this.makeRequest(`/enrollments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEnrollment(id) {
    return this.makeRequest(`/enrollments/${id}/`, {
      method: 'DELETE',
    });
  }

  // Enrollments Custom Actions
  async getEnrollmentsByStudent(studentId) {
    return this.makeRequest(`/enrollments/by_student/?student_id=${studentId}`);
  }

  async getEnrollmentsByCourse(courseId) {
    return this.makeRequest(`/enrollments/by_course/?course_id=${courseId}`);
  }

  async getEnrollmentsByBatch(batchId) {
    return this.makeRequest(`/enrollments/by_batch/?batch_id=${batchId}`);
  }

  async getEnrollmentsByCourseSection(sectionId) {
    return this.makeRequest(`/enrollments/by_course_section/?section_id=${sectionId}`);
  }

  async getBatchEnrollmentSummary(batchId, courseId) {
    return this.makeRequest(`/enrollments/batch_enrollment_summary/?batch_id=${batchId}&course_id=${courseId}`);
  }

  async getEnrollmentStatistics() {
    return this.makeRequest('/enrollments/statistics/');
  }

  // ==================== BATCH ENROLLMENTS API ====================
  async getBatchEnrollments(params = {}) {
    const queryString = this.buildQuery(params);
    return this.makeRequest(`/batch-enrollments/${queryString}`);
  }

  async getBatchEnrollment(id) {
    return this.makeRequest(`/batch-enrollments/${id}/`);
  }

  async createBatchEnrollment(data) {
    return this.makeRequest('/batch-enrollments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBatchEnrollment(id, data) {
    return this.makeRequest(`/batch-enrollments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchBatchEnrollment(id, data) {
    return this.makeRequest(`/batch-enrollments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBatchEnrollment(id) {
    return this.makeRequest(`/batch-enrollments/${id}/`, {
      method: 'DELETE',
    });
  }

  // Batch Enrollments Custom Actions
  async getBatchEnrollmentDetail(id) {
    return this.makeRequest(`/batch-enrollments/${id}/detail/`);
  }

  async enrollStudentsToBatch(id, studentIds) {
    return this.makeRequest(`/batch-enrollments/${id}/enroll_students/`, {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  }

  async activateBatchEnrollment(id) {
    return this.makeRequest(`/batch-enrollments/${id}/activate/`, {
      method: 'POST',
    });
  }

  async deactivateBatchEnrollment(id) {
    return this.makeRequest(`/batch-enrollments/${id}/deactivate/`, {
      method: 'POST',
    });
  }

  async getBatchEnrollmentsByBatch(batchId) {
    return this.makeRequest(`/batch-enrollments/by_batch/?batch_id=${batchId}`);
  }

  async getBatchEnrollmentsByCourse(courseId) {
    return this.makeRequest(`/batch-enrollments/by_course/?course_id=${courseId}`);
  }

  async getBatchEnrollmentStatistics() {
    return this.makeRequest('/batch-enrollments/statistics/');
  }

  async bulkEnrollBatchesToCourses(data) {
    return this.makeRequest('/batch-enrollments/bulk_enroll/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Fetch DRF OPTIONS metadata to discover valid choices
  async getBatchEnrollmentOptions() {
    try {
      const res = await this.makeRequest('/batch-enrollments/', { method: 'OPTIONS' });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      // DRF typically exposes: data.actions.POST.status.choices => [{value, display_name}]
      const postActions = data?.actions?.POST || {};
      const statusChoices = Array.isArray(postActions?.status?.choices) ? postActions.status.choices : [];
      return { statusChoices };
    } catch (_) {
      return null;
    }
  }

  // ==================== COURSE PREREQUISITES API ====================
  async getCoursePrerequisites(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/course-prerequisites/${queryString ? `?${queryString}` : ''}`);
  }

  async getCoursePrerequisite(id) {
    return this.makeRequest(`/course-prerequisites/${id}/`);
  }

  async createCoursePrerequisite(data) {
    return this.makeRequest('/course-prerequisites/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoursePrerequisite(id, data) {
    return this.makeRequest(`/course-prerequisites/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchCoursePrerequisite(id, data) {
    return this.makeRequest(`/course-prerequisites/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCoursePrerequisite(id) {
    return this.makeRequest(`/course-prerequisites/${id}/`, {
      method: 'DELETE',
    });
  }

  // Course Prerequisites Custom Actions
  async getPrerequisitesByCourse(courseId) {
    return this.makeRequest(`/course-prerequisites/by_course/?course_id=${courseId}`);
  }

  async getPrerequisitesByBatch(batchId) {
    return this.makeRequest(`/course-prerequisites/by_batch/?batch_id=${batchId}`);
  }

  async checkPrerequisites(studentId, batchId, courseId) {
    return this.makeRequest(`/course-prerequisites/check_prerequisites/?student_id=${studentId}&batch_id=${batchId}&course_id=${courseId}`);
  }

  // ==================== ACADEMIC CALENDAR API ====================
  async getAcademicCalendar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/academic-calendar/${queryString ? `?${queryString}` : ''}`);
  }

  async getAcademicCalendarEvent(id) {
    return this.makeRequest(`/academic-calendar/${id}/`);
  }

  async createAcademicCalendarEvent(data) {
    return this.makeRequest('/academic-calendar/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAcademicCalendarEvent(id, data) {
    return this.makeRequest(`/academic-calendar/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchAcademicCalendarEvent(id, data) {
    return this.makeRequest(`/academic-calendar/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAcademicCalendarEvent(id) {
    return this.makeRequest(`/academic-calendar/${id}/`, {
      method: 'DELETE',
    });
  }

  // Academic Calendar Custom Actions
  async getUpcomingEvents() {
    return this.makeRequest('/academic-calendar/upcoming_events/');
  }

  async getEventsByMonth(year, month) {
    return this.makeRequest(`/academic-calendar/by_month/?year=${year}&month=${month}`);
  }

  async getAcademicDays(startDate, endDate) {
    return this.makeRequest(`/academic-calendar/academic_days/?start_date=${startDate}&end_date=${endDate}`);
  }
}

export const academicApiService = new AcademicApiService();
export default academicApiService;
