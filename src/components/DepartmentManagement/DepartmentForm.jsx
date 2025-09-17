import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faSave, faBuilding, faUser, faMapMarkerAlt, 
  faPhone, faEnvelope, faGlobe, faCalendarAlt, faBook,
  faPlus, faTrash, faExclamationTriangle, faUsers, faGraduationCap,
  faDollarSign, faChartBar, faFileAlt, faCog
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentForm = ({ department, faculty, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    short_name: '',
    code: '',
    department_type: 'ACADEMIC',
    parent_department: '',
    
    // Leadership
    head_of_department: '',
    head_of_department_id: '',
    deputy_head: '',
    deputy_head_id: '',
    
    // Contact Information
    email: '',
    phone: '',
    fax: '',
    
    // Location
    building: '',
    floor: '',
    room_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Academic Information
    established_date: '',
    accreditation_status: '',
    accreditation_valid_until: '',
    
    // Department Details
    description: '',
    mission: '',
    vision: '',
    objectives: '',
    
    // Capacity & Resources
    max_faculty_capacity: 50,
    max_student_capacity: 500,
    current_faculty_count: 0,
    current_student_count: 0,
    faculty_utilization_percentage: 0.0,
    student_utilization_percentage: 0.0,
    
    // Financial Information
    annual_budget: '',
    budget_year: '',
    
    // Status & Metadata
    status: 'ACTIVE',
    is_active: true,
    website_url: '',
    social_media_links: '{}',
    logo: null
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Department types
  const departmentTypes = [
    { value: 'ACADEMIC', label: 'Academic Department' },
    { value: 'ADMINISTRATIVE', label: 'Administrative Department' },
    { value: 'RESEARCH', label: 'Research Department' },
    { value: 'SERVICE', label: 'Service Department' },
    { value: 'SUPPORT', label: 'Support Department' }
  ];

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'MERGED', label: 'Merged' },
    { value: 'DISSOLVED', label: 'Dissolved' }
  ];

  // Accreditation status options
  const accreditationOptions = [
    { value: '', label: 'Select accreditation status' },
    { value: 'NAAC', label: 'NAAC' },
    { value: 'NBA', label: 'NBA' },
    { value: 'AICTE', label: 'AICTE' },
    { value: 'UGC', label: 'UGC' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Form tabs
  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: faBuilding },
    { id: 'leadership', label: 'Leadership', icon: faUser },
    { id: 'contact', label: 'Contact Information', icon: faPhone },
    { id: 'location', label: 'Location', icon: faMapMarkerAlt },
    { id: 'academic', label: 'Academic Information', icon: faGraduationCap },
    { id: 'details', label: 'Department Details', icon: faBook },
    { id: 'capacity', label: 'Capacity & Resources', icon: faUsers },
    { id: 'financial', label: 'Financial Information', icon: faDollarSign },
    { id: 'status', label: 'Status & Metadata', icon: faCog }
  ];

  useEffect(() => {
    if (department) {
      setFormData({
        // Basic Information
        name: department.name || '',
        short_name: department.short_name || '',
        code: department.code || '',
        department_type: department.department_type || 'ACADEMIC',
        parent_department: department.parent_department || '',
        
        // Leadership
        // Prefer explicit *_id fields from API; otherwise fall back to ID fields
        head_of_department: department.head_of_department_name || department.head_of_department_label || (typeof department.head_of_department === 'string' ? department.head_of_department : ''),
        head_of_department_id: department.head_of_department_id || department.head_of_department || '',
        deputy_head: department.deputy_head_name || department.deputy_head_label || (typeof department.deputy_head === 'string' ? department.deputy_head : ''),
        deputy_head_id: department.deputy_head_id || department.deputy_head || '',
        
        // Contact Information
        email: department.email || '',
        phone: department.phone || '',
        fax: department.fax || '',
        
        // Location
        building: department.building || '',
        floor: department.floor || '',
        room_number: department.room_number || '',
        address_line1: department.address_line1 || '',
        address_line2: department.address_line2 || '',
        city: department.city || '',
        state: department.state || '',
        postal_code: department.postal_code || '',
        country: department.country || '',
        
        // Academic Information
        established_date: department.established_date || '',
        accreditation_status: department.accreditation_status || '',
        accreditation_valid_until: department.accreditation_valid_until || '',
        
        // Department Details
        description: department.description || '',
        mission: department.mission || '',
        vision: department.vision || '',
        objectives: department.objectives || '',
        
        // Capacity & Resources
        max_faculty_capacity: department.max_faculty_capacity || 50,
        max_student_capacity: department.max_student_capacity || 500,
        current_faculty_count: department.current_faculty_count || 0,
        current_student_count: department.current_student_count || 0,
        faculty_utilization_percentage: department.faculty_utilization_percentage || 0.0,
        student_utilization_percentage: department.student_utilization_percentage || 0.0,
        
        // Financial Information
        annual_budget: department.annual_budget || '',
        budget_year: department.budget_year || '',
        
        // Status & Metadata
        status: department.status || 'ACTIVE',
        is_active: department.is_active !== undefined ? department.is_active : true,
        website_url: department.website_url || '',
        social_media_links: department.social_media_links || '{}',
        logo: department.logo || null
      });
    }
  }, [department]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFacultySelect = (field, facultyId, facultyName) => {
    setFormData(prev => ({
      ...prev,
      [field]: facultyName || '',
      [`${field}_id`]: facultyId || ''
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) errors.name = 'Department name is required';
    if (!formData.code.trim()) errors.code = 'Department code is required';
    if (!formData.department_type) errors.department_type = 'Department type is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    // API-required fields validation
    if (!formData.short_name.trim()) errors.short_name = 'Short name is required';
    if (!formData.building.trim()) errors.building = 'Building is required';
    if (!formData.established_date) errors.established_date = 'Established date is required';
    if (!formData.description.trim()) errors.description = 'Description is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Capacity validation
    if (formData.max_faculty_capacity < 0) errors.max_faculty_capacity = 'Capacity cannot be negative';
    if (formData.max_student_capacity < 0) errors.max_student_capacity = 'Capacity cannot be negative';
    if (formData.current_faculty_count < 0) errors.current_faculty_count = 'Count cannot be negative';
    if (formData.current_student_count < 0) errors.current_student_count = 'Count cannot be negative';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        // Calculate utilization percentages
        faculty_utilization_percentage: formData.max_faculty_capacity > 0 
          ? (formData.current_faculty_count / formData.max_faculty_capacity) * 100 
          : 0,
        student_utilization_percentage: formData.max_student_capacity > 0 
          ? (formData.current_student_count / formData.max_student_capacity) * 100 
          : 0
      };

      if (department) {
        await departmentApiService.updateDepartment(department.id, submitData);
      } else {
        await departmentApiService.createDepartment(submitData);
      }

      onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full department name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.short_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Short name or abbreviation (e.g., CS, ME, EE)"
                />
                {validationErrors.short_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.short_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Department code for system use (e.g., CS001, ME002)"
                />
                {validationErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department type <span className="text-red-500">*</span>
                </label>
                <select
                  name="department_type"
                  value={formData.department_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.department_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {departmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {validationErrors.department_type && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.department_type}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent department
                </label>
                <select
                  name="parent_department"
                  value={formData.parent_department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select parent department (if this is a sub-department)</option>
                  {/* Add parent department options here */}
                </select>
              </div>
            </div>
          </div>
        );

      case 'leadership':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Head of department
                </label>
                <select
                  value={formData.head_of_department_id}
                  onChange={(e) => {
                    const selectedFaculty = faculty.find(f => f.id === parseInt(e.target.value));
                    handleFacultySelect('head_of_department', e.target.value, selectedFaculty?.name || '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select head of department</option>
                  {faculty && faculty.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} - {fac.designation || 'Faculty'}
                    </option>
                  ))}
                </select>
                {formData.head_of_department && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {formData.head_of_department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deputy head
                </label>
                <select
                  value={formData.deputy_head_id}
                  onChange={(e) => {
                    const selectedFaculty = faculty.find(f => f.id === parseInt(e.target.value));
                    handleFacultySelect('deputy_head', e.target.value, selectedFaculty?.name || '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select deputy head of department</option>
                  {faculty && faculty.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} - {fac.designation || 'Faculty'}
                    </option>
                  ))}
                </select>
                {formData.deputy_head && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {formData.deputy_head}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Department email address"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Department phone number"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fax
                </label>
                <input
                  type="tel"
                  name="fax"
                  value={formData.fax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department fax number"
                />
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.building ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Building name or number"
                />
                {validationErrors.building && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.building}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Floor number or name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room number
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Room number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address line 1
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address line 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address line 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Postal code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="established_date"
                  value={formData.established_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.established_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Date when department was established</p>
                {validationErrors.established_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.established_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation status
                </label>
                <select
                  name="accreditation_status"
                  value={formData.accreditation_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accreditationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Accreditation status (e.g., NAAC, NBA)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation valid until
                </label>
                <input
                  type="date"
                  name="accreditation_valid_until"
                  value={formData.accreditation_valid_until}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Accreditation valid until date</p>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Department description and overview"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission
              </label>
              <textarea
                name="mission"
                value={formData.mission}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department mission statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision
              </label>
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department vision statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectives
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department objectives"
              />
            </div>
          </div>
        );

      case 'capacity':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max faculty capacity
                </label>
                <input
                  type="number"
                  name="max_faculty_capacity"
                  value={formData.max_faculty_capacity}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.max_faculty_capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Maximum faculty capacity</p>
                {validationErrors.max_faculty_capacity && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.max_faculty_capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max student capacity
                </label>
                <input
                  type="number"
                  name="max_student_capacity"
                  value={formData.max_student_capacity}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.max_student_capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Maximum student capacity</p>
                {validationErrors.max_student_capacity && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.max_student_capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current faculty count
                </label>
                <input
                  type="number"
                  name="current_faculty_count"
                  value={formData.current_faculty_count}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.current_faculty_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Current faculty count</p>
                {validationErrors.current_faculty_count && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.current_faculty_count}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current student count
                </label>
                <input
                  type="number"
                  name="current_student_count"
                  value={formData.current_student_count}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.current_student_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Current student count</p>
                {validationErrors.current_student_count && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.current_student_count}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty utilization percentage
                </label>
                <input
                  type="number"
                  value={formData.max_faculty_capacity > 0 ? (formData.current_faculty_count / formData.max_faculty_capacity * 100).toFixed(1) : 0}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Automatically calculated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student utilization percentage
                </label>
                <input
                  type="number"
                  value={formData.max_student_capacity > 0 ? (formData.current_student_count / formData.max_student_capacity * 100).toFixed(1) : 0}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Automatically calculated</p>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual budget
                </label>
                <input
                  type="number"
                  name="annual_budget"
                  value={formData.annual_budget}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Annual budget in local currency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget year
                </label>
                <input
                  type="text"
                  name="budget_year"
                  value={formData.budget_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Budget year (e.g., 2024-2025)"
                />
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Is active
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department website URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social media links
                </label>
                <textarea
                  name="social_media_links"
                  value={formData.social_media_links}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Social media links (JSON format) e.g., {"facebook": "https://facebook.com/dept", "twitter": "https://twitter.com/dept"}'
                />
                <p className="text-sm text-gray-500 mt-1">Enter valid JSON format for social media links</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Department logo</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {department ? 'Edit Department' : 'Add Department'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderTabContent()}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                    {department ? 'Update Department' : 'Create Department'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;