import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, faPlus, faEdit, faTrash, faEye, faSearch, 
  faFilter, faSave, faTimes, faExclamationTriangle,
  faCalendarAlt, faClock, faMapMarkerAlt, faUsers, faGlobe,
  faBuilding, faUser, faEnvelope, faPhone
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';
import facultyApiService from '../../services/facultyApiService';

const DepartmentEvents = ({ selectedDepartment }) => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'SEMINAR',
    status: 'PLANNED',
    department_id: '',
    start_date: '',
    end_date: '',
    duration_hours: 0,
    location: '',
    is_public: false,
    max_attendees: '',
    registration_required: false,
    registration_deadline: '',
    organizer: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadEvents();
    loadDepartments();
    loadFaculty();
  }, [page, searchTerm, eventTypeFilter, statusFilter, publicFilter, dateFromFilter, dateToFilter]);

  const loadEvents = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        event_type: eventTypeFilter || undefined,
        status: statusFilter || undefined,
        is_public: publicFilter !== '' ? publicFilter === 'true' : undefined,
        date_from: dateFromFilter || undefined,
        date_to: dateToFilter || undefined,
        department_id: selectedDepartment?.id || undefined,
        ...params
      };

      const data = await departmentApiService.getEvents(queryParams);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setEvents(normalized);
      const count = typeof data?.count === 'number' ? data.count : normalized.length;
      setTotalCount(count);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentApiService.getDepartments({ page_size: 100 });
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setDepartments(normalized);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadFaculty = async () => {
    try {
      console.log('Loading faculty from backend...');
      const data = await facultyApiService.getFaculty({ page_size: 100 });
      console.log('Faculty API response:', data);
      
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      
      console.log('Normalized faculty data:', normalized);
      setFaculty(normalized);
    } catch (err) {
      console.error('Failed to load faculty:', err);
      console.log('Using fallback faculty data...');
      // Fallback to mock faculty data with proper structure
      setFaculty([
        { 
          id: '1', 
          first_name: 'John', 
          last_name: 'Doe', 
          email: 'john.doe@university.edu',
          designation: 'PROFESSOR',
          department: 'Computer Science',
          employee_id: 'EMP001'
        },
        { 
          id: '2', 
          first_name: 'Jane', 
          last_name: 'Smith', 
          email: 'jane.smith@university.edu',
          designation: 'ASSOCIATE_PROFESSOR',
          department: 'Mathematics',
          employee_id: 'EMP002'
        },
        { 
          id: '3', 
          first_name: 'Mike', 
          last_name: 'Johnson', 
          email: 'mike.johnson@university.edu',
          designation: 'ASSISTANT_PROFESSOR',
          department: 'Physics',
          employee_id: 'EMP003'
        },
        { 
          id: '4', 
          first_name: 'Sarah', 
          last_name: 'Wilson', 
          email: 'sarah.wilson@university.edu',
          designation: 'PROFESSOR',
          department: 'Chemistry',
          employee_id: 'EMP004'
        },
        { 
          id: '5', 
          first_name: 'David', 
          last_name: 'Brown', 
          email: 'david.brown@university.edu',
          designation: 'ASSOCIATE_PROFESSOR',
          department: 'Biology',
          employee_id: 'EMP005'
        }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validations
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!selectedDepartment?.id && !formData.department_id) {
      errors.department_id = 'Department is required';
    }
    
    if (!formData.location || formData.location.trim() === '') {
      errors.location = 'Location is required';
    }
    
    // Email validation
    if (formData.contact_email && formData.contact_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email.trim())) {
        errors.contact_email = 'Please enter a valid email address';
      }
    }
    
    // Date validation
    if (formData.end_date && formData.start_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    // Registration deadline validation
    if (formData.registration_deadline && formData.start_date) {
      if (new Date(formData.registration_deadline) > new Date(formData.start_date)) {
        errors.registration_deadline = 'Registration deadline must be before event start date';
      }
    }
    
    // Max attendees validation
    if (formData.max_attendees && (isNaN(formData.max_attendees) || formData.max_attendees < 1)) {
      errors.max_attendees = 'Max attendees must be a positive number';
    }
    
    // Duration validation
    if (formData.duration_hours && (isNaN(formData.duration_hours) || formData.duration_hours < 0)) {
      errors.duration_hours = 'Duration must be a non-negative number';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Prepare form data for API submission
      const submitData = {
        ...formData,
        department_id: selectedDepartment?.id || formData.department_id,
        // Location is required, so keep the trimmed value
        location: formData.location.trim(),
        // Organizer should be a UUID from faculty dropdown or null
        organizer: formData.organizer || null,
        // Ensure contact_email is not blank - convert empty string to null
        contact_email: formData.contact_email.trim() || null,
        // Ensure contact_phone is not blank - convert empty string to null
        contact_phone: formData.contact_phone.trim() || null,
        // Ensure description is not blank
        description: formData.description.trim() || null,
        // Ensure title is not blank
        title: formData.title.trim()
      };

      if (editingEvent) {
        await departmentApiService.updateEvent(editingEvent.id, submitData);
      } else {
        await departmentApiService.createEvent(submitData);
      }
      
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (err) {
      console.error('Event submission error:', err);
      
      // Handle API validation errors
      if (err.data && typeof err.data === 'object') {
        const apiErrors = {};
        Object.keys(err.data).forEach(field => {
          if (Array.isArray(err.data[field])) {
            apiErrors[field] = err.data[field][0]; // Take first error message
          } else {
            apiErrors[field] = err.data[field];
          }
        });
        setFieldErrors(apiErrors);
        setError('Please fix the errors below and try again.');
      } else {
        setError(err.message || 'Failed to save event. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'SEMINAR',
      status: event.status || 'PLANNED',
      department_id: event.department_id || '',
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      duration_hours: event.duration_hours || 0,
      location: event.location || '',
      is_public: event.is_public || false,
      max_attendees: event.max_attendees || '',
      registration_required: event.registration_required || false,
      registration_deadline: event.registration_deadline || '',
      organizer: event.organizer || '',
      contact_email: event.contact_email || '',
      contact_phone: event.contact_phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await departmentApiService.deleteEvent(id);
        loadEvents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'SEMINAR',
      status: 'PLANNED',
      department_id: '',
      start_date: '',
      end_date: '',
      duration_hours: 0,
      location: '',
      is_public: false,
      max_attendees: '',
      registration_required: false,
      registration_deadline: '',
      organizer: '',
      contact_email: '',
      contact_phone: ''
    });
    setFieldErrors({});
    setError('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEvent(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'ONGOING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'POSTPONED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SEMINAR':
        return 'bg-purple-100 text-purple-800';
      case 'WORKSHOP':
        return 'bg-blue-100 text-blue-800';
      case 'CONFERENCE':
        return 'bg-green-100 text-green-800';
      case 'MEETING':
        return 'bg-gray-100 text-gray-800';
      case 'CELEBRATION':
        return 'bg-pink-100 text-pink-800';
      case 'COMPETITION':
        return 'bg-red-100 text-red-800';
      case 'EXHIBITION':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const eventTypes = [
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'CELEBRATION', label: 'Celebration' },
    { value: 'COMPETITION', label: 'Competition' },
    { value: 'EXHIBITION', label: 'Exhibition' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'POSTPONED', label: 'Postponed' }
  ];

  // Reusable form field component
  const FormField = ({ label, name, type = 'text', required = false, error, children, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          {...props}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        />
      )}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  const FormSelect = ({ label, name, required = false, error, children, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {children}
      </select>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  const FormTextarea = ({ label, name, required = false, error, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Department Events</h2>
            <p className="text-gray-600">
              {selectedDepartment ? `Events for ${selectedDepartment.name}` : 'All Events'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Event
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={publicFilter}
                onChange={(e) => setPublicFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Events</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                placeholder="From Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                placeholder="To Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events found
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      {event.is_public ? (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Public
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{event.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {event.start_date && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                            <span>
                              {new Date(event.start_date).toLocaleDateString()}
                              {event.end_date && event.end_date !== event.start_date && 
                                ` - ${new Date(event.end_date).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        )}
                        {event.duration_hours && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                            <span>Duration: {event.duration_hours} hours</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {event.organizer && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            <span>Organizer: {
                              (() => {
                                const organizerFaculty = faculty.find(f => f.id === event.organizer);
                                if (organizerFaculty) {
                                  const firstName = organizerFaculty.first_name || organizerFaculty.firstName || organizerFaculty.name || '';
                                  const lastName = organizerFaculty.last_name || organizerFaculty.lastName || '';
                                  const designation = organizerFaculty.designation || organizerFaculty.role || 'Faculty';
                                  const displayName = `${firstName} ${lastName}`.trim() || 'Unknown Faculty';
                                  return `${displayName} (${designation})`;
                                }
                                return event.organizer;
                              })()
                            }</span>
                          </div>
                        )}
                        {event.max_attendees && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            <span>Max Attendees: {event.max_attendees}</span>
                          </div>
                        )}
                        {event.contact_email && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                            <span>{event.contact_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= totalCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= totalCount}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Add Department Event'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingEvent ? 'Update event details' : 'Create a new department event'}
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">

              {/* Global Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
                    </div>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormSelect
                        label="Department"
                        name="department_id"
                        value={selectedDepartment?.id || formData.department_id}
                        onChange={handleInputChange}
                        required
                        disabled={!!selectedDepartment}
                        error={fieldErrors.department_id}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="md:col-span-2">
                      <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter event title"
                        error={fieldErrors.title}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormTextarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        placeholder="Describe the event details, objectives, and what attendees can expect"
                        error={fieldErrors.description}
                      />
                    </div>
                    <div>
                      <FormSelect
                        label="Event Type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.event_type}
                      >
                        {eventTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faCalendar} className="text-green-600" />
                    </div>
                    Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormField
                        label="Start Date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.start_date}
                      />
                    </div>
                    <div>
                      <FormField
                        label="End Date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        error={fieldErrors.end_date}
                      />
                    </div>
                    <div>
                      <FormField
                        label="Duration Hours"
                        name="duration_hours"
                        type="number"
                        value={formData.duration_hours}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        placeholder="e.g., 2.5"
                        error={fieldErrors.duration_hours}
                      />
                    </div>
                    <div>
                      <FormField
                        label="Location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Main Auditorium, Room 101"
                        error={fieldErrors.location}
                      />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faEye} className="text-purple-600" />
                    </div>
                    Event Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormSelect
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.status}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div>
                      <FormField
                        label="Max Attendees"
                        name="max_attendees"
                        type="number"
                        value={formData.max_attendees}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="e.g., 100"
                        error={fieldErrors.max_attendees}
                      />
                    </div>
                    <div>
                      <FormField
                        label="Registration Deadline"
                        name="registration_deadline"
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={handleInputChange}
                        error={fieldErrors.registration_deadline}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm font-medium text-gray-900">
                        Public Event
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="registration_required"
                        checked={formData.registration_required}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm font-medium text-gray-900">
                        Registration Required
                      </label>
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faUsers} className="text-orange-600" />
                    </div>
                    Organization
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormSelect
                        label="Organizer"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleInputChange}
                        error={fieldErrors.organizer}
                      >
                        <option value="">Select Organizer</option>
                        {faculty.map(member => {
                          const firstName = member.first_name || member.firstName || member.name || '';
                          const lastName = member.last_name || member.lastName || '';
                          const designation = member.designation || member.role || 'Faculty';
                          const department = member.department || member.department_name || 'Department';
                          const displayName = `${firstName} ${lastName}`.trim() || 'Unknown Faculty';
                          
                          return (
                            <option key={member.id} value={member.id}>
                              {displayName} - {designation} ({department})
                            </option>
                          );
                        })}
                      </FormSelect>
                    </div>
                    <div>
                      <FormField
                        label="Contact Email"
                        name="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        placeholder="e.g., contact@university.edu"
                        error={fieldErrors.contact_email}
                      />
                    </div>
                    <div>
                      <FormField
                        label="Contact Phone"
                        name="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        placeholder="e.g., +1 (555) 123-4567"
                        error={fieldErrors.contact_phone}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingEvent ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {editingEvent ? 'Update Event' : 'Create Event'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentEvents;