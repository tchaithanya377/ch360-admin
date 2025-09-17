import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faPlus, faEdit, faTrash, faEye, faSearch, 
  faFilter, faDownload, faUpload, faUsers, faGraduationCap,
  faChartBar, faCog, faSave, faTimes, faCheck, faExclamationTriangle,
  faUniversity, faMapMarkerAlt, faPhone, faEnvelope, faGlobe,
  faCalendarAlt, faUserTie, faBook, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../services/departmentApiService';
import facultyApiService from '../services/facultyApiService';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_departments: 0,
    active_departments: 0,
    total_faculty: 0,
    total_students: 0,
    total_courses: 0
  });

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    code: '',
    description: '',
    status: 'active',
    
    // Contact Information
    head_of_department: '',
    head_of_department_id: '',
    head_of_department_email: '',
    email: '',
    phone: '',
    website: '',
    
    // Location Information
    building: '',
    floor: '',
    room_number: '',
    address: '',
    
    // Academic Information
    established_date: '',
    accreditation: '',
    programs_offered: [],
    
    // Resources
    budget: '',
    equipment: '',
    facilities: '',
    
    // Additional Information
    vision: '',
    mission: '',
    objectives: '',
    achievements: '',
    notes: ''
  });

  useEffect(() => {
    loadDepartments({ page, page_size: pageSize });
    loadStats();
    loadFaculty();
  }, []);

  // Refetch on filter/search/page changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDepartments({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        page_size: pageSize
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, page]);

  // Faculty list for HOD assignment
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState('');

  const loadFaculty = async () => {
    setFacultyLoading(true);
    try {
      const res = await facultyApiService.getFaculty();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.results)
          ? res.results
          : [];
      setFaculty(list);
    } catch (e) {
      setFacultyError(e.message || 'Failed to load faculty');
      setFaculty([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  const loadDepartments = async (params = {}) => {
    setLoading(true);
    try {
      const data = await departmentApiService.getDepartments(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setDepartments(normalized);
      const count = typeof data?.count === 'number' ? data.count : normalized.length;
      setTotalCount(count);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
      setDepartments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await departmentApiService.getDepartmentStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDepartment) {
        await departmentApiService.updateDepartment(editingDepartment.id, formData);
      } else {
        await departmentApiService.createDepartment(formData);
      }
      setShowModal(false);
      setEditingDepartment(null);
      resetForm();
      loadDepartments();
      loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      status: department.status || 'active',
      head_of_department: department.head_of_department || '',
      head_of_department_id: department.head_of_department_id || '',
      head_of_department_email: department.head_of_department_email || department.email || '',
      email: department.email || '',
      phone: department.phone || '',
      website: department.website || '',
      building: department.building || '',
      floor: department.floor || '',
      room_number: department.room_number || '',
      address: department.address || '',
      established_date: department.established_date || '',
      accreditation: department.accreditation || '',
      programs_offered: department.programs_offered || [],
      budget: department.budget || '',
      equipment: department.equipment || '',
      facilities: department.facilities || '',
      vision: department.vision || '',
      mission: department.mission || '',
      objectives: department.objectives || '',
      achievements: department.achievements || '',
      notes: department.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApiService.deleteDepartment(id);
        loadDepartments();
        loadStats();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'active',
      head_of_department: '',
      head_of_department_id: '',
      head_of_department_email: '',
      email: '',
      phone: '',
      website: '',
      building: '',
      floor: '',
      room_number: '',
      address: '',
      established_date: '',
      accreditation: '',
      programs_offered: [],
      budget: '',
      equipment: '',
      facilities: '',
      vision: '',
      mission: '',
      objectives: '',
      achievements: '',
      notes: ''
    });
  };

  const departmentList = Array.isArray(departments) ? departments : [];
  const filteredDepartments = departmentList.filter(dept => {
    const matchesSearch = dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.head_of_department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: faChartBar },
    { id: 'departments', name: 'Departments', icon: faBuilding },
    { id: 'analytics', name: 'Analytics', icon: faChartBar },
    { id: 'settings', name: 'Settings', icon: faCog }
  ];

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const getColorClasses = (color) => {
      const colorMap = {
        blue: {
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-600 dark:text-blue-400'
        },
        green: {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-600 dark:text-green-400'
        },
        purple: {
          bg: 'bg-purple-100 dark:bg-purple-900',
          text: 'text-purple-600 dark:text-purple-400'
        },
        orange: {
          bg: 'bg-orange-100 dark:bg-orange-900',
          text: 'text-orange-600 dark:text-orange-400'
        },
        indigo: {
          bg: 'bg-indigo-100 dark:bg-indigo-900',
          text: 'text-indigo-600 dark:text-indigo-400'
        }
      };
      return colorMap[color] || colorMap.blue;
    };

    const colorClasses = getColorClasses(color);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses.bg}`}>
            <FontAwesomeIcon icon={icon} className={`text-2xl ${colorClasses.text}`} />
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Departments" value={stats.total_departments} icon={faBuilding} color="blue" />
        <StatCard title="Active Departments" value={stats.active_departments} icon={faCheck} color="green" />
        <StatCard title="Total Faculty" value={stats.total_faculty} icon={faUserTie} color="purple" />
        <StatCard title="Total Students" value={stats.total_students} icon={faUsers} color="orange" />
        <StatCard title="Total Courses" value={stats.total_courses} icon={faBook} color="indigo" />
      </div>

      {/* Recent Departments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Departments</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {departments.slice(0, 5).map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FontAwesomeIcon icon={faBuilding} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{dept.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dept.code} • {dept.head_of_department}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dept.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {dept.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Department</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon icon={faDownload} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading && (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading departments...</div>
          )}
          {!loading && departmentList.length === 0 && (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No departments found.</div>
          )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Head of Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDepartments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                        <FontAwesomeIcon icon={faBuilding} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{dept.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {dept.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {dept.head_of_department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dept.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {totalCount ? page : 0} of {totalCount ? Math.ceil(totalCount / pageSize) : 0}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => (prev * pageSize < totalCount ? prev + 1 : prev))}
              disabled={page * pageSize >= totalCount}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h2>
            <button
              onClick={() => {
                setShowModal(false);
                setEditingDepartment(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-green-600" />
                Contact Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Head of Department
                </label>
                <select
                  name="head_of_department_id"
                  value={formData.head_of_department_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selected = faculty.find(f => String(f.id) === String(selectedId));
                    const name = selected
                      ? (selected.personalDetails?.fullName || selected.name || `${selected.firstName || ''} ${selected.lastName || ''}`.trim())
                      : '';
                    const email = selected
                      ? (selected.contactDetails?.email || selected.email || '')
                      : '';
                    setFormData(prev => ({
                      ...prev,
                      head_of_department_id: selectedId,
                      head_of_department: name,
                      head_of_department_email: email
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{facultyLoading ? 'Loading faculty...' : 'Select faculty as HOD'}</option>
                  {faculty.map(f => {
                    const name = f.personalDetails?.fullName || f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim();
                    const email = f.contactDetails?.email || f.email || '';
                    return (
                      <option key={f.id} value={f.id}>
                        {name}{email ? ` — ${email}` : ''}
                      </option>
                    );
                  })}
                </select>
                {facultyError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{facultyError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HOD Email
                </label>
                <input
                  type="email"
                  name="head_of_department_email"
                  value={formData.head_of_department_email}
                  onChange={handleInputChange}
                  placeholder="Auto-filled when you select faculty"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-600" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-purple-600" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Established Date
                </label>
                <input
                  type="date"
                  name="established_date"
                  value={formData.established_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accreditation
                </label>
                <input
                  type="text"
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Vision and Mission */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <FontAwesomeIcon icon={faUniversity} className="mr-2 text-indigo-600" />
              Vision & Mission
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vision
                </label>
                <textarea
                  name="vision"
                  value={formData.vision}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mission
                </label>
                <textarea
                  name="mission"
                  value={formData.mission}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingDepartment(null);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>{editingDepartment ? 'Update' : 'Create'} Department</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FontAwesomeIcon icon={faBuilding} className="mr-3 text-blue-600" />
                Department Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage university departments, faculty, and academic programs
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'departments' && renderDepartments()}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Analytics features coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Settings features coming soon...</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && renderModal()}
      </div>
    </div>
  );
};

export default DepartmentManagement;
