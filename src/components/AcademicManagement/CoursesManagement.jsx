import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { departmentApiService } from '../../services/departmentApiService';

const COURSE_LEVELS = [
  { value: 'UG', label: 'Undergraduate' },
  { value: 'PG', label: 'Postgraduate' },
  { value: 'PHD', label: 'Doctorate' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICATE', label: 'Certificate' }
];
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaGraduationCap,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaChartBar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaUpload,
  FaCog,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBuilding
} from 'react-icons/fa';

const CoursesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]); // for prerequisites
  const [allPrograms, setAllPrograms] = useState([]);
  const [prereqFilter, setPrereqFilter] = useState('');

  // Helper function to find department name
  const getDepartmentName = (courseDepartment, departmentsData) => {
    console.log('getDepartmentName called with:', { courseDepartment, departmentsData });
    
    // Handle null/undefined department
    if (!courseDepartment) {
      return 'No Department';
    }
    
    // If courseDepartment is already an object with name, return it directly
    if (typeof courseDepartment === 'object' && courseDepartment.name) {
      console.log('Department is already an object with name:', courseDepartment.name);
      return courseDepartment.name;
    }
    
    // Handle string representations of department objects (like "202 - CSE-data-ecines")
    if (typeof courseDepartment === 'string') {
      // Try to extract department name from complex string format
      const match = courseDepartment.match(/(\d+)\s*-\s*(.+)/);
      if (match) {
        const [, id, name] = match;
        console.log('Extracted from string format:', { id, name });
        // Clean up the name (remove extra dashes and normalize)
        const cleanName = name.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        return cleanName;
      }
      
      // If it's a simple string, try to find it in departments data
      if (departmentsData?.results) {
        const department = departmentsData.results.find(d => 
          d.name === courseDepartment || 
          d.code === courseDepartment ||
          d.id === courseDepartment
        );
        if (department) {
          return department.name;
        }
      }
      
      // Return the string as-is if it looks like a department name
      return courseDepartment;
    }
    
    // If no departments data available, return fallback
    if (!departmentsData?.results || departmentsData.results.length === 0) {
      console.log('No departments data available');
      return typeof courseDepartment === 'string' ? courseDepartment : 'No Department';
    }
    
    console.log('Available departments:', departmentsData.results.map(d => ({ id: d.id, name: d.name, code: d.code })));
    
    // Extract the department ID from courseDepartment (could be object with id or direct value)
    const departmentId = courseDepartment?.id || courseDepartment;
    console.log('Looking for department ID:', departmentId);
    
    // Find department by ID (exact match)
    const department = departmentsData.results.find(d => {
      // Direct ID comparison
      if (d.id === departmentId) return true;
      
      // String comparison for flexibility
      if (String(d.id) === String(departmentId)) return true;
      
      // Handle legacy numeric IDs mapping to UUIDs
      if (typeof departmentId === 'number' || (typeof departmentId === 'string' && !isNaN(departmentId))) {
        const numericId = parseInt(departmentId);
        if (numericId === 1 && d.id === 'ebe4cdf1-0df4-44f0-a5d1-a43c5f5efbfb') return true; // CS
        if (numericId === 2 && d.id === '241bc58b-ab7f-4cea-9d16-60d53d597c67') return true; // Math
        if (numericId === 3 && d.id === '40cb2ad0-2027-4519-949c-af407c4326c1') return true; // Physics
        if (numericId === 4 && d.id === '37a530c7-ab12-42ab-937d-f17299bb8cd8') return true; // Chemistry
      }
      
      return false;
    });
    
    console.log('Found department:', department);
    
    // Return department name or fallback
    if (department) {
      return department.name;
    }
    
    // If no match found, return a clean fallback
    return 'Unknown Department';
  };

  // Helper function to get level display name
  const getLevelDisplayName = (level) => {
    return COURSE_LEVELS.find(l => l.value === level)?.label || level;
  };
  const [programFilter, setProgramFilter] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    level: 'UG',
    credits: '3',
    duration_weeks: '16',
    max_students: '50',
    department: '',
    status: 'ACTIVE'
  });

  const queryClient = useQueryClient();

  // Fetch courses
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm, statusFilter, levelFilter, departmentFilter],
    queryFn: () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (levelFilter) params.level = levelFilter;
      if (departmentFilter) params.department = departmentFilter;
      return academicApiService.getCourses(params);
    }
  });

  // Fetch departments for dropdown
  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await departmentApiService.getDepartments({ page_size: 100 });
        console.log('Departments API Response (Older Component):', response);
        console.log('Departments results (Older Component):', response.results);
        if (response.results && response.results.length > 0) {
          console.log('First department (Older Component):', response.results[0]);
        }
        return response;
      } catch (error) {
        console.error('Error fetching departments (Older Component):', error);
        return { results: [] };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load selectable references (courses for prerequisites, programs)
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [allCoursesRes, programsRes] = await Promise.all([
          academicApiService.getCourses({ page_size: 1000 }).catch(() => ({ results: [] })),
          fetch('/api/v1/academics/programs/').then(r => r.json()).catch(() => ({ results: [] }))
        ]);
        setAllCourses(allCoursesRes.results || []);
        setAllPrograms(programsRes.results || []);
      } catch (e) {
        console.error('Failed loading references', e);
      }
    };
    loadRefs();
  }, []);

  // Auto-open modal when ?add=1 present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === '1') setShowModal(true);
    } catch (_) {}
  }, []);

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      setShowModal(false);
      resetForm();
    }
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
    }
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      level: 'UG',
      credits: '3',
      duration_weeks: '16',
      max_students: '50',
      department: '',
      status: 'ACTIVE'
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description,
      credits: (course.credits ?? 3).toString(),
      level: course.level,
      duration_weeks: (course.duration_weeks ?? 16).toString(),
      max_students: (course.max_students ?? 50).toString(),
      department: course.department?.id || course.department || '',
      status: course.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      credits: parseInt(formData.credits),
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
      max_students: formData.max_students ? parseInt(formData.max_students) : null,
      department: formData.department || null
    };

    console.log('Submitting course data:', submitData);
    console.log('Department ID being sent:', submitData.department);
    console.log('Level being sent:', submitData.level);
    
    // Validate UUID format for department
    if (submitData.department && !submitData.department.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      alert('Invalid department ID format. Please select a valid department.');
      return;
    }
    
    // Validate level value
    const validLevels = ['UG', 'PG', 'PHD', 'DIPLOMA', 'CERTIFICATE'];
    if (!validLevels.includes(submitData.level)) {
      alert('Invalid level value. Please select a valid academic level.');
      return;
    }

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle different API response formats
  const courses = coursesData?.results || coursesData?.data || coursesData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaBook className="h-8 w-8 mr-3 text-blue-600" />
                Courses Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage academic courses, curriculum, and course details
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {COURSE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={departmentsLoading}
              >
                <option value="">All Departments</option>
                {(departmentsData?.results || []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setLevelFilter('');
                  setDepartmentFilter('');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-out"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                  course.status === 'ACTIVE' 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200'
                    : course.status === 'INACTIVE'
                    ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-200'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-yellow-200'
                }`}>
                  {course.status}
                </span>
              </div>

              <div className="relative p-8">
                {/* Course Header */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                      <FaBook className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                        {course.code}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                        <FaGraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Credits</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{course.credits}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                        <FaUsers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Level</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {getLevelDisplayName(course.level)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                        <FaBuilding className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg text-right max-w-[60%] truncate">
                      {getDepartmentName(course.department, departmentsData)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                      title="Edit course"
                    >
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                      title="Delete course"
                    >
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    title="View details"
                  >
                    View Details
                    <FaEye className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <FaBook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first course.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Course
            </button>
          </div>
        )}

        {/* Modern Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <FaBook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {editingCourse ? 'Update course information' : 'Create a new academic course'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FaInfoCircle className="h-4 w-4 text-blue-500 mr-2" />
                    Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., CS101, MATH201"
                    />
                  </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Academic Level *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {COURSE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Describe the course content, objectives, and learning outcomes..."
                    />
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FaCog className="h-4 w-4 text-green-500 mr-2" />
                    Course Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <FaBuilding className="h-4 w-4 text-blue-500 mr-2" />
                        Department *
                    </label>
                    <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={departmentsLoading}
                      >
                        <option value="">
                          {departmentsLoading ? 'Loading departments...' : 'Select Department'}
                        </option>
                        {(departmentsData?.results || []).map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                    </select>
                      {formData.department && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FaInfoCircle className="h-3 w-3 mr-1" />
                          <span>
                            Selected: {getDepartmentName(formData.department, departmentsData)}
                          </span>
                        </div>
                      )}
                  </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Credit Hours *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="3"
                    />
                        </div>
                      </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duration (Weeks)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="16"
                      />
                              </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Students
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_students}
                        onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="50"
                      />
                        </div>
                      </div>
                    </div>

                {/* Status */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FaCheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                    Status & Settings
                  </h4>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCourse(null);
                        resetForm();
                      }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      editingCourse ? 'Update Course' : 'Create Course'
                    )}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesManagement;
