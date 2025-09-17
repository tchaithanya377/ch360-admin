import { DJANGO_BASE_URL } from '../config/apiConfig';

// Faculty API service class for faculty management
class FacultyApiService {
  constructor() {
    // Per provided API list, endpoints are under /api/v1/faculty/api/
    this.baseURL = `${DJANGO_BASE_URL}/v1/faculty/api`;
    this.token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
  }

  // Helper method to get headers with authentication
  getHeaders() {
    // Always get the latest token from localStorage
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      let bodyText = '';
      let errorData = {};
      try {
        errorData = await response.json();
        bodyText = JSON.stringify(errorData);
      } catch {
        try { bodyText = await response.text(); } catch {}
      }
      const msg = (errorData && (errorData.detail || errorData.message)) || bodyText || `HTTP error! status: ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      err.data = errorData;
      console.error('API error:', response.url, response.status, errorData || bodyText);
      throw err;
    }
    return response.json();
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      // Attempt token refresh on auth errors
      const isAuthError = error?.status === 401 || (typeof error?.message === 'string' && error.message.includes('token'));
      const tokenInvalid = (error?.data && (error.data.code === 'token_not_valid' || error.data.detail?.includes('token'))) || false;
      if (isAuthError || tokenInvalid) {
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            config = { ...config, headers: this.getHeaders() };
            const retry = await fetch(url, config);
            return await this.handleResponse(retry);
          }
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr);
        }
      }
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== MOCK DATA FOR DEVELOPMENT ====================
  
  // Mock faculty data for development/testing
  getMockFacultyData() {
    return [
      {
        id: 1,
        apaar_faculty_id: "APAAR001",
        employee_id: "EMP001",
        first_name: "John",
        last_name: "Smith",
        middle_name: "",
        date_of_birth: "1980-05-15",
        gender: "M",
        highest_degree: "Ph.D.",
        highest_qualification: "Ph.D. in Computer Science",
        university: "MIT",
        area_of_specialization: "Machine Learning",
        specialization: "AI/ML",
        year_of_completion: "2010",
        date_of_joining_institution: "2015-08-01",
        date_of_joining: "2015-08-01",
        designation_at_joining: "ASSISTANT_PROFESSOR",
        present_designation: "PROFESSOR",
        designation: "PROFESSOR",
        date_designated_as_professor: "2020-01-01",
        employment_type: "FULL_TIME",
        status: "ACTIVE",
        currently_associated: "Y",
        nature_of_association: "REGULAR",
        contractual_full_time_part_time: "",
        date_of_leaving: "",
        experience_in_current_institute: "8",
        experience_years: "15",
        previous_institution: "Stanford University",
        department: "Computer Science",
        email: "john.smith@university.edu",
        phone_number: "1234567890",
        alternate_phone: "",
        address_line_1: "123 University Ave",
        address_line_2: "",
        city: "City",
        state: "State",
        postal_code: "12345",
        country: "India",
        achievements: "Published 20+ papers",
        research_interests: "Machine Learning, AI",
        is_head_of_department: "N",
        is_mentor: "Y",
        mentor_for_grades: "9,10,11,12",
        emergency_contact_name: "Jane Smith",
        emergency_contact_phone: "9876543210",
        emergency_contact_relationship: "Spouse",
        profile_picture: "",
        bio: "Experienced professor in Computer Science",
        notes: "",
        pan_no: "ABCDE1234F"
      },
      {
        id: 2,
        apaar_faculty_id: "APAAR002",
        employee_id: "EMP002",
        first_name: "Sarah",
        last_name: "Johnson",
        middle_name: "Marie",
        date_of_birth: "1985-03-20",
        gender: "F",
        highest_degree: "Ph.D.",
        highest_qualification: "Ph.D. in Mathematics",
        university: "Harvard",
        area_of_specialization: "Applied Mathematics",
        specialization: "Statistics",
        year_of_completion: "2012",
        date_of_joining_institution: "2018-01-15",
        date_of_joining: "2018-01-15",
        designation_at_joining: "ASSISTANT_PROFESSOR",
        present_designation: "ASSOCIATE_PROFESSOR",
        designation: "ASSOCIATE_PROFESSOR",
        date_designated_as_professor: "",
        employment_type: "FULL_TIME",
        status: "ACTIVE",
        currently_associated: "Y",
        nature_of_association: "REGULAR",
        contractual_full_time_part_time: "",
        date_of_leaving: "",
        experience_in_current_institute: "5",
        experience_years: "10",
        previous_institution: "Berkeley",
        department: "Mathematics",
        email: "sarah.johnson@university.edu",
        phone_number: "1234567891",
        alternate_phone: "",
        address_line_1: "456 College St",
        address_line_2: "",
        city: "City",
        state: "State",
        postal_code: "12345",
        country: "India",
        achievements: "Award for Excellence in Teaching",
        research_interests: "Statistical Analysis, Data Science",
        is_head_of_department: "N",
        is_mentor: "Y",
        mentor_for_grades: "6,7,8",
        emergency_contact_name: "Robert Johnson",
        emergency_contact_phone: "9876543211",
        emergency_contact_relationship: "Father",
        profile_picture: "",
        bio: "Passionate mathematics educator",
        notes: "",
        pan_no: "FGHIJ5678K"
      }
    ];
  }

  getMockFacultyStats() {
    return {
      total: 3,
      active: 2,
      onLeave: 1,
      probation: 0,
      departments: {
        "Computer Science": 1,
        "Mathematics": 1,
        "Physics": 1
      },
      designations: {
        "Professor": 2,
        "Associate Professor": 1
      },
      recentHires: 0,
      upcomingRetirements: 0,
      averageExperience: 9,
      researchPublications: 6
    };
  }

  getMockActivities() {
    return [
      {
        id: 1,
        description: "New faculty member Dr. John Smith joined Computer Science department",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        description: "Dr. Sarah Johnson published research paper on Statistical Analysis",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: 3,
        description: "Performance review completed for Dr. Michael Brown",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
  }

  // ==================== FACULTY CRUD APIs ====================

  // GET /api/v1/faculty/faculty/
  async getFaculty(params = {}) {
    try {
      console.log('FacultyApiService: Fetching faculty with params:', params);
      
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.department) queryParams.append('department', params.department);
      if (params.designation) queryParams.append('designation', params.designation);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const endpoint = queryParams.toString() ? `/faculty/?${queryParams.toString()}` : '/faculty/';
      console.log('FacultyApiService: Making request to:', `${this.baseURL}${endpoint}`);
      
      const result = await this.makeRequest(endpoint);
      console.log('FacultyApiService: Received response:', result);
      return result;
    } catch (error) {
      console.error('FacultyApiService: Error fetching faculty:', error);
      throw error;
    }
  }

  // GET /api/v1/faculty/faculty/stats/
  async getFacultyStats() {
    try {
      // Not specified in API list; default to empty and let UI compute from list
      return {};
    } catch (error) {
      console.error('Error fetching faculty stats:', error);
      throw error;
    }
  }

  // GET /api/v1/faculty/activities/
  async getFacultyActivities() {
    try {
      
      return this.getMockActivities();
    } catch (error) {
      console.error('Error fetching faculty activities:', error);
      throw new Error('Failed to fetch faculty activities');
    }
  }

  // POST /api/v1/faculty/faculty/
  async createFaculty(facultyData) {
    try {
      return await this.makeRequest('/faculty/', {
        method: 'POST',
        body: JSON.stringify(facultyData)
      });
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  }

  // GET /api/v1/faculty/faculty/{id}/
  async getFacultyById(id) {
    try {
      return await this.makeRequest(`/faculty/${id}/`);
    } catch (error) {
      console.error('Error fetching faculty by ID:', error);
      throw error;
    }
  }

  // PUT /api/v1/faculty/faculty/{id}/
  async updateFaculty(id, facultyData) {
    try {
      return await this.makeRequest(`/faculty/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(facultyData)
      });
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  }

  // DELETE /api/v1/faculty/faculty/{id}/
  async deleteFaculty(id) {
    try {
      return await this.makeRequest(`/faculty/${id}/`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  }

  // =============== Additional Faculty-related collections =================

  // Subjects
  async getSubjects(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/subjects/?${qp.toString()}` : '/subjects/';
    return this.makeRequest(ep);
  }
  async createSubject(payload) {
    return this.makeRequest('/subjects/', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Schedules
  async getSchedules(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/schedules/?${qp.toString()}` : '/schedules/';
    return this.makeRequest(ep);
  }
  async createSchedule(payload) {
    return this.makeRequest('/schedules/', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Leaves
  async getLeaves(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/leaves/?${qp.toString()}` : '/leaves/';
    return this.makeRequest(ep);
  }
  async createLeave(payload) {
    return this.makeRequest('/leaves/', { method: 'POST', body: JSON.stringify(payload) });
  }
  async getLeavesOptions() {
    return this.makeRequest('/leaves/', { method: 'OPTIONS' });
  }

  // Performance
  // Expected Performance Record Structure:
  // {
  //   faculty_id: number,
  //   academic_year: string, // e.g., "2023-2024"
  //   evaluation_period: string, // "Q1", "Q2", "Q3", "Q4", "Annual"
  //   teaching_effectiveness: number, // 0-10
  //   student_satisfaction: number, // 0-10
  //   research_contribution: number, // 0-10
  //   administrative_work: number, // 0-10
  //   professional_development: number, // 0-10
  //   overall_score: number, // calculated average
  //   strengths: string,
  //   areas_for_improvement: string,
  //   recommendations: string,
  //   evaluated_by: string,
  //   evaluation_date: string, // ISO date
  //   comments: string,
  //   status: string // "DRAFT", "COMPLETED"
  // }
  async getPerformance(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/performance/?${qp.toString()}` : '/performance/';
    return this.makeRequest(ep);
  }
  
  async createPerformance(payload) {
    return this.makeRequest('/performance/', { method: 'POST', body: JSON.stringify(payload) });
  }
  
  async getPerformanceById(id) {
    return this.makeRequest(`/performance/${id}/`);
  }
  
  async updatePerformance(id, payload) {
    return this.makeRequest(`/performance/${id}/`, { 
      method: 'PUT', 
      body: JSON.stringify(payload) 
    });
  }
  
  async deletePerformance(id) {
    return this.makeRequest(`/performance/${id}/`, { method: 'DELETE' });
  }
  
  // Performance Categories
  async getPerformanceCategories(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/performance/categories/?${qp.toString()}` : '/performance/categories/';
    return this.makeRequest(ep);
  }
  
  async createPerformanceCategory(payload) {
    return this.makeRequest('/performance/categories/', { method: 'POST', body: JSON.stringify(payload) });
  }
  
  // Performance Reviews
  async getPerformanceReviews(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/performance/reviews/?${qp.toString()}` : '/performance/reviews/';
    return this.makeRequest(ep);
  }
  
  async createPerformanceReview(payload) {
    return this.makeRequest('/performance/reviews/', { method: 'POST', body: JSON.stringify(payload) });
  }
  
  async getPerformanceReviewById(id) {
    return this.makeRequest(`/performance/reviews/${id}/`);
  }
  
  async updatePerformanceReview(id, payload) {
    return this.makeRequest(`/performance/reviews/${id}/`, { 
      method: 'PUT', 
      body: JSON.stringify(payload) 
    });
  }
  
  async deletePerformanceReview(id) {
    return this.makeRequest(`/performance/reviews/${id}/`, { method: 'DELETE' });
  }
  
  // Performance Metrics
  async getPerformanceMetrics(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/performance/metrics/?${qp.toString()}` : '/performance/metrics/';
    return this.makeRequest(ep);
  }
  
  async createPerformanceMetric(payload) {
    return this.makeRequest('/performance/metrics/', { method: 'POST', body: JSON.stringify(payload) });
  }
  
  // Performance Reports
  async getPerformanceReports(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/performance/reports/?${qp.toString()}` : '/performance/reports/';
    return this.makeRequest(ep);
  }
  
  async generatePerformanceReport(payload) {
    return this.makeRequest('/performance/reports/generate/', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Documents
  async getDocuments(params = {}) {
    const qp = new URLSearchParams(params);
    const ep = qp.toString() ? `/documents/?${qp.toString()}` : '/documents/';
    return this.makeRequest(ep);
  }
  async createDocument(payload) {
    return this.makeRequest('/documents/', { method: 'POST', body: JSON.stringify(payload) });
  }

  // ==================== UTILITY METHODS ====================

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Refresh token if needed
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${DJANGO_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      this.token = data.access;
      return data.access;
    } else {
      throw new Error('Failed to refresh token');
    }
  }

  // Logout and clear tokens
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token = null;
  }
}

// Create and export a singleton instance
const facultyApiService = new FacultyApiService();
export default facultyApiService;
