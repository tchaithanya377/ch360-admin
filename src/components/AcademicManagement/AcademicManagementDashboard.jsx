import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { 
  FaBook, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers,
  FaGraduationCap,
  FaFileAlt,
  FaChartBar,
  FaCogs,
  FaCheckCircle,
  FaPlus,
  FaArrowRight,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaBell,
  FaUserGraduate,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle as FaCheck,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaUserPlus
} from 'react-icons/fa';

const AcademicManagementDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const navigate = useNavigate();

  // Fetch dynamic data from backend
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses-dashboard'],
    queryFn: () => academicApiService.getCourses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: syllabiData, isLoading: syllabiLoading } = useQuery({
    queryKey: ['syllabi-dashboard'],
    queryFn: () => academicApiService.getSyllabi(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments-dashboard'],
    queryFn: () => academicApiService.getEnrollments(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: timetablesData, isLoading: timetablesLoading } = useQuery({
    queryKey: ['timetables-dashboard'],
    queryFn: () => academicApiService.getTimetables(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['calendar-dashboard'],
    queryFn: () => academicApiService.getAcademicCalendar(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: batchEnrollmentsData, isLoading: batchEnrollmentsLoading } = useQuery({
    queryKey: ['batch-enrollments-dashboard'],
    queryFn: () => academicApiService.getBatchEnrollments(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: prerequisitesData, isLoading: prerequisitesLoading } = useQuery({
    queryKey: ['prerequisites-dashboard'],
    queryFn: () => academicApiService.getCoursePrerequisites(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: courseSectionsData, isLoading: courseSectionsLoading } = useQuery({
    queryKey: ['course-sections-dashboard'],
    queryFn: () => academicApiService.getCourseSections(),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate dynamic statistics
  const stats = {
    totalCourses: coursesData?.results?.length || 0,
    activeSyllabi: syllabiData?.results?.filter(s => s.status === 'PUBLISHED')?.length || 0,
    enrolledStudents: enrollmentsData?.results?.filter(e => e.status === 'ENROLLED')?.length || 0,
    scheduledClasses: timetablesData?.results?.length || 0,
    totalBatchEnrollments: batchEnrollmentsData?.results?.length || 0,
    activeBatchEnrollments: batchEnrollmentsData?.results?.filter(be => be.is_active)?.length || 0,
    totalPrerequisites: prerequisitesData?.results?.length || 0,
    mandatoryPrerequisites: prerequisitesData?.results?.filter(p => p.is_mandatory)?.length || 0,
    totalCourseSections: courseSectionsData?.results?.length || 0,
    activeCourseSections: courseSectionsData?.results?.filter(cs => cs.is_active)?.length || 0,
    upcomingEvents: calendarData?.results?.filter(e => new Date(e.start_date) > new Date())?.length || 0,
  };

  // Essential modules only - focusing on most used features
  const essentialModules = [
    {
      id: 'courses',
      title: 'Courses',
      description: 'Manage academic courses and curriculum',
      icon: FaBook,
      path: '/academic-management/courses',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      stats: { 
        total: stats.totalCourses, 
        active: coursesData?.results?.filter(c => c.status === 'ACTIVE')?.length || 0 
      },
      priority: 'high'
    },
    {
      id: 'enrollments',
      title: 'Enrollments',
      description: 'Student course registrations',
      icon: FaUserGraduate,
      path: '/academic-management/enrollments',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      stats: { 
        total: enrollmentsData?.results?.length || 0, 
        active: stats.enrolledStudents 
      },
      priority: 'high'
    },
    {
      id: 'batch-enrollments',
      title: 'Batch Enrollments',
      description: 'Bulk student enrollments',
      icon: FaUsers,
      path: '/academic-management/batch-enrollments',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      stats: { 
        total: stats.totalBatchEnrollments, 
        active: stats.activeBatchEnrollments 
      },
      priority: 'high'
    },
    {
      id: 'timetables',
      title: 'Timetables',
      description: 'Class schedules and time slots',
      icon: FaClock,
      path: '/academic-management/timetables',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      stats: { 
        total: stats.scheduledClasses, 
        active: stats.scheduledClasses 
      },
      priority: 'medium'
    },
    {
      id: 'academic-calendar',
      title: 'Academic Calendar',
      description: 'Events and important dates',
      icon: FaCalendarAlt,
      path: '/academic-management/academic-calendar',
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      stats: { 
        total: calendarData?.results?.length || 0, 
        active: stats.upcomingEvents 
      },
      priority: 'medium'
    },
    {
      id: 'course-prerequisites',
      title: 'Prerequisites',
      description: 'Course requirements and dependencies',
      icon: FaCheckCircle,
      path: '/academic-management/course-prerequisites',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      stats: { 
        total: stats.totalPrerequisites, 
        active: stats.mandatoryPrerequisites 
      },
      priority: 'low'
    }
  ];

  // Quick actions - most common tasks
  const quickActions = [
    {
      title: 'Add Course',
      description: 'Create new course',
      action: () => navigate('/academic-management/courses?add=1'),
      icon: FaPlus,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
    },
    {
      title: 'Enroll Students',
      description: 'Batch enrollment',
      action: () => navigate('/academic-management/batch-enrollments'),
      icon: FaUserPlus,
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
    },
    {
      title: 'Schedule Classes',
      description: 'Create timetable',
      action: () => navigate('/academic-management/timetables?add=1'),
      icon: FaCalendarAlt,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
    },
    {
      title: 'View Analytics',
      description: 'Performance insights',
      action: () => navigate('/academic-management/analytics'),
      icon: FaChartBar,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
    }
  ];

  // Filter modules based on search
  const filteredModules = essentialModules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group modules by priority
  const highPriorityModules = filteredModules.filter(m => m.priority === 'high');
  const mediumPriorityModules = filteredModules.filter(m => m.priority === 'medium');
  const lowPriorityModules = filteredModules.filter(m => m.priority === 'low');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Academic Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Streamline your academic operations with powerful management tools
              </p>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="current">Current Period</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <FaArrowUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                <FaBook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Enrollments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.enrolledStudents}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <FaArrowUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                <FaUserGraduate className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Batch Enrollments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBatchEnrollments}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                  <FaMinus className="h-3 w-3 mr-1" />
                  No change
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                <FaUsers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                  <FaBell className="h-3 w-3 mr-1" />
                  This week
              </p>
            </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
                <FaCalendarAlt className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <Link 
              to="/academic-management/analytics" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center group"
            >
              View Analytics <FaArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left hover:scale-105"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Academic Modules - Priority Based */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Modules</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredModules.length} modules
              </span>
            </div>
          </div>
          
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No modules found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* High Priority Modules */}
              {highPriorityModules.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                    Essential Modules
                  </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {highPriorityModules.map((module) => (
              <Link
                key={module.id}
                to={module.path}
                        className="group block p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105"
              >
                        <div className="flex items-start justify-between">
                <div className="flex items-start">
                            <div className={`p-3 rounded-xl ${module.color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </h3>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {module.description}
                    </p>
                              <div className="mt-3 flex items-center space-x-4 text-xs">
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaCheck className="h-3 w-3 mr-1 text-green-500" />
                                  {module.stats.active} active
                                </span>
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaClipboardList className="h-3 w-3 mr-1" />
                                  {module.stats.total} total
                                </span>
                      </div>
                    </div>
                  </div>
                          <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200">
                            <FaArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
              )}

              {/* Medium Priority Modules */}
              {mediumPriorityModules.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaClipboardList className="h-4 w-4 text-orange-500 mr-2" />
                    Management Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mediumPriorityModules.map((module) => (
                      <Link
                        key={module.id}
                        to={module.path}
                        className="group block p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className={`p-3 rounded-xl ${module.color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                              <module.icon className="h-6 w-6 text-white" />
              </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {module.description}
                              </p>
                              <div className="mt-3 flex items-center space-x-4 text-xs">
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaCheck className="h-3 w-3 mr-1 text-green-500" />
                                  {module.stats.active} active
                                </span>
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaClipboardList className="h-3 w-3 mr-1" />
                                  {module.stats.total} total
                                </span>
              </div>
            </div>
          </div>
                          <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200">
                            <FaArrowRight className="h-4 w-4" />
              </div>
            </div>
                      </Link>
                    ))}
              </div>
            </div>
              )}

              {/* Low Priority Modules */}
              {lowPriorityModules.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaBook className="h-4 w-4 text-gray-500 mr-2" />
                    Additional Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lowPriorityModules.map((module) => (
                      <Link
                        key={module.id}
                        to={module.path}
                        className="group block p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className={`p-3 rounded-xl ${module.color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                              <module.icon className="h-6 w-6 text-white" />
              </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {module.description}
                              </p>
                              <div className="mt-3 flex items-center space-x-4 text-xs">
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaCheck className="h-3 w-3 mr-1 text-green-500" />
                                  {module.stats.active} active
                                </span>
                                <span className="flex items-center text-gray-500 dark:text-gray-400">
                                  <FaClipboardList className="h-3 w-3 mr-1" />
                                  {module.stats.total} total
                                </span>
              </div>
            </div>
          </div>
                          <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200">
                            <FaArrowRight className="h-4 w-4" />
        </div>
                    </div>
                      </Link>
                    ))}
                    </div>
                  </div>
              )}
                </div>
              )}
            </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FaBell className="h-5 w-5 text-blue-500 mr-2" />
                Recent Activity
              </h3>
          </div>
            <div className="p-6">
            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <FaBook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New course "Advanced Mathematics" created
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <FaUsers className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      25 students enrolled in "Computer Science 101"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
            </div>
          </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                    <FaCalendarAlt className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Mid-term exam scheduled for next week
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* System Status */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-orange-500 mr-2" />
                System Status
              </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <FaExclamationTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Course capacity warning
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      "Data Structures" is at 95% capacity
                    </p>
                    </div>
                  </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                    <FaTimesCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Prerequisites not met
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      3 students need prerequisite completion
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <FaCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      System running optimally
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      All modules are functioning properly
                    </p>
                  </div>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicManagementDashboard;
