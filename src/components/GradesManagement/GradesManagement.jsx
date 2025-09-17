import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faChartLine,
  faFileAlt,
  faCalculator,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faUserGraduate,
  faChartBar,
  faCalendarAlt,
  faDownload,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faArrowRight,
  faCog,
  faBell,
  faSearch,
  faFilter,
  faShieldAlt,
  faUserShield,
  faHistory,
  faLock,
  faUnlock,
  faTimes,
  faUpload,
  faHome,
  faTrophy,
  faBookOpen,
  faUsers,
  faClipboardList,
  faFileSignature,
  faChartPie,
  faCalendarCheck,
  faCloudUploadAlt,
  faSpinner,
  faRefresh,
  faInfoCircle,
  faExclamationCircle,
  faCheckCircle as faCheck,
  faTimes as faClose
} from '@fortawesome/free-solid-svg-icons';
import { Link, Routes, Route } from 'react-router-dom';
import { handleError, logError } from '../../utils/djangoErrorHandler';
import { useDjangoAuth } from '../../contexts/DjangoAuthContext';
import djangoAuthService from '../../utils/djangoAuthService';
import GradesApiService from '../../services/gradesApiService';
import './GradesManagement.css';

// Import modern sub-components
import GradeEntryForm from './GradeEntryForm';
import GPADisplay from './GPADisplay';
import BulkGradeEntry from './BulkGradeEntry';

