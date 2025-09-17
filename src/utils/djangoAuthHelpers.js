// Django Authentication Helpers
import djangoAuthService from './djangoAuthService';

// Check if user is authenticated with Django
export const isDjangoAuthenticated = () => {
  return djangoAuthService.isAuthenticated();
};

// Get Django authentication token
export const getDjangoToken = () => {
  return djangoAuthService.getToken();
};

// Django logout helper
export const djangoLogout = async () => {
  try {
    await djangoAuthService.logout();
    return { success: true };
  } catch (error) {
    console.error('Django logout error:', error);
    return { success: false, error: error.message };
  }
};

// Get current user from Django API
export const getDjangoCurrentUser = async () => {
  try {
    const user = await djangoAuthService.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Get Django user error:', error);
    return null;
  }
};

// Get current user profile using /accounts/me/ endpoint
export const getMyProfile = async () => {
  try {
    const result = await djangoAuthService.getMyProfile();
    return result;
  } catch (error) {
    console.error('Get my profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch profile'
    };
  }
};

// Update current user profile using /accounts/me/ endpoint
export const updateMyProfile = async (profileData) => {
  try {
    const result = await djangoAuthService.updateMyProfile(profileData);
    return result;
  } catch (error) {
    console.error('Update my profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    };
  }
};

// Make authenticated Django API request
export const makeDjangoRequest = async (endpoint, options = {}) => {
  try {
    const response = await djangoAuthService.makeRequest(endpoint, options);
    return response;
  } catch (error) {
    console.error('Django API request error:', error);
    throw error;
  }
};

// Register new account
export const registerAccount = async (accountData) => {
  try {
    const result = await djangoAuthService.register(accountData);
    return result;
  } catch (error) {
    console.error('Register account error:', error);
    return { success: false, error: error.message || 'Failed to register' };
  }
};

// Check if user has specific role/permission
export const hasDjangoPermission = async (permission) => {
  try {
    const user = await getDjangoCurrentUser();
    if (!user) return false;
    
    // Check if user has the specific permission
    // This depends on your Django backend's permission system
    return user.permissions?.includes(permission) || user.is_staff || user.is_superuser;
  } catch (error) {
    console.error('Check Django permission error:', error);
    return false;
  }
};

// Fetch roles and permissions for current user
export const getRolesPermissions = async () => {
  try {
    return await djangoAuthService.getRolesPermissions();
  } catch (error) {
    console.error('Get roles/permissions error:', error);
    return { success: false, error: error.message || 'Failed to fetch roles/permissions' };
  }
};

// Check if user is admin (Django specific)
export const isDjangoAdmin = async () => {
  try {
    const user = await getDjangoCurrentUser();
    if (!user) return false;
    
    return user.is_staff || user.is_superuser;
  } catch (error) {
    console.error('Check Django admin error:', error);
    return false;
  }
};

// Check if user has admin privileges (staff or superuser)
export const hasAdminPrivileges = (user) => {
  if (!user) return false;
  return user.is_staff || user.is_superuser;
};

// Check if user is specifically a Django superuser
export const isDjangoSuperuser = (user) => {
  if (!user) return false;
  return user.is_superuser === true;
};

// Refresh Django token if needed
export const refreshDjangoToken = async () => {
  try {
    console.log('Helper: Starting Django token refresh...');
    const refreshed = await djangoAuthService.refreshAccessToken();
    console.log('Helper: Django token refresh result:', refreshed);
    return refreshed;
  } catch (error) {
    console.error('Helper: Django token refresh error:', error);
    return false;
  }
};

// Ensure valid Django token (refresh if needed)
export const ensureValidDjangoToken = async () => {
  try {
    console.log('Helper: Ensuring valid Django token...');
    const isValid = await djangoAuthService.ensureValidToken();
    console.log('Helper: Django token validation result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Helper: Django token validation error:', error);
    return false;
  }
};

// Check if Django token is expired
export const isDjangoTokenExpired = () => {
  try {
    const isExpired = djangoAuthService.isTokenExpired();
    console.log('Helper: Django token expired check:', isExpired);
    return isExpired;
  } catch (error) {
    console.error('Helper: Django token expiration check error:', error);
    return true; // Assume expired if we can't check
  }
};

// Django API endpoints configuration
export const DJANGO_ENDPOINTS = {
  LOGIN: '/accounts/token/',
  REFRESH: '/accounts/token/refresh/',
  LOGOUT: '/accounts/logout/',
  PROFILE: '/accounts/me/',
  ME: '/accounts/me/',
  REGISTER: '/accounts/register/',
  ROLES_PERMISSIONS: '/accounts/me/roles-permissions/',
  USERS: '/accounts/users/',
  
  // Student Management APIs
  STUDENTS: '/v1/students/students/',
  STUDENT_DETAIL: '/v1/students/students/{id}/',
  STUDENT_DOCUMENTS: '/v1/students/students/{id}/documents/',
  STUDENT_ENROLLMENT_HISTORY: '/v1/students/students/{id}/enrollment-history/',
  STUDENT_CUSTOM_FIELDS: '/v1/students/students/{id}/custom-fields/',
  STUDENT_CREATE_LOGIN: '/v1/students/students/{id}/create-login/',
  STUDENTS_BULK_CREATE: '/v1/students/students/bulk-create/',
  STUDENTS_BULK_UPDATE: '/v1/students/students/bulk-update/',
  STUDENTS_BULK_DELETE: '/v1/students/students/bulk-delete/',
  STUDENTS_STATS: '/v1/students/students/stats/',
  STUDENTS_SEARCH: '/v1/students/students/search/',
  
  // Legacy endpoints for backward compatibility
  STUDENTS_BULK: '/v1/students/students/bulk/',
  
  FACULTY: '/faculty/',
  COURSES: '/courses/',
  ATTENDANCE: '/attendance/',
  GRADES: '/grades/',
  EVENTS: '/events/',
  REPORTS: '/reports/',
};

// Helper to build Django API URLs
import { DJANGO_BASE_URL } from '../config/apiConfig.js';

export const buildDjangoURL = (endpoint, params = {}) => {
  let url = `${DJANGO_BASE_URL}${endpoint}`;
  
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Django API response handler
export const handleDjangoResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { 
        success: false, 
        error: data.detail || data.message || 'API request failed',
        status: response.status 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to parse response',
      status: response.status 
    };
  }
};

