// Modern Grades API Service for Django Backend Integration
class GradesApiService {
  constructor(baseURL, token, authService = null) {
    this.baseURL = baseURL;
    this.token = token;
    this.authService = authService; // Reference to Django auth service for token refresh
  }

  getHeaders() {
    // Always get the latest token from auth service if available
    const currentToken = this.authService ? this.authService.getToken() : this.token;
    return {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const makeRequestWithToken = async (token) => {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      };

      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`API Error [${endpoint}]:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API Success [${endpoint}]:`, data);
      return data;
    };

    try {
      // Get current token
      const currentToken = this.authService ? this.authService.getToken() : this.token;
      
      // Try the request with current token
      return await makeRequestWithToken(currentToken);
    } catch (error) {
      // If we get a 401 and have an auth service, try to refresh the token
      if (error.message.includes('401') && this.authService) {
        console.log('Token expired, attempting to refresh...');
        
        try {
          const refreshed = await this.authService.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            const newToken = this.authService.getToken();
            console.log('Token refreshed, retrying request...');
            return await makeRequestWithToken(newToken);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If refresh failed or no auth service, throw the original error
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    return this.makeRequest('/api/v1/grads/health/');
  }

  // Students Management
  async getStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/students/?${queryString}`
      : '/api/v1/students/';
    return this.makeRequest(endpoint);
  }

  // Course Sections Management
  async getCourseSections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/courses/sections/?${queryString}`
      : '/api/v1/courses/sections/';
    return this.makeRequest(endpoint);
  }

  // Semesters Management
  async getSemesters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/academic/semesters/?${queryString}`
      : '/api/v1/academic/semesters/';
    return this.makeRequest(endpoint);
  }

  // Grade Scales Management
  async getGradeScales() {
    return this.makeRequest('/api/v1/grads/grade-scales/');
  }

  async getGradeScale(id) {
    return this.makeRequest(`/api/v1/grads/grade-scales/${id}/`);
  }

  async createGradeScale(data) {
    return this.makeRequest('/api/v1/grads/grade-scales/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGradeScale(id, data) {
    return this.makeRequest(`/api/v1/grads/grade-scales/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteGradeScale(id) {
    return this.makeRequest(`/api/v1/grads/grade-scales/${id}/`, {
      method: 'DELETE'
    });
  }

  // Midterm Grades
  async getMidtermGrades(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/grads/midterm-grades/?${queryString}`
      : '/api/v1/grads/midterm-grades/';
    return this.makeRequest(endpoint);
  }

  async getMidtermGrade(id) {
    return this.makeRequest(`/api/v1/grads/midterm-grades/${id}/`);
  }

  async createMidtermGrade(data) {
    return this.makeRequest('/api/v1/grads/midterm-grades/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMidtermGrade(id, data) {
    return this.makeRequest(`/api/v1/grads/midterm-grades/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMidtermGrade(id) {
    return this.makeRequest(`/api/v1/grads/midterm-grades/${id}/`, {
      method: 'DELETE'
    });
  }

  async bulkUpsertMidtermGrades(grades) {
    return this.makeRequest('/api/v1/grads/midterm-grades/bulk_upsert/', {
      method: 'POST',
      body: JSON.stringify({ grades })
    });
  }

  // Semester Grades
  async getSemesterGrades(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/grads/semester-grades/?${queryString}`
      : '/api/v1/grads/semester-grades/';
    return this.makeRequest(endpoint);
  }

  async getSemesterGrade(id) {
    return this.makeRequest(`/api/v1/grads/semester-grades/${id}/`);
  }

  async createSemesterGrade(data) {
    return this.makeRequest('/api/v1/grads/semester-grades/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSemesterGrade(id, data) {
    return this.makeRequest(`/api/v1/grads/semester-grades/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSemesterGrade(id) {
    return this.makeRequest(`/api/v1/grads/semester-grades/${id}/`, {
      method: 'DELETE'
    });
  }

  async bulkUpsertSemesterGrades(grades) {
    return this.makeRequest('/api/v1/grads/semester-grades/bulk_upsert/', {
      method: 'POST',
      body: JSON.stringify({ grades })
    });
  }

  // SGPA (Semester GPA)
  async getSGPAs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/grads/semester-gpas/?${queryString}`
      : '/api/v1/grads/semester-gpas/';
    return this.makeRequest(endpoint);
  }

  async getSGPA(id) {
    return this.makeRequest(`/api/v1/grads/semester-gpas/${id}/`);
  }

  // CGPA (Cumulative GPA)
  async getCGPAs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/v1/grads/cumulative-gpas/?${queryString}`
      : '/api/v1/grads/cumulative-gpas/';
    return this.makeRequest(endpoint);
  }

  async getCGPA(id) {
    return this.makeRequest(`/api/v1/grads/cumulative-gpas/${id}/`);
  }

  // Academic Transcript
  async getAcademicTranscript(cgpaId) {
    return this.makeRequest(`/api/v1/grads/cumulative-gpas/${cgpaId}/academic_transcript/`);
  }

  // Utility Methods
  calculateGrade(marks, totalMarks, gradeScales) {
    const percentage = (marks / totalMarks) * 100;
    const grade = gradeScales.find(scale => 
      percentage >= scale.min_score && percentage <= scale.max_score
    );
    
    return grade ? {
      letter: grade.letter,
      description: grade.description,
      grade_points: grade.grade_points,
      percentage: parseFloat(percentage.toFixed(2))
    } : null;
  }

  getAcademicStandingColor(standing) {
    const colors = {
      'EXCELLENT': '#4CAF50',
      'VERY_GOOD': '#8BC34A',
      'GOOD': '#FFC107',
      'SATISFACTORY': '#FF9800',
      'PASS': '#FF5722',
      'PROBATION': '#F44336'
    };
    return colors[standing] || '#9E9E9E';
  }

  getClassificationColor(classification) {
    const colors = {
      'FIRST_CLASS_DISTINCTION': '#4CAF50',
      'FIRST_CLASS': '#8BC34A',
      'SECOND_CLASS': '#FFC107',
      'PASS_CLASS': '#FF9800',
      'FAIL': '#F44336'
    };
    return colors[classification] || '#9E9E9E';
  }
}

export default GradesApiService;