const GradesManagement = () => {
  const { user, isAuthenticated, token } = useDjangoAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Initialize API service with auth service for token refresh
  const [gradesService] = useState(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    return new GradesApiService(baseURL, token, djangoAuthService);
  });
  
  // Enhanced state management for comprehensive workflow
  const [userRole, setUserRole] = useState('faculty'); // faculty, hod, controller, registrar, admin, student
  const [currentSemester, setCurrentSemester] = useState('2024-1');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [auditLog, setAuditLog] = useState([]);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [workflowStates, setWorkflowStates] = useState({
    marksEntry: 'draft', // draft, submitted, under_moderation, approved, published
    moderation: 'pending', // pending, in_review, approved, rejected
    publication: 'draft', // draft, scheduled, published, archived
    revaluation: 'open' // open, closed, under_review, completed
  });

  // Enhanced statistics with real-time data
  const [gradesStats, setGradesStats] = useState({
    totalMidtermGrades: 0,
    totalSemesterGrades: 0,
    totalSGPAs: 0,
    totalCGPAs: 0,
    averageCGPA: 0,
    passRate: 0,
    gradeDistribution: {},
    totalGradeScales: 0,
    pendingGrades: 0,
    completedGrades: 0
  });

  // Core entities data structure with Django API integration
  const [coreEntities, setCoreEntities] = useState({
    gradeScales: [],
    midtermGrades: [],
    semesterGrades: [],
    sgpas: [],
    cgpas: [],
    academicTranscripts: []
  });

  // Business rules and validation state
  const [businessRules, setBusinessRules] = useState({
    gradeWeights: {
      internal: 30,
      midSemester: 20,
      endSemester: 50
    },
    passingCriteria: {
      perCourse: 40,
      aggregate: 50,
      minimumAttendance: 75
    },
    gradingScheme: {
      type: '10-point',
      boundaries: {
        'A+': { min: 90, max: 100, points: 10 },
        'A': { min: 80, max: 89, points: 9 },
        'B+': { min: 70, max: 79, points: 8 },
        'B': { min: 60, max: 69, points: 7 },
        'C+': { min: 50, max: 59, points: 6 },
        'C': { min: 40, max: 49, points: 5 },
        'D': { min: 35, max: 39, points: 4 },
        'F': { min: 0, max: 34, points: 0 }
      }
    },
    specialFlags: {
      'AB': 'Absent',
      'MALP': 'Malpractice',
      'INC': 'Incomplete',
      'W': 'Withdrawn'
    }
  });

  // Role-based permissions
  const [permissions, setPermissions] = useState({
    faculty: {
      canEnterMarks: true,
      canViewOwnCourses: true,
      canSubmitForModeration: true,
      canRequestGradeChange: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    },
    hod: {
      canEnterMarks: true,
      canViewDepartmentCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: false,
      canManageRevaluation: true,
      canGenerateTranscripts: false
    },
    controller: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    registrar: {
      canEnterMarks: false,
      canViewAllCourses: true,
      canModerateResults: false,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: false,
      canGenerateTranscripts: true
    },
    admin: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    student: {
      canEnterMarks: false,
      canViewOwnResults: true,
      canApplyRevaluation: true,
      canDownloadTranscripts: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    }
  });

  // Modern API data fetching functions
  const fetchGradeScales = async () => {
    try {
      const gradeScales = await gradesService.getGradeScales();
      setCoreEntities(prev => ({ ...prev, gradeScales: gradeScales.results || gradeScales }));
      console.log('Grade scales loaded successfully from API');
    } catch (error) {
      console.error('Error fetching grade scales:', error);
      // Set default grade scales for Indian 10-point system as fallback
      const defaultGradeScales = [
        { letter: 'O', description: 'Outstanding', min_score: 90, max_score: 100, grade_points: 10, is_active: true },
        { letter: 'A+', description: 'Excellent', min_score: 80, max_score: 89, grade_points: 9, is_active: true },
        { letter: 'A', description: 'Very Good', min_score: 70, max_score: 79, grade_points: 8, is_active: true },
        { letter: 'B+', description: 'Good', min_score: 60, max_score: 69, grade_points: 7, is_active: true },
        { letter: 'B', description: 'Above Average', min_score: 50, max_score: 59, grade_points: 6, is_active: true },
        { letter: 'C', description: 'Average', min_score: 40, max_score: 49, grade_points: 5, is_active: true },
        { letter: 'P', description: 'Pass', min_score: 35, max_score: 39, grade_points: 4, is_active: true },
        { letter: 'F', description: 'Fail', min_score: 0, max_score: 34, grade_points: 0, is_active: true }
      ];
      setCoreEntities(prev => ({ ...prev, gradeScales: defaultGradeScales }));
    }
  };

  const fetchMidtermGrades = async () => {
    try {
      const midtermGrades = await gradesService.getMidtermGrades();
      setCoreEntities(prev => ({ ...prev, midtermGrades: midtermGrades.results || midtermGrades }));
      console.log('Midterm grades loaded successfully from API');
    } catch (error) {
      console.error('Error fetching midterm grades:', error);
      setCoreEntities(prev => ({ ...prev, midtermGrades: [] }));
    }
  };

  const fetchSemesterGrades = async () => {
    try {
      const semesterGrades = await gradesService.getSemesterGrades();
      setCoreEntities(prev => ({ ...prev, semesterGrades: semesterGrades.results || semesterGrades }));
      console.log('Semester grades loaded successfully from API');
    } catch (error) {
      console.error('Error fetching semester grades:', error);
      setCoreEntities(prev => ({ ...prev, semesterGrades: [] }));
    }
  };

  const fetchSGPAs = async () => {
    try {
      const sgpas = await gradesService.getSGPAs();
      setCoreEntities(prev => ({ ...prev, sgpas: sgpas.results || sgpas }));
      console.log('SGPAs loaded successfully from API');
    } catch (error) {
      console.error('Error fetching SGPAs:', error);
      setCoreEntities(prev => ({ ...prev, sgpas: [] }));
    }
  };

  const fetchCGPAs = async () => {
    try {
      const cgpas = await gradesService.getCGPAs();
      setCoreEntities(prev => ({ ...prev, cgpas: cgpas.results || cgpas }));
      console.log('CGPAs loaded successfully from API');
    } catch (error) {
      console.error('Error fetching CGPAs:', error);
      setCoreEntities(prev => ({ ...prev, cgpas: [] }));
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const health = await gradesService.healthCheck();
      console.log('Grades API Health:', health);
      return { success: true, data: health };
    } catch (error) {
      console.error('Grades API Health Check Failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if grades API endpoints are available
  const checkGradesApiAvailability = async () => {
    try {
      // Try to access a simple endpoint to check if the grades API is implemented
      const response = await fetch(`${gradesService.baseURL}/api/v1/grads/grade-scales/`, {
        method: 'GET',
        headers: gradesService.getHeaders()
      });
      
      if (response.status === 404) {
        console.log('Grades API endpoints not implemented yet - using demo mode');
        return false;
      } else if (response.status === 500) {
        console.log('Grades API has server errors - using demo mode');
        return false;
      } else if (response.ok) {
        console.log('Grades API is available and working');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Grades API not available - using demo mode');
      return false;
    }
  };

  // Calculate statistics from fetched data
  const calculateStats = () => {
    const { midtermGrades, semesterGrades, sgpas, cgpas, gradeScales } = coreEntities;
    
    const totalMidtermGrades = midtermGrades.length;
    const totalSemesterGrades = semesterGrades.length;
    const totalSGPAs = sgpas.length;
    const totalCGPAs = cgpas.length;
    
    // Calculate average CGPA
    const validCGPAs = cgpas.filter(cgpa => cgpa.cgpa && cgpa.cgpa > 0);
    const averageCGPA = validCGPAs.length > 0 
      ? validCGPAs.reduce((sum, cgpa) => sum + cgpa.cgpa, 0) / validCGPAs.length 
      : 0;
    
    // Calculate pass rate from semester grades
    const passedGrades = semesterGrades.filter(grade => 
      grade.grade && !['F', 'AB', 'FAIL'].includes(grade.grade.toUpperCase())
    ).length;
    const passRate = semesterGrades.length > 0 ? (passedGrades / semesterGrades.length) * 100 : 0;
    
    // Calculate grade distribution
    const gradeDistribution = gradeScales.reduce((acc, scale) => {
      const count = semesterGrades.filter(grade => grade.grade === scale.letter).length;
      acc[scale.letter] = count;
      return acc;
    }, {});

    setGradesStats({
      totalMidtermGrades,
      totalSemesterGrades,
      totalSGPAs,
      totalCGPAs,
      averageCGPA: parseFloat(averageCGPA.toFixed(2)),
      passRate: parseFloat(passRate.toFixed(2)),
      gradeDistribution,
      totalGradeScales: gradeScales.length,
      pendingGrades: semesterGrades.filter(grade => !grade.grade).length,
      completedGrades: semesterGrades.filter(grade => grade.grade).length
    });
  };

  // Audit logging function
  const logAuditEvent = async (entity, entityId, action, details = {}) => {
    try {
      const auditData = {
        entity,
        entityId,
        action,
        userId: user?.id || 'system',
        userEmail: user?.email || 'system',
        timestamp: new Date().toISOString(),
        details,
        ipAddress: 'client-side',
        userAgent: navigator.userAgent
      };

      // TODO: Implement audit logging API call to Django backend
      // For now, just update local audit log
      const newAuditEntry = {
        id: Date.now().toString(),
        ...auditData,
        timestamp: new Date()
      };
      setAuditLog(prev => [newAuditEntry, ...prev.slice(0, 99)]);
      
      console.log(`Audit log created for ${action}`);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Check if grades API is available
        const available = await checkGradesApiAvailability();
        setIsApiAvailable(available);
        
        if (available) {
          // API is available, fetch real data
          console.log('Loading data from Django API...');
        await Promise.all([
            fetchGradeScales(),
            fetchMidtermGrades(),
            fetchSemesterGrades(),
            fetchSGPAs(),
            fetchCGPAs()
          ]);
          console.log('Grades Management System loaded successfully');
        } else {
          // API not available, use demo data
          console.log('Using demo data - Grades API not implemented yet');
          const defaultGradeScales = [
            { letter: 'O', description: 'Outstanding', min_score: 90, max_score: 100, grade_points: 10, is_active: true },
            { letter: 'A+', description: 'Excellent', min_score: 80, max_score: 89, grade_points: 9, is_active: true },
            { letter: 'A', description: 'Very Good', min_score: 70, max_score: 79, grade_points: 8, is_active: true },
            { letter: 'B+', description: 'Good', min_score: 60, max_score: 69, grade_points: 7, is_active: true },
            { letter: 'B', description: 'Above Average', min_score: 50, max_score: 59, grade_points: 6, is_active: true },
            { letter: 'C', description: 'Average', min_score: 40, max_score: 49, grade_points: 5, is_active: true },
            { letter: 'P', description: 'Pass', min_score: 35, max_score: 39, grade_points: 4, is_active: true },
            { letter: 'F', description: 'Fail', min_score: 0, max_score: 34, grade_points: 0, is_active: true }
          ];
          
          setCoreEntities({
            gradeScales: defaultGradeScales,
            midtermGrades: [],
            semesterGrades: [],
            sgpas: [],
            cgpas: [],
            academicTranscripts: []
          });
          
          console.log('Grades Management System loaded in demo mode - API not implemented yet');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
        console.error('Failed to initialize Grades Management System');
      }
    };

    initializeData();
  }, [isAuthenticated, token]);

  // Recalculate stats when core entities change
  useEffect(() => {
    calculateStats();
  }, [coreEntities]);

  // Get user role from Django Auth
  useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      // Use the first role as the primary role, or determine based on permissions
      const primaryRole = user.roles[0] || 'faculty';
      setUserRole(primaryRole);
    } else if (user) {
      // Fallback to a default role if no roles are specified
      setUserRole('faculty');
    }
  }, [user]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'exam_scheduled',
      title: 'Mid-Semester Exam Scheduled',
      description: 'CS301 - Data Structures scheduled for 15th March',
      timestamp: '2024-03-10T10:30:00',
      status: 'scheduled',
      user: 'Dr. Smith',
      department: 'Computer Science'
    },
    {
      id: 2,
      type: 'marks_entered',
      title: 'Marks Entry Completed',
      description: 'CS302 - Computer Networks marks entered for 45 students',
      timestamp: '2024-03-10T09:15:00',
      status: 'completed',
      user: 'Dr. Johnson',
      department: 'Computer Science'
    },
    {
      id: 3,
      type: 'results_published',
      title: 'Semester Results Published',
      description: '3rd Semester results published for all departments',
      timestamp: '2024-03-09T16:45:00',
      status: 'published',
      user: 'Controller of Examinations',
      department: 'All Departments'
    }
  ]);

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    logAuditEvent('grades_management', 'tab_navigation', 'tab_changed', { 
      from: activeTab, 
      to: tab 
    });
  };

  // Modern navigation items with icons and descriptions
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: faHome, 
      description: 'Overview and quick actions',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      badge: null
    },
    { 
      id: 'grade-scales', 
      label: 'Grade Scales', 
      icon: faChartBar, 
      description: 'Manage grading criteria',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      badge: gradesStats.totalGradeScales
    },
    { 
      id: 'midterm-grades', 
      label: 'Midterm Grades', 
      icon: faEdit, 
      description: 'Enter midterm assessments',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      badge: gradesStats.totalMidtermGrades
    },
    { 
      id: 'semester-grades', 
      label: 'Semester Grades', 
      icon: faCalculator, 
      description: 'Manage final grades',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      badge: gradesStats.totalSemesterGrades
    },
    { 
      id: 'sgpa-cgpa', 
      label: 'SGPA/CGPA', 
      icon: faTrophy, 
      description: 'View academic performance',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      badge: gradesStats.totalSGPAs
    },
    { 
      id: 'transcripts', 
      label: 'Transcripts', 
      icon: faDownload, 
      description: 'Generate academic transcripts',
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      badge: null
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: faChartPie, 
      description: 'View detailed analytics',
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      badge: null
    },
    { 
      id: 'bulk-upload', 
      label: 'Bulk Upload', 
      icon: faCloudUploadAlt, 
      description: 'Upload grades in bulk',
      color: 'bg-gradient-to-r from-gray-500 to-gray-600',
      badge: null
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 text-3xl" />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Loading Grades Management System...</p>
          <p className="mt-2 text-gray-500">Please wait while we initialize your dashboard</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faGraduationCap} className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Grades Management System
                </h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive Academic Performance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-xl">
                <FontAwesomeIcon icon={faUserShield} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700 capitalize">{userRole}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-xl">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">{currentSemester}</span>
              </div>
              {isApiAvailable ? (
                <div className="flex items-center space-x-3 bg-green-100 px-4 py-2 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">API Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-yellow-100 px-4 py-2 rounded-xl">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Demo Mode</span>
                </div>
              )}
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                <FontAwesomeIcon icon={faBell} className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Grades</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.totalSemesterGrades.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{gradesStats.completedGrades} completed</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faFileAlt} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average CGPA</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.averageCGPA}</p>
                <p className="text-xs text-green-600 mt-1">Academic performance</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faTrophy} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.passRate}%</p>
                <p className="text-xs text-green-600 mt-1">Success rate</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Grades</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.pendingGrades}</p>
                <p className="text-xs text-orange-600 mt-1">Awaiting entry</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faClock} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`group relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                activeTab === item.id
                  ? 'border-blue-500 shadow-blue-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className="relative">
                <div className={`${item.color} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <FontAwesomeIcon icon={item.icon} className="text-white text-2xl" />
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {item.badge}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                {activeTab === item.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Grades Management Dashboard</h2>
                  <p className="text-gray-600">Welcome to the modern grades management system</p>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-2xl mr-4" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Grades</p>
                        <p className="text-2xl font-bold text-blue-900">{gradesStats.totalSemesterGrades}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faTrophy} className="text-green-600 text-2xl mr-4" />
                      <div>
                        <p className="text-sm text-green-600 font-medium">Average CGPA</p>
                        <p className="text-2xl font-bold text-green-900">{gradesStats.averageCGPA}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faChartPie} className="text-purple-600 text-2xl mr-4" />
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Pass Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{gradesStats.passRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center p-3 bg-white rounded-lg">
                        <div className="flex-shrink-0">
                          <FontAwesomeIcon 
                            icon={activity.type === 'exam_scheduled' ? faCalendarAlt : 
                                  activity.type === 'marks_entered' ? faEdit : faFileAlt} 
                            className="text-blue-600" 
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'grade-scales' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Grade Scales</h3>
                    <p className="text-gray-600">Manage grading criteria and scales</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {coreEntities.gradeScales.map((scale, idx) => (
                        <tr key={`${scale.letter}-${idx}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scale.letter}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{scale.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{scale.min_score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{scale.max_score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{scale.grade_points}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scale.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {scale.is_active ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {coreEntities.gradeScales.length === 0 && (
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-500" colSpan="6">No grade scales available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'midterm-grades' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Midterm Grades</h3>
                    <p className="text-gray-600">Enter and manage midterm assessments</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bulk-upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                    Bulk Entry
                  </button>
                </div>
                <GradeEntryForm
                  studentId="sample-student-id"
                  courseSectionId="sample-course-section"
                  semesterId="2024-1"
                  type="midterm"
                  gradesService={gradesService}
                  onSave={(result) => {
                    console.log('Midterm grade saved successfully!');
                    fetchMidtermGrades(); // Refresh data
                  }}
                />
              </div>
            )}
            
            {activeTab === 'semester-grades' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Semester Grades</h3>
                    <p className="text-gray-600">Manage final semester grades</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bulk-upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                    Bulk Entry
                  </button>
                </div>
                <GradeEntryForm
                  studentId="sample-student-id"
                  courseSectionId="sample-course-section"
                  semesterId="2024-1"
                  type="semester"
                  gradesService={gradesService}
                  onSave={(result) => {
                    console.log('Semester grade saved successfully!');
                    fetchSemesterGrades(); // Refresh data
                  }}
                />
              </div>
            )}
            
            {activeTab === 'sgpa-cgpa' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">SGPA/CGPA</h3>
                  <p className="text-gray-600">View academic performance metrics</p>
                </div>
                <GPADisplay
                  studentId="sample-student-id"
                  gradesService={gradesService}
                />
              </div>
            )}
            
            {activeTab === 'transcripts' && (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faDownload} className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Academic Transcripts</h3>
                <p className="text-gray-600">Generate and manage academic transcripts</p>
                <p className="text-sm text-gray-500 mt-2">Component coming soon...</p>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faChartPie} className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">View detailed analytics and reports</p>
                <p className="text-sm text-gray-500 mt-2">Component coming soon...</p>
              </div>
            )}
            
            {activeTab === 'bulk-upload' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Bulk Grade Upload</h3>
                    <p className="text-gray-600">Upload grades for multiple students at once</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setActiveTab('midterm-grades')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Individual Entry
                    </button>
                  </div>
                </div>
                <BulkGradeEntry
                  courseSectionId="sample-course-section"
                  semesterId="2024-1"
                  type="midterm"
                  gradesService={gradesService}
                  onSave={(result) => {
                    console.log('Bulk grades saved successfully!');
                    fetchMidtermGrades(); // Refresh data
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesManagement;
