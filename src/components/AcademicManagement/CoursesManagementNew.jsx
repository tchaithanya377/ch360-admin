import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { departmentApiService } from '../../services/departmentApiService';
import { programsApiService } from '../../services/programsApiService';

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
  const [allCourses, setAllCourses] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);

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
  const [prereqFilter, setPrereqFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
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
    programs: [],
    status: 'ACTIVE'
  });

  const queryClient = useQueryClient();

  // Fetch courses with better error handling
  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', searchTerm, statusFilter, levelFilter, departmentFilter],
    queryFn: async () => {
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (levelFilter) params.level = levelFilter;
        if (departmentFilter) params.department = departmentFilter;
        
        const response = await academicApiService.getCourses(params);
        console.log('Courses API Response:', response); // Debug log
        if (response.results && response.results.length > 0) {
          console.log('First course:', response.results[0]);
          console.log('First course department:', response.results[0].department);
          console.log('First course level:', response.results[0].level);
          console.log('All courses with departments:', response.results.map(c => ({ 
            title: c.title, 
            department: c.department, 
            departmentType: typeof c.department,
            departmentId: c.department?.id || c.department
          })));
        }
        return response;
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Return mock data for development
        return {
          results: [
            {
              id: 1,
              code: 'CS101',
              title: 'Introduction to Computer Science',
              description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
              level: 'UG',
              credits: 3,
              duration_weeks: 16,
              max_students: 50,
              department: 'ebe4cdf1-0df4-44f0-a5d1-a43c5f5efbfb', // Computer Science UUID
              status: 'ACTIVE'
            },
            {
              id: 2,
              code: 'MATH201',
              title: 'Calculus I',
              description: 'Introduction to differential and integral calculus with applications.',
              level: 'UG',
              credits: 4,
              duration_weeks: 16,
              max_students: 40,
              department: '241bc58b-ab7f-4cea-9d16-60d53d597c67', // Mathematics UUID
              status: 'ACTIVE'
            },
            {
              id: 3,
              code: 'PHYS101',
              title: 'General Physics',
              description: 'Introduction to mechanics, thermodynamics, and waves.',
              level: 'UG',
              credits: 4,
              duration_weeks: 16,
              max_students: 45,
              department: '40cb2ad0-2027-4519-949c-af407c4326c1', // Physics UUID
              status: 'ACTIVE'
            }
          ],
          count: 3
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch departments for dropdown
  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await departmentApiService.getDepartments({ page_size: 100 });
        console.log('Departments API Response:', response); // Debug log
        console.log('Departments results:', response.results); // Debug log
        if (response.results && response.results.length > 0) {
          console.log('First department:', response.results[0]); // Debug log
          console.log('All department IDs:', response.results.map(d => ({ id: d.id, name: d.name, code: d.code })));
        }
        return response;
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Return mock data for development with valid UUIDs
        const mockDepartments = {
          results: [
            { id: 'ebe4cdf1-0df4-44f0-a5d1-a43c5f5efbfb', name: 'Computer Science', code: 'CS' },
            { id: '241bc58b-ab7f-4cea-9d16-60d53d597c67', name: 'Mathematics', code: 'MATH' },
            { id: '40cb2ad0-2027-4519-949c-af407c4326c1', name: 'Physics', code: 'PHYS' },
            { id: '37a530c7-ab12-42ab-937d-f17299bb8cd8', name: 'Chemistry', code: 'CHEM' }
          ]
        };
        console.log('Using mock departments:', mockDepartments);
        return mockDepartments;
      }
    },
    staleTime: 0, // Force refresh for debugging
  });

  // Fetch programs for dropdown
  const { data: programsData, isLoading: programsLoading, error: programsError } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      console.log('Fetching programs...');
      try {
        const response = await programsApiService.getPrograms({ page_size: 100 });
        console.log('Programs API Response:', response); // Debug log
        
        // If API returns empty results, use mock data
        if (!response.results || response.results.length === 0) {
          console.log('API returned empty results, using mock data');
          const mockData = {
            results: programsApiService.getMockProgramsData()
          };
          console.log('Using mock programs data:', mockData);
          return mockData;
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching programs:', error);
        // Return mock data for development
        const mockData = {
          results: programsApiService.getMockProgramsData()
        };
        console.log('Using mock programs data:', mockData);
        return mockData;
      }
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createCourse(data),
    onSuccess: (response) => {
      console.log('Course created successfully:', response);
      queryClient.invalidateQueries(['courses']);
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating course:', error);
      
      // Show more user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('Validation errors:')) {
        errorMessage = `Please check the form fields:\n${error.message.replace('Validation errors: ', '')}`;
      } else if (error.message.includes('400')) {
        errorMessage = 'Please check that all required fields are filled correctly and try again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to create courses.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      alert(`Error creating course:\n${errorMessage}`);
    }
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateCourse(id, data),
    onSuccess: (response) => {
      console.log('Course updated successfully:', response);
      queryClient.invalidateQueries(['courses']);
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating course:', error);
      
      // Show more user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('Validation errors:')) {
        errorMessage = `Please check the form fields:\n${error.message.replace('Validation errors: ', '')}`;
      } else if (error.message.includes('400')) {
        errorMessage = 'Please check that all required fields are filled correctly and try again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to update courses.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      alert(`Error updating course:\n${errorMessage}`);
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
      programs: [],
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
      programs: course.programs || [],
      status: course.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.code.trim()) {
      alert('Please enter a course code.');
      return;
    }
    if (!formData.title.trim()) {
      alert('Please enter a course title.');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a course description.');
      return;
    }
    if (!formData.department) {
      alert('Please select a department.');
      return;
    }
    if (!formData.programs || formData.programs.length === 0) {
      alert('Please select at least one program.');
      return;
    }
    
    // Clean and validate form data
    const submitData = {
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      level: formData.level,
      credits: parseInt(formData.credits),
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
      max_students: formData.max_students ? parseInt(formData.max_students) : null,
      department: formData.department || null,
      programs: formData.programs,
      status: formData.status
    };

    // Remove null/undefined values that might cause issues, but keep programs array
    Object.keys(submitData).forEach(key => {
      if (key !== 'programs' && (submitData[key] === null || submitData[key] === undefined || submitData[key] === '')) {
        delete submitData[key];
      }
    });

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
      console.log('Updating course:', editingCourse.id);
      updateMutation.mutate({ id: editingCourse.id, data: submitData });
    } else {
      console.log('Creating new course');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 max-w-md mx-auto">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading courses</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <FaBook className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Courses Management
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                  Manage academic courses, curriculum, and course details
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus className="h-5 w-5 mr-2" />
              <span className="font-medium">Add Course</span>
            </button>
          </div>
        </div>

        {/* Modern Filters Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FaFilter className="h-5 w-5 text-blue-500 mr-2" />
              Filters & Search
            </h2>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setLevelFilter('');
                setDepartmentFilter('');
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FaFilter className="h-4 w-4 mr-2" />
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Search by title, code, or description..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Levels</option>
                {COURSE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                      onClick={() => {/* Navigate to course details */}}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      View Details
                      <FaEye className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Modern Empty State */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
              <FaBook className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter || levelFilter || departmentFilter 
                ? "No courses match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first course to build your academic curriculum."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FaPlus className="h-5 w-5 mr-2" />
                Create First Course
              </button>
              {(searchTerm || statusFilter || levelFilter || departmentFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setLevelFilter('');
                    setDepartmentFilter('');
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <FaFilter className="h-5 w-5 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
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
                        Programs *
                      </label>
                      <select
                        multiple
                        required
                        value={formData.programs}
                        onChange={(e) => {
                          const selectedPrograms = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, programs: selectedPrograms });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        size="4"
                        disabled={programsLoading}
                      >
                        <option value="" disabled>
                          {programsLoading ? 'Loading programs...' : 'Select Programs'}
                        </option>
                        {(programsData?.results || []).map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name} ({program.code})
                          </option>
                        ))}
                        {/* Fallback options if no data */}
                        {(!programsData?.results || programsData.results.length === 0) && !programsLoading && (
                          <>
                            <option value="1">B.Tech Computer Science (Mock)</option>
                            <option value="2">B.Tech Information Technology (Mock)</option>
                            <option value="3">M.Tech Computer Science (Mock)</option>
                          </>
                        )}
                      </select>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaInfoCircle className="h-3 w-3 mr-1" />
                        <span>Hold Ctrl/Cmd to select multiple programs</span>
                      </div>
                      {formData.programs && formData.programs.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Selected Programs:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {formData.programs.map((programId) => {
                              const program = (programsData?.results || []).find(p => p.id == programId);
                              return program ? (
                                <span
                                  key={programId}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {program.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedPrograms = formData.programs.filter(id => id != programId);
                                      setFormData({ ...formData, programs: updatedPrograms });
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
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
