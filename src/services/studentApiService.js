import { DJANGO_BASE_URL } from '../config/apiConfig';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, searchStudents, getStudentsStats } from '../utils/djangoAuthHelpers';

// Base API service class for student management
class StudentApiService {
  constructor() {
    this.baseURL = `${DJANGO_BASE_URL}/v1/students`;
    this.token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
  }

  // Helper method to get headers with authentication
  getHeaders() {
    const token = this.token || localStorage.getItem('django_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== STUDENT CRUD APIs ====================

  // GET/POST /api/v1/students/students/
  async getStudents(params = {}) {
    try {
      console.log('Fetching students from Django API...');
      const result = await getStudents(params);
      if (result.success) {
        console.log('Successfully fetched students from Django API');
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch students from Django API');
      }
    } catch (error) {
      console.error('Django API error:', error);
      throw new Error(error.message || 'Failed to fetch students from Django API');
    }
  }

  async createStudent(studentData) {
    try {
      const result = await createStudent(studentData);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  // GET/PUT/DELETE /api/v1/students/students/{id}/
  async getStudent(id) {
    try {
      const result = await getStudentById(id);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch student');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  async updateStudent(id, studentData) {
    try {
      const result = await updateStudent(id, studentData);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id) {
    try {
      const result = await deleteStudent(id);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // GET /api/v1/students/students/{id}/documents/
  async getStudentDocuments(id) {
    return this.makeRequest(`/students/${id}/documents/`);
  }

  // GET /api/v1/students/students/{id}/enrollment-history/
  async getStudentEnrollmentHistory(id) {
    return this.makeRequest(`/students/${id}/enrollment-history/`);
  }

  // GET /api/v1/students/students/{id}/custom-fields/
  async getStudentCustomFields(id) {
    return this.makeRequest(`/students/${id}/custom-fields/`);
  }

  // POST /api/v1/students/students/{id}/create-login/
  async createStudentLogin(id, loginData) {
    return this.makeRequest(`/students/${id}/create-login/`, {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  // POST /api/v1/students/students/bulk-create/
  async bulkCreateStudents(studentsData) {
    return this.makeRequest('/students/bulk-create/', {
      method: 'POST',
      body: JSON.stringify(studentsData),
    });
  }

  // POST /api/v1/students/students/bulk-update/
  async bulkUpdateStudents(studentsData) {
    return this.makeRequest('/students/bulk-update/', {
      method: 'POST',
      body: JSON.stringify(studentsData),
    });
  }

  // DELETE /api/v1/students/students/bulk-delete/
  async bulkDeleteStudents(studentIds) {
    return this.makeRequest('/students/bulk-delete/', {
      method: 'DELETE',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  }

  // GET /api/v1/students/students/stats/
  async getStudentStats() {
    try {
      console.log('Fetching student stats from Django API...');
      const result = await getStudentsStats();
      if (result.success) {
        console.log('Successfully fetched student stats from Django API');
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch student stats from Django API');
      }
    } catch (error) {
      console.error('Django API error:', error);
      throw new Error(error.message || 'Failed to fetch student stats from Django API');
    }
  }

  // GET /api/v1/students/students/search/
  async searchStudents(query, filters = {}) {
    try {
      const result = await searchStudents(query, filters);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to search students');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  // ==================== CUSTOM FIELDS APIs ====================

  // GET/POST /api/v1/students/custom-fields/
  async getCustomFields() {
    return this.makeRequest('/custom-fields/');
  }

  async createCustomField(fieldData) {
    return this.makeRequest('/custom-fields/', {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  }

  // GET/PUT/DELETE /api/v1/students/custom-fields/{id}/
  async getCustomField(id) {
    return this.makeRequest(`/custom-fields/${id}/`);
  }

  async updateCustomField(id, fieldData) {
    return this.makeRequest(`/custom-fields/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(fieldData),
    });
  }

  async deleteCustomField(id) {
    return this.makeRequest(`/custom-fields/${id}/`, {
      method: 'DELETE',
    });
  }

  // GET /api/v1/students/custom-fields/stats/
  async getCustomFieldsStats() {
    return this.makeRequest('/custom-fields/stats/');
  }

  // GET /api/v1/students/custom-fields/types/
  async getCustomFieldTypes() {
    return this.makeRequest('/custom-fields/types/');
  }

  // GET/POST /api/v1/students/custom-field-values/
  async getCustomFieldValues(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/custom-field-values/?${queryString}` : '/custom-field-values/';
    return this.makeRequest(endpoint);
  }

  async createCustomFieldValue(valueData) {
    return this.makeRequest('/custom-field-values/', {
      method: 'POST',
      body: JSON.stringify(valueData),
    });
  }

  // GET /api/v1/students/custom-field-values/by-student/
  async getCustomFieldValuesByStudent(studentId) {
    return this.makeRequest(`/custom-field-values/by-student/?student_id=${studentId}`);
  }

  // GET /api/v1/students/custom-field-values/by-field/
  async getCustomFieldValuesByField(fieldId) {
    return this.makeRequest(`/custom-field-values/by-field/?field_id=${fieldId}`);
  }

  // ==================== DOCUMENTS APIs ====================

  // GET/POST /api/v1/students/documents/
  async getDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/documents/?${queryString}` : '/documents/';
    return this.makeRequest(endpoint);
  }

  async createDocument(documentData) {
    return this.makeRequest('/documents/', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  // GET/PUT/DELETE /api/v1/students/documents/{id}/
  async getDocument(id) {
    return this.makeRequest(`/documents/${id}/`);
  }

  async updateDocument(id, documentData) {
    return this.makeRequest(`/documents/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id) {
    return this.makeRequest(`/documents/${id}/`, {
      method: 'DELETE',
    });
  }

  // ==================== ENROLLMENT HISTORY APIs ====================

  // GET/POST /api/v1/students/enrollment-history/
  async getEnrollmentHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/enrollment-history/?${queryString}` : '/enrollment-history/';
    return this.makeRequest(endpoint);
  }

  async createEnrollmentHistory(historyData) {
    return this.makeRequest('/enrollment-history/', {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  }

  // GET/PUT/DELETE /api/v1/students/enrollment-history/{id}/
  async getEnrollmentHistoryItem(id) {
    return this.makeRequest(`/enrollment-history/${id}/`);
  }

  async updateEnrollmentHistory(id, historyData) {
    return this.makeRequest(`/enrollment-history/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(historyData),
    });
  }

  async deleteEnrollmentHistory(id) {
    return this.makeRequest(`/enrollment-history/${id}/`, {
      method: 'DELETE',
    });
  }

  // ==================== IMPORT APIs ====================

  // GET/POST /api/v1/students/imports/
  async getImports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/imports/?${queryString}` : '/imports/';
    return this.makeRequest(endpoint);
  }

  async createImport(importData) {
    return this.makeRequest('/imports/', {
      method: 'POST',
      body: JSON.stringify(importData),
    });
  }

  // GET/PUT/DELETE /api/v1/students/imports/{id}/
  async getImport(id) {
    return this.makeRequest(`/imports/${id}/`);
  }

  async updateImport(id, importData) {
    return this.makeRequest(`/imports/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(importData),
    });
  }

  async deleteImport(id) {
    return this.makeRequest(`/imports/${id}/`, {
      method: 'DELETE',
    });
  }

  // GET /api/v1/students/imports/stats/
  async getImportStats() {
    return this.makeRequest('/imports/stats/');
  }

  // ==================== FILE UPLOAD METHODS ====================

  // Upload document file
  async uploadDocument(file, studentId, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('student_id', studentId);
    formData.append('document_type', documentType);

    const response = await fetch(`${this.baseURL}/documents/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return await this.handleResponse(response);
  }

  // Upload bulk import file
  async uploadBulkImportFile(file, importType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('import_type', importType);

    const response = await fetch(`${this.baseURL}/imports/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return await this.handleResponse(response);
  }

  // ==================== UTILITY METHODS ====================

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

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Logout and clear tokens
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token = null;
  }
}

// Create and export a singleton instance
const studentApiService = new StudentApiService();
export default studentApiService;
