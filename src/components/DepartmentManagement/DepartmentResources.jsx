import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes, 
  faExclamationTriangle,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentResources = () => {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    department_id: '',
    name: '',
    resource_type: 'LABORATORY',
    description: '',
    location: '',
    status: 'AVAILABLE',
    purchase_date: '',
    warranty_expiry: '',
    maintenance_schedule: '',
    responsible_person: '',
    responsible_person_id: '',
    cost: '',
    notes: ''
  });

  const [resourceTypes, setResourceTypes] = useState([
    { value: 'LABORATORY', label: 'Laboratory Equipment' },
    { value: 'COMPUTER', label: 'Computer Hardware' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'VEHICLE', label: 'Vehicle' },
    { value: 'BOOK', label: 'Books/Publications' },
    { value: 'SOFTWARE', label: 'Software License' },
    { value: 'OTHER', label: 'Other' }
  ]);

  const [statusOptions, setStatusOptions] = useState([
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'MAINTENANCE', label: 'Under Maintenance' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'RETIRED', label: 'Retired' }
  ]);

  const maintenanceSchedules = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'SEMI_ANNUAL', label: 'Semi-Annual' },
    { value: 'ANNUAL', label: 'Annual' },
    { value: 'AS_NEEDED', label: 'As Needed' }
  ];

  useEffect(() => {
    loadData();
  }, [page, searchTerm, statusFilter]);

  // Fetch dynamic choices for resource_type and status from OPTIONS metadata
  useEffect(() => {
    const fetchOptions = async () => {
      const meta = await departmentApiService.getResourceOptions();
      // Expect DRF OPTIONS shape: { actions: { POST: { field: { choices: [{value, display_name}] } } } }
      const postFields = meta?.actions?.POST || {};

      const mapChoices = (choices) =>
        Array.isArray(choices)
          ? choices.map(c => ({ value: c.value ?? c[0] ?? '', label: c.display_name ?? c[1] ?? String(c.value ?? c[0] ?? '') }))
          : [];

      const rtChoices = mapChoices(postFields?.resource_type?.choices);
      const stChoices = mapChoices(postFields?.status?.choices);

      if (rtChoices.length > 0) setResourceTypes(rtChoices);
      if (stChoices.length > 0) setStatusOptions(stChoices);

      // If current defaults are invalid, set to first valid values
      setFormData(prev => ({
        ...prev,
        resource_type: rtChoices.length ? rtChoices[0].value : prev.resource_type,
        status: stChoices.length ? stChoices[0].value : prev.status,
      }));
    };
    fetchOptions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const departmentsPromise = departmentApiService.getDepartments();
      const facultyPromise = typeof departmentApiService.getFaculty === 'function'
        ? departmentApiService.getFaculty()
        : Promise.resolve({ results: [] });

      const [departmentsData, facultyData] = await Promise.all([departmentsPromise, facultyPromise]);
      
      setDepartments(departmentsData.results || []);
      setFaculty(facultyData.results || []);
      
      // Load resources for selected department or all departments
      if (selectedDepartment) {
        const resourcesData = await departmentApiService.getDepartmentResources(selectedDepartment.id);
        setResources(resourcesData.results || []);
        setTotalCount(resourcesData.count || 0);
      } else {
        // Load all resources with pagination and filters
        const resourcesData = await departmentApiService.getResources({
          page,
          page_size: pageSize,
          search: searchTerm,
          status: statusFilter
        });
        setResources(resourcesData.results || []);
        setTotalCount(resourcesData.count || 0);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFacultySelect = (facultyId, facultyName) => {
    setFormData(prev => ({
      ...prev,
      responsible_person_id: facultyId || '',
      responsible_person: facultyName || ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.department_id) errors.department_id = 'Department is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.resource_type) errors.resource_type = 'Resource type is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.status) errors.status = 'Status is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      
      if (editingResource) {
        await departmentApiService.updateResource(editingResource.id, formData);
      } else {
        await departmentApiService.createResource(formData);
      }
      
      setShowModal(false);
      setEditingResource(null);
      setFormData({
        department_id: selectedDepartment?.id || '',
        name: '',
        resource_type: 'LABORATORY',
        description: '',
        location: '',
        status: 'AVAILABLE',
        purchase_date: '',
        warranty_expiry: '',
        maintenance_schedule: '',
        responsible_person: '',
        responsible_person_id: '',
        cost: '',
        notes: ''
      });
      
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save resource');
      console.error('Error saving resource:', err);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      department_id: resource.department_id || '',
      name: resource.name || '',
      resource_type: resource.resource_type || 'LABORATORY',
      description: resource.description || '',
      location: resource.location || '',
      status: resource.status || 'AVAILABLE',
      purchase_date: resource.purchase_date || '',
      warranty_expiry: resource.warranty_expiry || '',
      maintenance_schedule: resource.maintenance_schedule || '',
      responsible_person: resource.responsible_person || '',
      responsible_person_id: resource.responsible_person_id || '',
      cost: resource.cost || '',
      notes: resource.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await departmentApiService.deleteResource(resourceId);
        loadData();
      } catch (err) {
        setError('Failed to delete resource');
        console.error('Error deleting resource:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'IN_USE': return 'text-blue-600 bg-blue-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      case 'DAMAGED': return 'text-red-600 bg-red-100';
      case 'RETIRED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Department Resources</h2>
            <p className="text-gray-600">Manage department resources and equipment</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment?.id || ''}
                onChange={(e) => {
                  const dept = departments.find(d => d.id === e.target.value);
                  setSelectedDepartment(dept || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading resources...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                          <div className="text-sm text-gray-500">{resource.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resourceTypes.find(t => t.value === resource.resource_type)?.label || resource.resource_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {departments.find(d => d.id === resource.department_id)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                            {statusOptions.find(s => s.value === resource.status)?.label || resource.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resource.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page * pageSize >= totalCount}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page * pageSize >= totalCount}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingResource ? 'Edit Resource' : 'Add Department Resource'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingResource(null);
                  setFormData({
                    department_id: selectedDepartment?.id || '',
                    name: '',
                    resource_type: 'LABORATORY',
                    description: '',
                    location: '',
                    status: 'AVAILABLE',
                    purchase_date: '',
                    warranty_expiry: '',
                    maintenance_schedule: '',
                    responsible_person: '',
                    responsible_person_id: '',
                    cost: '',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.department_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.department_id && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.department_id}</p>
                      )}
                    </div>

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
                        placeholder="Resource name"
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="resource_type"
                        value={formData.resource_type}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.resource_type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {resourceTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.resource_type && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.resource_type}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Resource location"
                      />
                      {validationErrors.location && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Resource description"
                      />
                      {validationErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Maintenance */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Maintenance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.status && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.status}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Expiry
                      </label>
                      <input
                        type="date"
                        name="warranty_expiry"
                        value={formData.warranty_expiry}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Schedule
                      </label>
                      <select
                        name="maintenance_schedule"
                        value={formData.maintenance_schedule}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Schedule</option>
                        {maintenanceSchedules.map(schedule => (
                          <option key={schedule.value} value={schedule.value}>
                            {schedule.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Responsibility & Cost */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Responsibility & Cost</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsible Person
                      </label>
                      <select
                        value={formData.responsible_person_id}
                        onChange={(e) => {
                          const selectedFaculty = faculty.find(f => f.id === e.target.value);
                          handleFacultySelect(selectedFaculty?.id, selectedFaculty?.name);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Person</option>
                        {faculty.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingResource(null);
                      setFormData({
                        department_id: selectedDepartment?.id || '',
                        name: '',
                        resource_type: 'LABORATORY',
                        description: '',
                        location: '',
                        status: 'AVAILABLE',
                        purchase_date: '',
                        warranty_expiry: '',
                        maintenance_schedule: '',
                        responsible_person: '',
                        responsible_person_id: '',
                        cost: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingResource ? 'Update Resource' : 'Create Resource'}
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

export default DepartmentResources;