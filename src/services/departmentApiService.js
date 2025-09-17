import { DJANGO_BASE_URL } from '../config/apiConfig';

// Department API service class for department management
class DepartmentApiService {
  constructor() {
    // Base URL for all department-related endpoints
    this.baseURL = `${DJANGO_BASE_URL}/v1/departments`;
    // Don't store token in constructor, always get fresh token
  }

  // Helper method to get headers with authentication
  getHeaders() {
    // Always get the latest token from localStorage
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      // If sending FormData, let the browser set the Content-Type with boundary
      if (config.body instanceof FormData) {
        if (config.headers && config.headers['Content-Type']) {
          delete config.headers['Content-Type'];
        }
      }

      console.log('Making API request to:', url);
      console.log('Request config:', JSON.stringify(config, null, 2));

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', JSON.stringify(errorData, null, 2));
        console.error('Response Status:', response.status);
        console.error('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ==================== CORE DEPARTMENT OPERATIONS ====================

  // Test API connectivity
  async testApiConnection() {
    try {
      const response = await this.makeRequest('/');
      return response;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  }

  // GET /departments/ - List all departments
  async getDepartments(params = {}) {
    try {
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.department_type) queryParams.append('department_type', params.department_type);
      if (params.status) queryParams.append('status', params.status);
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
      if (params.head_of_department) queryParams.append('head_of_department', params.head_of_department);
      
      const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : '/';
      const response = await this.makeRequest(endpoint);
      
      return response;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  // Helper method to prepare department data for API submission
  prepareDepartmentData(departmentData) {
    const apiData = { ...departmentData };
    
    // Map UI fields to API expectations for leadership
    // If the backend expects the numeric ID in `head_of_department`/`deputy_head`,
    // propagate the *_id values.
    if (apiData.head_of_department_id && !apiData.head_of_department) {
      apiData.head_of_department = apiData.head_of_department_id;
    }
    if (apiData.deputy_head_id && !apiData.deputy_head) {
      apiData.deputy_head = apiData.deputy_head_id;
    }

    // Convert empty strings to null for optional fields (but keep required fields)
    const optionalFields = [
      'parent_department', 'head_of_department', 'head_of_department_id',
      'deputy_head', 'deputy_head_id', 'fax', 'floor', 'room_number',
      'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
      'accreditation_status', 'accreditation_valid_until',
      'mission', 'vision', 'objectives', 'annual_budget', 'budget_year',
      'website_url', 'social_media_links'
    ];
    
    // Required fields that should not be nullified: name, short_name, code, building, established_date, description
    
    optionalFields.forEach(field => {
      if (apiData[field] === '') {
        apiData[field] = null;
      }
    });
    
    // Parse social media links if it's a string
    if (apiData.social_media_links && typeof apiData.social_media_links === 'string') {
      try {
        apiData.social_media_links = JSON.parse(apiData.social_media_links);
      } catch (e) {
        console.warn('Invalid social media links JSON, using empty object');
        apiData.social_media_links = {};
      }
    }
    
    // Ensure numeric fields are properly formatted
    const numericFields = [
      'max_faculty_capacity', 'max_student_capacity', 'current_faculty_count',
      'current_student_count', 'faculty_utilization_percentage', 'student_utilization_percentage',
      'annual_budget'
    ];
    
    numericFields.forEach(field => {
      if (apiData[field] !== null && apiData[field] !== undefined) {
        apiData[field] = parseFloat(apiData[field]) || 0;
      }
    });
    
    // Ensure required fields are present and not empty
    if (!apiData.name || apiData.name.trim() === '') {
      throw new Error('Department name is required');
    }
    if (!apiData.code || apiData.code.trim() === '') {
      throw new Error('Department code is required');
    }
    if (!apiData.department_type) {
      throw new Error('Department type is required');
    }
    if (!apiData.email || apiData.email.trim() === '') {
      throw new Error('Department email is required');
    }
    if (!apiData.phone || apiData.phone.trim() === '') {
      throw new Error('Department phone is required');
    }
    
    // Ensure API-required fields have values (will be set in createDepartment if missing)
    if (!apiData.short_name || apiData.short_name.trim() === '') {
      apiData.short_name = apiData.name.substring(0, 10);
    }
    if (!apiData.building || apiData.building.trim() === '') {
      apiData.building = 'Main Building';
    }
    if (!apiData.established_date) {
      apiData.established_date = new Date().toISOString().split('T')[0];
    }
    if (!apiData.description || apiData.description.trim() === '') {
      apiData.description = `Department of ${apiData.name}`;
    }
    
    // Remove logo file from API data (handle separately if needed)
    delete apiData.logo;
    
    return apiData;
  }

  // POST /departments/ - Create new department
  async createDepartment(departmentData) {
    try {
      // Prepare data for API submission
      const apiData = this.prepareDepartmentData(departmentData);
      // Send the full payload so leadership selections (e.g., head_of_department_id)
      // and other optional fields are persisted on create as well.
      const response = await this.makeRequest('/', {
        method: 'POST',
        body: JSON.stringify(apiData)
      });
      
      return response;
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error('Failed to create department');
    }
  }

  // GET /departments/{id}/ - Get department details
  async getDepartmentById(id) {
    try {
      const response = await this.makeRequest(`/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  }

  // PUT /departments/{id}/ - Update department
  async updateDepartment(id, departmentData) {
    try {
      console.log('Updating department:', id, departmentData);
      
      // Prepare data for API submission
      const apiData = this.prepareDepartmentData(departmentData);
      
      const response = await this.makeRequest(`/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(apiData)
      });
      return response;
    } catch (error) {
      console.error('Error updating department:', error);
      throw new Error('Failed to update department');
    }
  }

  // PATCH /departments/{id}/ - Partial update department
  async partialUpdateDepartment(id, departmentData) {
    try {
      console.log('Partially updating department:', id, departmentData);
      
      // Prepare data for API submission
      const apiData = this.prepareDepartmentData(departmentData);
      
      const response = await this.makeRequest(`/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(apiData)
      });
      return response;
    } catch (error) {
      console.error('Error partially updating department:', error);
      throw new Error('Failed to partially update department');
    }
  }

  // DELETE /departments/{id}/ - Delete department
  async deleteDepartment(id) {
    try {
      console.log('Deleting department:', id);
      const response = await this.makeRequest(`/${id}/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw new Error('Failed to delete department');
    }
  }

  // ==================== DEPARTMENT STATISTICS & SEARCH ====================

  // GET /departments/stats/ - Get department statistics
  async getDepartmentStats() {
    try {
      const response = await this.makeRequest('/stats/');
      return response;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  // POST /departments/search/ - Advanced search for departments
  async searchDepartments(searchData) {
    try {
      console.log('Searching departments:', searchData);
      
      // Prepare search data - ensure it's properly formatted
      const searchPayload = {
        query: searchData.query || searchData.search || '',
        filters: searchData.filters || {},
        ordering: searchData.ordering || '',
        page: searchData.page || 1,
        page_size: searchData.page_size || 10
      };
      
      const response = await this.makeRequest('/search/', {
        method: 'POST',
        body: JSON.stringify(searchPayload)
      });
      return response;
    } catch (error) {
      console.error('Error searching departments:', error);
      throw error;
    }
  }

  // ==================== DEPARTMENT RELATED DATA ====================

  // GET /departments/{id}/resources/ - Get all resources for a department
  async getDepartmentResources(id) {
    try {
      console.log(`Fetching resources for department ${id}...`);
      const response = await this.makeRequest(`/${id}/resources/`);
      return response;
    } catch (error) {
      console.error('Error fetching department resources:', error);
      throw new Error('Failed to fetch department resources');
    }
  }

  // GET /departments/{id}/announcements/ - Get all announcements for a department
  async getDepartmentAnnouncements(id) {
    try {
      console.log(`Fetching announcements for department ${id}...`);
      const response = await this.makeRequest(`/${id}/announcements/`);
      return response;
    } catch (error) {
      console.error('Error fetching department announcements:', error);
      throw new Error('Failed to fetch department announcements');
    }
  }

  // GET /departments/{id}/events/ - Get all events for a department
  async getDepartmentEvents(id) {
    try {
      console.log(`Fetching events for department ${id}...`);
      const response = await this.makeRequest(`/${id}/events/`);
      return response;
    } catch (error) {
      console.error('Error fetching department events:', error);
      throw new Error('Failed to fetch department events');
    }
  }

  // GET /departments/{id}/documents/ - Get all documents for a department
  async getDepartmentDocuments(id) {
    try {
      console.log(`Fetching documents for department ${id}...`);
      const response = await this.makeRequest(`/${id}/documents/`);
      return response;
    } catch (error) {
      console.error('Error fetching department documents:', error);
      throw new Error('Failed to fetch department documents');
    }
  }

  // POST /departments/{id}/update_counts/ - Update faculty and student counts
  async updateDepartmentCounts(id, countData) {
    try {
      console.log('Updating department counts:', id, countData);
      const response = await this.makeRequest(`/${id}/update_counts/`, {
        method: 'POST',
        body: JSON.stringify(countData)
      });
      return response;
    } catch (error) {
      console.error('Error updating department counts:', error);
      throw error;
    }
  }

  // ==================== DEPARTMENT RESOURCES ====================

  // Helper method to prepare resource data for API submission
  prepareResourceData(resourceData) {
    const apiData = { ...resourceData };
    
    // Map field names to match API expectations
    if (apiData.department_id) {
      apiData.department = apiData.department_id;
      delete apiData.department_id;
    }
    
    // Convert empty strings to null for optional fields
    const optionalFields = [
      'purchase_date', 'warranty_expiry', 'maintenance_schedule',
      'responsible_person', 'responsible_person_id', 'cost', 'notes'
    ];
    
    optionalFields.forEach(field => {
      if (apiData[field] === '') {
        apiData[field] = null;
      }
    });
    
    // Ensure numeric fields are properly formatted
    if (apiData.cost !== null && apiData.cost !== undefined && apiData.cost !== '') {
      apiData.cost = parseFloat(apiData.cost) || 0;
    }
    
    // Ensure required fields are present
    if (!apiData.department) {
      throw new Error('Department is required');
    }
    if (!apiData.name || apiData.name.trim() === '') {
      throw new Error('Resource name is required');
    }
    if (!apiData.resource_type) {
      throw new Error('Resource type is required');
    }
    if (!apiData.description || apiData.description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!apiData.location || apiData.location.trim() === '') {
      throw new Error('Location is required');
    }
    if (!apiData.status) {
      throw new Error('Status is required');
    }
    
    return apiData;
  }

  // GET /departments/resources/ - List all resources
  async getResources(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.resource_type) queryParams.append('resource_type', params.resource_type);
      if (params.status) queryParams.append('status', params.status);
      if (params.department_id) queryParams.append('department_id', params.department_id);
      
      const endpoint = queryParams.toString() ? `/resources/?${queryParams.toString()}` : '/resources/';
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  // OPTIONS /departments/resources/ - Get metadata (choices) for resource fields
  async getResourceOptions() {
    try {
      const response = await this.makeRequest('/resources/', {
        method: 'OPTIONS'
      });
      return response;
    } catch (error) {
      console.error('Error fetching resource options:', error);
      return null;
    }
  }

  // POST /departments/resources/ - Create new resource
  async createResource(resourceData) {
    try {
      console.log('Creating resource:', JSON.stringify(resourceData, null, 2));
      
      // Prepare resource data for API submission
      const apiData = this.prepareResourceData(resourceData);
      console.log('Prepared API data:', JSON.stringify(apiData, null, 2));
      
      const response = await this.makeRequest('/resources/', {
        method: 'POST',
        body: JSON.stringify(apiData)
      });
      return response;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  // GET /departments/resources/{id}/ - Get resource details
  async getResourceById(id) {
    try {
      console.log(`Fetching resource ${id}...`);
      const response = await this.makeRequest(`/resources/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw new Error('Failed to fetch resource');
    }
  }

  // PUT /departments/resources/{id}/ - Update resource
  async updateResource(id, resourceData) {
    try {
      console.log('Updating resource:', id, resourceData);
      
      // Prepare resource data for API submission
      const apiData = this.prepareResourceData(resourceData);
      
      const response = await this.makeRequest(`/resources/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(apiData)
      });
      return response;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
  }

  // PATCH /departments/resources/{id}/ - Partial update resource
  async partialUpdateResource(id, resourceData) {
    try {
      console.log('Partially updating resource:', id, resourceData);
      const response = await this.makeRequest(`/resources/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(resourceData)
      });
      return response;
    } catch (error) {
      console.error('Error partially updating resource:', error);
      throw new Error('Failed to partially update resource');
    }
  }

  // DELETE /departments/resources/{id}/ - Delete resource
  async deleteResource(id) {
    try {
      console.log('Deleting resource:', id);
      const response = await this.makeRequest(`/resources/${id}/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  }

  // ==================== DEPARTMENT ANNOUNCEMENTS ====================

  // GET /departments/announcements/ - List all announcements
  async getAnnouncements(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.announcement_type) queryParams.append('announcement_type', params.announcement_type);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.is_published !== undefined) queryParams.append('is_published', params.is_published);
      if (params.department_id) queryParams.append('department_id', params.department_id);
      
      const endpoint = queryParams.toString() ? `/announcements/?${queryParams.toString()}` : '/announcements/';
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }

  // POST /departments/announcements/ - Create new announcement
  async createAnnouncement(announcementData) {
    try {
      console.log('Creating announcement:', announcementData);
      // Map department_id -> department
      const prepared = { ...announcementData };
      if (prepared.department_id) {
        prepared.department = prepared.department_id;
        delete prepared.department_id;
      }
      let body;
      if (prepared && prepared._files && prepared._files.length) {
        const form = new FormData();
        Object.entries(prepared).forEach(([key, value]) => {
          if (key === '_files') return;
          if (value === undefined || value === null) return;
          form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        prepared._files.forEach((file) => form.append('attachments', file));
        body = form;
      } else {
        body = JSON.stringify(prepared);
      }
      const response = await this.makeRequest('/announcements/', {
        method: 'POST',
        body
      });
      return response;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  }

  // GET /departments/announcements/{id}/ - Get announcement details
  async getAnnouncementById(id) {
    try {
      console.log(`Fetching announcement ${id}...`);
      const response = await this.makeRequest(`/announcements/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw new Error('Failed to fetch announcement');
    }
  }

  // PUT /departments/announcements/{id}/ - Update announcement
  async updateAnnouncement(id, announcementData) {
    try {
      console.log('Updating announcement:', id, announcementData);
      const prepared = { ...announcementData };
      if (prepared.department_id) {
        prepared.department = prepared.department_id;
        delete prepared.department_id;
      }
      let body;
      if (prepared && prepared._files && prepared._files.length) {
        const form = new FormData();
        Object.entries(prepared).forEach(([key, value]) => {
          if (key === '_files') return;
          if (value === undefined || value === null) return;
          form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        prepared._files.forEach((file) => form.append('attachments', file));
        body = form;
      } else {
        body = JSON.stringify(prepared);
      }
      const response = await this.makeRequest(`/announcements/${id}/`, {
        method: 'PUT',
        body
      });
      return response;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw new Error('Failed to update announcement');
    }
  }

  // PATCH /departments/announcements/{id}/ - Partial update announcement
  async partialUpdateAnnouncement(id, announcementData) {
    try {
      console.log('Partially updating announcement:', id, announcementData);
      const response = await this.makeRequest(`/announcements/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(announcementData)
      });
      return response;
    } catch (error) {
      console.error('Error partially updating announcement:', error);
      throw new Error('Failed to partially update announcement');
    }
  }

  // DELETE /departments/announcements/{id}/ - Delete announcement
  async deleteAnnouncement(id) {
    try {
      console.log('Deleting announcement:', id);
      const response = await this.makeRequest(`/announcements/${id}/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  }

  // ==================== DEPARTMENT EVENTS ====================

  // GET /departments/events/ - List all events
  async getEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.event_type) queryParams.append('event_type', params.event_type);
      if (params.status) queryParams.append('status', params.status);
      if (params.is_public !== undefined) queryParams.append('is_public', params.is_public);
      if (params.department_id) queryParams.append('department_id', params.department_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const endpoint = queryParams.toString() ? `/events/?${queryParams.toString()}` : '/events/';
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Helper method to prepare event data for API submission
  prepareEventData(eventData) {
    const prepared = { ...eventData };
    
    // Map department_id to department for the API
    if (prepared.department_id) {
      prepared.department = prepared.department_id;
      delete prepared.department_id;
    }
    
    // Ensure required fields have values
    if (!prepared.department) {
      throw new Error('Department is required');
    }
    
    // Handle location field - API requires it to not be null, so provide default if empty
    if (!prepared.location || prepared.location.trim() === '') {
      prepared.location = 'TBD'; // Default location
    }
    
    // Handle organizer field - if it's a string (not UUID), convert to null
    if (prepared.organizer && typeof prepared.organizer === 'string') {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(prepared.organizer)) {
        // If it's not a UUID, set to null
        prepared.organizer = null;
      }
    } else if (prepared.organizer === '') {
      prepared.organizer = null;
    }
    
    // Convert empty strings to null for other optional fields
    const optionalFields = ['contact_email', 'contact_phone', 'description', 'end_date', 'duration_hours', 'max_attendees', 'registration_deadline'];
    optionalFields.forEach(field => {
      if (prepared[field] === '') {
        prepared[field] = null;
      }
    });
    
    // Ensure numeric fields are properly formatted
    if (prepared.duration_hours !== null && prepared.duration_hours !== undefined) {
      prepared.duration_hours = parseFloat(prepared.duration_hours) || 0;
    }
    if (prepared.max_attendees !== null && prepared.max_attendees !== undefined) {
      prepared.max_attendees = parseInt(prepared.max_attendees) || null;
    }
    
    // Ensure boolean fields are properly formatted
    prepared.is_public = Boolean(prepared.is_public);
    prepared.registration_required = Boolean(prepared.registration_required);
    
    console.log('Prepared event data:', prepared);
    return prepared;
  }

  // POST /departments/events/ - Create new event
  async createEvent(eventData) {
    try {
      console.log('Creating event:', eventData);
      const preparedData = this.prepareEventData(eventData);
      const response = await this.makeRequest('/events/', {
        method: 'POST',
        body: JSON.stringify(preparedData)
      });
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  // GET /departments/events/{id}/ - Get event details
  async getEventById(id) {
    try {
      console.log(`Fetching event ${id}...`);
      const response = await this.makeRequest(`/events/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  // PUT /departments/events/{id}/ - Update event
  async updateEvent(id, eventData) {
    try {
      console.log('Updating event:', id, eventData);
      const preparedData = this.prepareEventData(eventData);
      const response = await this.makeRequest(`/events/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(preparedData)
      });
      return response;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // PATCH /departments/events/{id}/ - Partial update event
  async partialUpdateEvent(id, eventData) {
    try {
      console.log('Partially updating event:', id, eventData);
      const response = await this.makeRequest(`/events/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(eventData)
      });
      return response;
    } catch (error) {
      console.error('Error partially updating event:', error);
      throw new Error('Failed to partially update event');
    }
  }

  // DELETE /departments/events/{id}/ - Delete event
  async deleteEvent(id) {
    try {
      console.log('Deleting event:', id);
      const response = await this.makeRequest(`/events/${id}/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  // ==================== DEPARTMENT DOCUMENTS ====================

  // GET /departments/documents/ - List all documents
  async getDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.document_type) queryParams.append('document_type', params.document_type);
      if (params.is_public !== undefined) queryParams.append('is_public', params.is_public);
      if (params.department_id) queryParams.append('department_id', params.department_id);
      
      const endpoint = queryParams.toString() ? `/documents/?${queryParams.toString()}` : '/documents/';
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  // Helper method to prepare document data for API submission
  prepareDocumentData(documentData) {
    const prepared = { ...documentData };
    
    // Map department_id to department for the API
    if (prepared.department_id) {
      prepared.department = prepared.department_id;
      delete prepared.department_id;
    }
    
    // Ensure required fields have values
    if (!prepared.department) {
      throw new Error('Department is required');
    }
    
    // Convert empty strings to null for optional fields
    const optionalFields = ['description', 'version', 'file_type', 'file_size', 'file_path', 'file_url'];
    optionalFields.forEach(field => {
      if (prepared[field] === '') {
        prepared[field] = null;
      }
    });
    
    // Ensure boolean fields are properly formatted
    prepared.is_public = Boolean(prepared.is_public);
    
    console.log('Prepared document data:', prepared);
    return prepared;
  }

  // POST /departments/documents/ - Create new document
  async createDocument(documentData) {
    try {
      console.log('Creating document:', documentData);
      
      let body;
      if (documentData instanceof FormData) {
        // Handle file upload with FormData
        body = documentData;
        // Map department_id to department in FormData
        if (body.has('department_id')) {
          const departmentId = body.get('department_id');
          body.append('department', departmentId);
          body.delete('department_id');
        }
      } else {
        // Handle regular JSON data
        const preparedData = this.prepareDocumentData(documentData);
        body = JSON.stringify(preparedData);
      }
      
      const response = await this.makeRequest('/documents/', {
        method: 'POST',
        body
      });
      return response;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }

  // GET /departments/documents/{id}/ - Get document details
  async getDocumentById(id) {
    try {
      console.log(`Fetching document ${id}...`);
      const response = await this.makeRequest(`/documents/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  }

  // PUT /departments/documents/{id}/ - Update document
  async updateDocument(id, documentData) {
    try {
      console.log('Updating document:', id, documentData);
      const preparedData = this.prepareDocumentData(documentData);
      const response = await this.makeRequest(`/documents/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(preparedData)
      });
      return response;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  // PATCH /departments/documents/{id}/ - Partial update document
  async partialUpdateDocument(id, documentData) {
    try {
      console.log('Partially updating document:', id, documentData);
      const response = await this.makeRequest(`/documents/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(documentData)
      });
      return response;
    } catch (error) {
      console.error('Error partially updating document:', error);
      throw new Error('Failed to partially update document');
    }
  }

  // DELETE /departments/documents/{id}/ - Delete document
  async deleteDocument(id) {
    try {
      console.log('Deleting document:', id);
      const response = await this.makeRequest(`/documents/${id}/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }


  // ==================== MOCK DATA ====================

  getMockDepartmentData() {
    return [
      {
        id: 1,
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering offering undergraduate and postgraduate programs in computer science.',
        status: 'active',
        head_of_department: 'Dr. John Smith',
        email: 'hod.cse@university.edu',
        phone: '+1-555-0123',
        website: 'https://cse.university.edu',
        building: 'Engineering Block A',
        floor: '3rd Floor',
        room_number: 'A-301',
        address: '123 University Avenue, Engineering Campus',
        established_date: '1995-01-15',
        accreditation: 'ABET Accredited',
        programs_offered: ['B.Tech CSE', 'M.Tech CSE', 'Ph.D CSE'],
        budget: '$2,500,000',
        equipment: 'High-performance computing labs, AI/ML workstations',
        facilities: 'Research labs, Computer labs, Seminar halls',
        vision: 'To be a leading department in computer science education and research.',
        mission: 'To provide quality education and conduct cutting-edge research in computer science.',
        objectives: 'Excellence in education, research, and innovation',
        achievements: 'Ranked among top 10 CSE departments nationally',
        notes: 'Strong industry partnerships and research collaborations',
        faculty_count: 25,
        student_count: 800,
        course_count: 45,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        description: 'Department of Electronics and Communication Engineering focusing on modern communication technologies.',
        status: 'active',
        head_of_department: 'Dr. Sarah Johnson',
        email: 'hod.ece@university.edu',
        phone: '+1-555-0124',
        website: 'https://ece.university.edu',
        building: 'Engineering Block B',
        floor: '2nd Floor',
        room_number: 'B-201',
        address: '123 University Avenue, Engineering Campus',
        established_date: '1990-08-20',
        accreditation: 'ABET Accredited',
        programs_offered: ['B.Tech ECE', 'M.Tech ECE', 'Ph.D ECE'],
        budget: '$2,200,000',
        equipment: 'RF/Microwave labs, Signal processing workstations',
        facilities: 'Communication labs, Electronics labs, Research centers',
        vision: 'To excel in electronics and communication engineering education and research.',
        mission: 'To develop skilled engineers and conduct innovative research.',
        objectives: 'Industry-ready graduates and cutting-edge research',
        achievements: 'Multiple research grants and industry collaborations',
        notes: 'Strong focus on 5G and IoT technologies',
        faculty_count: 22,
        student_count: 750,
        course_count: 40,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering with focus on design, manufacturing, and thermal sciences.',
        status: 'active',
        head_of_department: 'Dr. Michael Brown',
        email: 'hod.me@university.edu',
        phone: '+1-555-0125',
        website: 'https://me.university.edu',
        building: 'Engineering Block C',
        floor: '1st Floor',
        room_number: 'C-101',
        address: '123 University Avenue, Engineering Campus',
        established_date: '1985-06-10',
        accreditation: 'ABET Accredited',
        programs_offered: ['B.Tech ME', 'M.Tech ME', 'Ph.D ME'],
        budget: '$3,000,000',
        equipment: 'CAD/CAM labs, Manufacturing equipment, Testing machines',
        facilities: 'Workshops, Design labs, Research facilities',
        vision: 'To be a premier mechanical engineering department globally.',
        mission: 'To provide world-class education and research in mechanical engineering.',
        objectives: 'Innovation in design and manufacturing technologies',
        achievements: 'Multiple patents and industry partnerships',
        notes: 'Strong emphasis on sustainable engineering practices',
        faculty_count: 28,
        student_count: 900,
        course_count: 50,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Department of Civil Engineering specializing in infrastructure and construction technologies.',
        status: 'active',
        head_of_department: 'Dr. Emily Davis',
        email: 'hod.ce@university.edu',
        phone: '+1-555-0126',
        website: 'https://ce.university.edu',
        building: 'Engineering Block D',
        floor: '2nd Floor',
        room_number: 'D-201',
        address: '123 University Avenue, Engineering Campus',
        established_date: '1980-03-15',
        accreditation: 'ABET Accredited',
        programs_offered: ['B.Tech CE', 'M.Tech CE', 'Ph.D CE'],
        budget: '$2,800,000',
        equipment: 'Structural testing equipment, Surveying instruments',
        facilities: 'Materials testing lab, Surveying lab, CAD lab',
        vision: 'To lead in civil engineering education and sustainable infrastructure development.',
        mission: 'To develop innovative solutions for infrastructure challenges.',
        objectives: 'Sustainable construction and smart infrastructure',
        achievements: 'Major infrastructure projects and research grants',
        notes: 'Focus on green building and smart city technologies',
        faculty_count: 24,
        student_count: 850,
        course_count: 42,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'Business Administration',
        code: 'MBA',
        description: 'Department of Business Administration offering comprehensive business education programs.',
        status: 'active',
        head_of_department: 'Dr. Robert Wilson',
        email: 'hod.mba@university.edu',
        phone: '+1-555-0127',
        website: 'https://mba.university.edu',
        building: 'Business School',
        floor: '4th Floor',
        room_number: 'BS-401',
        address: '456 Business Avenue, Main Campus',
        established_date: '1992-09-01',
        accreditation: 'AACSB Accredited',
        programs_offered: ['MBA', 'Executive MBA', 'Ph.D Business'],
        budget: '$1,800,000',
        equipment: 'Business simulation software, Case study materials',
        facilities: 'Case study rooms, Business labs, Conference facilities',
        vision: 'To be a globally recognized business school.',
        mission: 'To develop future business leaders and entrepreneurs.',
        objectives: 'Leadership development and entrepreneurial mindset',
        achievements: 'High placement rates and industry recognition',
        notes: 'Strong corporate partnerships and alumni network',
        faculty_count: 18,
        student_count: 600,
        course_count: 35,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 6,
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics providing foundational and advanced mathematical education.',
        status: 'active',
        head_of_department: 'Dr. Lisa Anderson',
        email: 'hod.math@university.edu',
        phone: '+1-555-0128',
        website: 'https://math.university.edu',
        building: 'Science Block A',
        floor: '3rd Floor',
        room_number: 'SA-301',
        address: '789 Science Street, Main Campus',
        established_date: '1975-01-01',
        accreditation: 'Regional Accreditation',
        programs_offered: ['B.Sc Mathematics', 'M.Sc Mathematics', 'Ph.D Mathematics'],
        budget: '$1,200,000',
        equipment: 'Mathematical software, Computing facilities',
        facilities: 'Computer labs, Research facilities, Study rooms',
        vision: 'To excel in mathematical education and research.',
        mission: 'To develop mathematical thinking and problem-solving skills.',
        objectives: 'Mathematical excellence and research innovation',
        achievements: 'Multiple research publications and awards',
        notes: 'Strong foundation for engineering and science programs',
        faculty_count: 15,
        student_count: 400,
        course_count: 30,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // ==================== UTILITY METHODS ====================

  // Update token when user logs in
  updateToken(token) {
    this.token = token;
  }

  // Clear token when user logs out
  logout() {
    localStorage.removeItem('django_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token = null;
  }
}

// Create and export a singleton instance
const departmentApiService = new DepartmentApiService();

// Export both as default and named export for compatibility
export { departmentApiService };
export default departmentApiService;
