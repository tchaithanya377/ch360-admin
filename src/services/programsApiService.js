import { DJANGO_BASE_URL } from '../config/apiConfig';

class ProgramsApiService {
  constructor() {
    this.baseURL = `${DJANGO_BASE_URL}/v1/academics/api`;
  }

  getHeaders() {
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async makeRequest(endpoint, options = {}) {
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    const fullURL = `${this.baseURL}${endpoint}`;
    console.log(`Making Programs API request to: ${fullURL}`);
    console.log('Request config:', config);

    const response = await fetch(fullURL, config);

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty data structure for 404 errors (endpoints not implemented)
        console.warn(`Programs API endpoint not implemented: ${fullURL}`);
        return { results: [], count: 0, next: null, previous: null };
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Programs API Error Response:', errorData);
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
    console.log(`Programs API response for ${endpoint}:`, data);
    return data;
  }

  // Get all programs
  async getPrograms(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    
    // Add search and filter parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);
    if (params.degree_type) queryParams.append('degree_type', params.degree_type);
    
    const queryString = queryParams.toString();
    const endpoint = `/programs/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Get a specific program by ID
  async getProgram(id) {
    return this.makeRequest(`/programs/${id}/`);
  }

  // Create a new program
  async createProgram(data) {
    return this.makeRequest('/programs/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a program
  async updateProgram(id, data) {
    return this.makeRequest(`/programs/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Partially update a program
  async patchProgram(id, data) {
    return this.makeRequest(`/programs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Delete a program
  async deleteProgram(id) {
    return this.makeRequest(`/programs/${id}/`, {
      method: 'DELETE',
    });
  }

  // Get programs by department
  async getProgramsByDepartment(departmentId, params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('department', departmentId);
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/programs/?${queryString}`;
    
    return this.makeRequest(endpoint);
  }

  // Get mock data for development/testing
  getMockProgramsData() {
    return [
      {
        id: 1,
        name: 'B.Tech Computer Science and Engineering',
        code: 'BTECH_CSE',
        degree_type: 'UG',
        duration_years: 4,
        total_credits: 160,
        description: 'Bachelor of Technology in Computer Science and Engineering',
        department: 1,
        coordinator: 'Dr. John Smith',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'B.Tech Information Technology',
        code: 'BTECH_IT',
        degree_type: 'UG',
        duration_years: 4,
        total_credits: 160,
        description: 'Bachelor of Technology in Information Technology',
        department: 1,
        coordinator: 'Dr. Jane Doe',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'M.Tech Computer Science and Engineering',
        code: 'MTECH_CSE',
        degree_type: 'PG',
        duration_years: 2,
        total_credits: 80,
        description: 'Master of Technology in Computer Science and Engineering',
        department: 1,
        coordinator: 'Dr. Alice Johnson',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'M.Tech Data Science',
        code: 'MTECH_DS',
        degree_type: 'PG',
        duration_years: 2,
        total_credits: 80,
        description: 'Master of Technology in Data Science',
        department: 1,
        coordinator: 'Dr. Bob Wilson',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'B.Tech Electronics and Communication Engineering',
        code: 'BTECH_ECE',
        degree_type: 'UG',
        duration_years: 4,
        total_credits: 160,
        description: 'Bachelor of Technology in Electronics and Communication Engineering',
        department: 2,
        coordinator: 'Dr. Carol Brown',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 6,
        name: 'M.Tech Electronics and Communication Engineering',
        code: 'MTECH_ECE',
        degree_type: 'PG',
        duration_years: 2,
        total_credits: 80,
        description: 'Master of Technology in Electronics and Communication Engineering',
        department: 2,
        coordinator: 'Dr. David Lee',
        status: 'active',
        effective_from: '2024-01-01',
        effective_to: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }
}

// Create and export a singleton instance
const programsApiService = new ProgramsApiService();

// Export both as default and named export for compatibility
export { programsApiService };
export default programsApiService;