// Django authentication interceptor for API calls
export const withDjangoAuth = async (apiCall) => {
  try {
    // Check if we have a valid token
    if (!isDjangoAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    // Make the API call
    const result = await apiCall();
    
    // If we get a 401, try to refresh the token
    if (result.status === 401) {
      const refreshed = await refreshDjangoToken();
      if (refreshed) {
        // Retry the API call with the new token
        return await apiCall();
      } else {
        throw new Error('Authentication expired');
      }
    }
    
    return result;
  } catch (error) {
    console.error('Django auth interceptor error:', error);
    throw error;
  }
};

// Students CRUD Helper Functions

// Get all students
export const getStudents = async (params = {}) => {
  try {
    const result = await djangoAuthService.getStudents(params);
    return result;
  } catch (error) {
    console.error('Get students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch students'
    };
  }
};

// Get student by ID
export const getStudentById = async (studentId) => {
  try {
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID is required'
      };
    }
    const result = await djangoAuthService.getStudentById(studentId);
    return result;
  } catch (error) {
    console.error('Get student by ID error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch student'
    };
  }
};

// Create new student
export const createStudent = async (studentData) => {
  try {
    const result = await djangoAuthService.createStudent(studentData);
    return result;
  } catch (error) {
    console.error('Create student error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create student'
    };
  }
};

// Update student
export const updateStudent = async (studentId, studentData) => {
  try {
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID is required'
      };
    }
    const result = await djangoAuthService.updateStudent(studentId, studentData);
    return result;
  } catch (error) {
    console.error('Update student error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update student'
    };
  }
};

// Delete student
export const deleteStudent = async (studentId) => {
  try {
    if (!studentId) {
      return {
        success: false,
        error: 'Student ID is required'
      };
    }
    const result = await djangoAuthService.deleteStudent(studentId);
    return result;
  } catch (error) {
    console.error('Delete student error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete student'
    };
  }
};

// Bulk create students
export const bulkCreateStudents = async (studentsData) => {
  try {
    const result = await djangoAuthService.bulkCreateStudents(studentsData);
    return result;
  } catch (error) {
    console.error('Bulk create students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to bulk create students'
    };
  }
};

// Search students with filters
export const searchStudents = async (searchParams = {}) => {
  try {
    const {
      search = '',
      department = '',
      year = '',
      section = '',
      status = '',
      page = 1,
      pageSize = 20,
      sortBy = 'name',
      sortOrder = 'asc',
      ...otherParams
    } = searchParams;

    const params = {
      ...otherParams
    };

    // Add search parameters if provided
    if (search) params.search = search;
    if (department) params.department = department;
    if (year) params.year = year;
    if (section) params.section = section;
    if (status) params.status = status;
    if (page) params.page = page;
    if (pageSize) params.page_size = pageSize;
    if (sortBy) params.ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy;

    const result = await djangoAuthService.getStudents(params);
    return result;
  } catch (error) {
    console.error('Search students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search students'
    };
  }
};

// Get students statistics
export const getStudentsStats = async () => {
  try {
    // Use the dedicated stats endpoint instead of querying students with stats=true
    const result = await djangoAuthService.getStudentsStats();
    return result;
  } catch (error) {
    console.error('Get students stats error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch students statistics'
    };
  }
};

// ===== COMPREHENSIVE STUDENT MANAGEMENT FUNCTIONS =====

// Get student documents
export const getStudentDocuments = async (studentId) => {
  try {
    const result = await djangoAuthService.getStudentDocuments(studentId);
    return result;
  } catch (error) {
    console.error('Get student documents error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get student documents'
    };
  }
};

// Upload student document
export const uploadStudentDocument = async (studentId, documentData) => {
  try {
    const result = await djangoAuthService.uploadStudentDocument(studentId, documentData);
    return result;
  } catch (error) {
    console.error('Upload student document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload student document'
    };
  }
};

// Delete student document
export const deleteStudentDocument = async (studentId, documentId) => {
  try {
    const result = await djangoAuthService.deleteStudentDocument(studentId, documentId);
    return result;
  } catch (error) {
    console.error('Delete student document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete student document'
    };
  }
};

// Get student enrollment history
export const getStudentEnrollmentHistory = async (studentId) => {
  try {
    const result = await djangoAuthService.getStudentEnrollmentHistory(studentId);
    return result;
  } catch (error) {
    console.error('Get student enrollment history error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get student enrollment history'
    };
  }
};

// Add enrollment record
export const addEnrollmentRecord = async (studentId, enrollmentData) => {
  try {
    const result = await djangoAuthService.addEnrollmentRecord(studentId, enrollmentData);
    return result;
  } catch (error) {
    console.error('Add enrollment record error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add enrollment record'
    };
  }
};

// Get student custom fields
export const getStudentCustomFields = async (studentId) => {
  try {
    const result = await djangoAuthService.getStudentCustomFields(studentId);
    return result;
  } catch (error) {
    console.error('Get student custom fields error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get student custom fields'
    };
  }
};

// Update student custom fields
export const updateStudentCustomFields = async (studentId, customFields) => {
  try {
    const result = await djangoAuthService.updateStudentCustomFields(studentId, customFields);
    return result;
  } catch (error) {
    console.error('Update student custom fields error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update student custom fields'
    };
  }
};

// Create student login credentials
export const createStudentLogin = async (studentId, loginData) => {
  try {
    const result = await djangoAuthService.createStudentLogin(studentId, loginData);
    return result;
  } catch (error) {
    console.error('Create student login error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create student login'
    };
  }
};

// Bulk create students (enhanced version)
export const bulkCreateStudentsEnhanced = async (studentsData) => {
  try {
    const result = await djangoAuthService.bulkCreateStudentsEnhanced(studentsData);
    return result;
  } catch (error) {
    console.error('Bulk create students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to bulk create students'
    };
  }
};

// Bulk update students
export const bulkUpdateStudents = async (updateData) => {
  try {
    const result = await djangoAuthService.bulkUpdateStudents(updateData);
    return result;
  } catch (error) {
    console.error('Bulk update students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to bulk update students'
    };
  }
};

// Bulk delete students
export const bulkDeleteStudents = async (studentIds) => {
  try {
    const result = await djangoAuthService.bulkDeleteStudents(studentIds);
    return result;
  } catch (error) {
    console.error('Bulk delete students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to bulk delete students'
    };
  }
};

// Advanced search students
export const advancedSearchStudents = async (searchParams = {}) => {
  try {
    const result = await djangoAuthService.advancedSearchStudents(searchParams);
    return result;
  } catch (error) {
    console.error('Advanced search students error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search students'
    };
  }
};

// Get student analytics
export const getStudentAnalytics = async (filters = {}) => {
  try {
    const result = await djangoAuthService.getStudentAnalytics(filters);
    return result;
  } catch (error) {
    console.error('Get student analytics error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get student analytics'
    };
  }
};

// Export students data
export const exportStudentsData = async (filters = {}, format = 'csv') => {
  try {
    const result = await djangoAuthService.exportStudentsData(filters, format);
    return result;
  } catch (error) {
    console.error('Export students data error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export students data'
    };
  }
};

// Import students data
export const importStudentsData = async (fileData, options = {}) => {
  try {
    const result = await djangoAuthService.importStudentsData(fileData, options);
    return result;
  } catch (error) {
    console.error('Import students data error:', error);
    return {
      success: false,
      error: error.message || 'Failed to import students data'
    };
  }
};
