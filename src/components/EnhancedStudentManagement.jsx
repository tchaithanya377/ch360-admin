import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./StudentManagement.css";
import {
  faUserGraduate, faPlus, faUpload, faIdCard, faEnvelope, faFileAlt,
  faChartBar, faCog, faDownload, faSearch, faFilter, faEye, faEdit, 
  faTrash, faCheckCircle, faExclamationTriangle, faUsers, faBell, 
  faDatabase, faShieldAlt, faPalette, faTimes, faChevronDown, 
  faChevronUp, faBolt, faArrowRight, faKey, faUserPlus, faGraduationCap,
  faCalendarAlt, faPhone, faMapMarkerAlt, faCreditCard, faCertificate,
  faClipboardList, faUserCheck, faEnvelopeOpen, faLock, faUnlock,
  faRandom, faQrcode, faPrint, faShare, faHistory, faChartLine,
  faUserFriends, faBookOpen, faCalendarCheck, faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import EnhancedBulkImport from "./EnhancedBulkImport";

// Import new components
import RollNumberGenerator from "./StudentManagement/RollNumberGenerator";
import LoginCredentialsManager from "./StudentManagement/LoginCredentialsManager";
import EmailManager from "./StudentManagement/EmailManager";
import StudentAnalytics from "./StudentManagement/StudentAnalytics";
import AttendanceTracker from "./StudentManagement/AttendanceTracker";
import DocumentManager from "./StudentManagement/DocumentManager";
import StudentPortal from "./StudentManagement/StudentPortal";
import Reports from "./Reports";
import SystemSettings from "./SystemSettings";
import ExportData from "./ExportData";

const EnhancedStudentManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("esm.activeTab") || "overview");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showRollNumberGenerator, setShowRollNumberGenerator] = useState(false);
  const [showLoginManager, setShowLoginManager] = useState(false);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("esm.searchTerm") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => localStorage.getItem("esm.searchTerm") || "");
  const [filterYear, setFilterYear] = useState(() => localStorage.getItem("esm.filterYear") || "");
  const [filterDepartment, setFilterDepartment] = useState(() => localStorage.getItem("esm.filterDepartment") || "");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("esm.sortBy") || "name");
  const [sortDir, setSortDir] = useState(() => localStorage.getItem("esm.sortDir") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch students
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const studentsData = [];
        snapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentsData);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate enhanced statistics
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    newAdmissions: students.filter(s => {
      const admissionDate = s.admissionDate || s.createdAt;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return admissionDate && new Date(admissionDate) > thirtyDaysAgo;
    }).length,
    studentsWithLogin: students.filter(s => s.hasLoginCredentials).length,
    studentsWithEmail: students.filter(s => s.email && s.emailVerified).length,
    studentsWithDocuments: students.filter(s => s.documents && s.documents.length > 0).length,
    attendanceRate: students.length > 0 ? 
      Math.round((students.filter(s => s.attendanceRate > 75).length / students.length) * 100) : 0,
    pendingVerifications: students.filter(s => s.verificationStatus === 'pending').length
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         student.rollNo?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         student.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    
    return matchesSearch && matchesYear && matchesDepartment;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (s) => {
      switch (sortBy) {
        case "name": return (s.name || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
        case "rollNo": return (s.rollNo || '').toString().toLowerCase();
        case "year": return (s.year || '').toString().toLowerCase();
        case "department": return (s.department || '').toLowerCase();
        case "status": return (s.status || '').toLowerCase();
        case "admissionDate": return s.admissionDate || '';
        default: return (s.name || '').toLowerCase();
      }
    };
    const av = getVal(a);
    const bv = getVal(b);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  const paginatedStudents = sortedStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterYear, filterDepartment, sortBy, sortDir]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterYear("");
    setFilterDepartment("");
    setSortBy("name");
    setSortDir("asc");
  };

  // Enhanced quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addStudent':
        navigate('/student-registration');
        break;
      case 'bulkImport':
        setShowBulkImport(true);
        break;
      case 'rollNumberGenerator':
        setShowRollNumberGenerator(true);
        break;
      case 'loginManager':
        setShowLoginManager(true);
        break;
      case 'emailManager':
        setShowEmailManager(true);
        break;
      case 'idCards':
        setActiveTab('id-cards');
        break;
      case 'analytics':
        setActiveTab('analytics');
        break;
      case 'attendance':
        setActiveTab('attendance');
        break;
      case 'documents':
        setActiveTab('documents');
        break;
      case 'communication':
        setActiveTab('communication');
        break;
      case 'portal':
        setActiveTab('student-portal');
        break;
      case 'notifications':
        setActiveTab('notifications');
        break;
      case 'reports':
        setActiveTab('reports');
        break;
      case 'export':
        setActiveTab('export-data');
        break;
      case 'settings':
        setActiveTab('system-settings');
        break;
      default:
        break;
    }
  };

  // Enhanced quick actions data
  const quickActions = [
    {
      id: 'addStudent',
      title: 'Add Student',
      description: 'Register a new student',
      icon: faUserPlus,
      color: 'bg-blue-500',
      action: () => handleQuickAction('addStudent')
    },
    {
      id: 'bulkImport',
      title: 'Bulk Import',
      description: 'Import multiple students',
      icon: faUpload,
      color: 'bg-green-500',
      action: () => handleQuickAction('bulkImport')
    },
    {
      id: 'rollNumberGenerator',
      title: 'Roll Number Generator',
      description: 'Generate roll numbers',
      icon: faRandom,
      color: 'bg-purple-500',
      action: () => handleQuickAction('rollNumberGenerator')
    },
    {
      id: 'loginManager',
      title: 'Login Manager',
      description: 'Manage login credentials',
      icon: faKey,
      color: 'bg-indigo-500',
      action: () => handleQuickAction('loginManager')
    },
    {
      id: 'emailManager',
      title: 'Email Manager',
      description: 'Manage student emails',
      icon: faEnvelope,
      color: 'bg-yellow-500',
      action: () => handleQuickAction('emailManager')
    },
    {
      id: 'idCards',
      title: 'ID Card Generator',
      description: 'Generate student ID cards',
      icon: faIdCard,
      color: 'bg-pink-500',
      action: () => handleQuickAction('idCards')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Student analytics & insights',
      icon: faChartLine,
      color: 'bg-orange-500',
      action: () => handleQuickAction('analytics')
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Track student attendance',
      icon: faCalendarCheck,
      color: 'bg-teal-500',
      action: () => handleQuickAction('attendance')
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Manage student documents',
      icon: faFileAlt,
      color: 'bg-red-500',
      action: () => handleQuickAction('documents')
    },
    
    {
      id: 'portal',
      title: 'Student Portal',
      description: 'Student portal management',
      icon: faUserCheck,
      color: 'bg-emerald-500',
      action: () => handleQuickAction('portal')
    },
    
  ];

  // Enhanced navigation tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: faEye },
    { id: 'roll-number-generator', name: 'Roll Number Generator', icon: faRandom },
    { id: 'login-credentials', name: 'Login Credentials', icon: faKey },
    { id: 'email-management', name: 'Email Management', icon: faEnvelope },
    { id: 'id-cards', name: 'ID Cards', icon: faIdCard },
    { id: 'analytics', name: 'Analytics', icon: faChartLine },
    { id: 'attendance', name: 'Attendance', icon: faCalendarCheck },
    { id: 'documents', name: 'Documents', icon: faFileAlt },
    { id: 'student-portal', name: 'Student Portal', icon: faUserCheck },
    { id: 'reports', name: 'Reports', icon: faChartBar }
  ];

  // Persist preferences
  useEffect(() => { localStorage.setItem("esm.activeTab", activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem("esm.searchTerm", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("esm.filterYear", filterYear); }, [filterYear]);
  useEffect(() => { localStorage.setItem("esm.filterDepartment", filterDepartment); }, [filterDepartment]);
  useEffect(() => { localStorage.setItem("esm.sortBy", sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem("esm.sortDir", sortDir); }, [sortDir]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="h-full flex flex-col space-y-8">
            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faBolt} className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 quick-actions-grid">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1 flex flex-col items-center justify-center"
                  >
                    <div className={`${action.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm mb-3`}>
                      <FontAwesomeIcon icon={action.icon} className="text-lg" />
                    </div>
                    <div className="text-center w-full">
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors leading-tight mb-1">{action.title}</h4>
                      <p className="text-xs text-gray-600 leading-tight">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Statistics */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-5 flex-shrink-0 stats-grid">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-blue-100 text-xs font-medium stats-label">Total Students</p>
                    <p className="text-3xl font-bold stats-value">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faUsers} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-emerald-100 text-xs font-medium stats-label">Active Students</p>
                    <p className="text-3xl font-bold stats-value">{stats.activeStudents}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-amber-100 text-xs font-medium stats-label">New Admissions</p>
                    <p className="text-3xl font-bold stats-value">{stats.newAdmissions}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-indigo-100 text-xs font-medium stats-label">With Login</p>
                    <p className="text-3xl font-bold stats-value">{stats.studentsWithLogin}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faKey} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-yellow-100 text-xs font-medium stats-label">Email Verified</p>
                    <p className="text-3xl font-bold stats-value">{stats.studentsWithEmail}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-teal-100 text-xs font-medium stats-label">Attendance Rate</p>
                    <p className="text-3xl font-bold stats-value">{stats.attendanceRate}%</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Recent Students */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 min-h-0">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-sm" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Recent Students</h3>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                    View All
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-full student-table-container">
                {sortedStudents.length === 0 ? (
                  <div className="p-3 text-center text-gray-600 text-xs">No students found. Adjust filters or add a new student.</div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="w-full divide-y divide-gray-200 hidden lg:table h-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUserGraduate} className="text-gray-600 text-sm" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate max-w-[140px]">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]">{student.department}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status === 'active' ? 'bg-green-100 text-green-800' :
                                student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900 p-1"><FontAwesomeIcon icon={faEye} className="text-sm" /></button>
                                <button className="text-green-600 hover:text-green-900 p-1"><FontAwesomeIcon icon={faEdit} className="text-sm" /></button>
                                <button className="text-red-600 hover:text-red-900 p-1"><FontAwesomeIcon icon={faTrash} className="text-sm" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-200">
                      <div className="flex items-center justify-between sm:justify-start">
                        <span className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedStudents.length)} of {sortedStudents.length} results
                        </span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded border text-sm ${
                            currentPage === 1 
                              ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 rounded text-sm ${
                                  currentPage === pageNum
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded border text-sm ${
                            currentPage === totalPages 
                              ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'roll-number-generator':
        return <RollNumberGenerator students={students} />;
      
      case 'login-credentials':
        return <LoginCredentialsManager students={students} />;
      
      case 'email-management':
        return <EmailManager students={students} />;
      
      case 'id-cards':
        return <div>ID Card Generator Component</div>;
      
      case 'analytics':
        return <StudentAnalytics students={students} />;
      
      case 'attendance':
        return <AttendanceTracker students={students} />;
      
      case 'documents':
        return <DocumentManager students={students} />;
      
      
      
      case 'student-portal':
        return <StudentPortal students={students} />;
      
      
      
      case 'reports':
        return <Reports />;
      
      case 'export-data':
        return <ExportData />;
      
      case 'system-settings':
        return <SystemSettings />;
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(""); }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden student-management-container">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-sm p-4 text-white flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <FontAwesomeIcon icon={faUserGraduate} className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Enhanced Student Management</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Advanced student management with roll numbers, credentials & analytics</p>
              <div className="flex items-center space-x-3 mt-1 text-xs">
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-200" />
                  <span>{students.length} Total Students</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" />
                  <span>{stats.activeStudents} Active</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faKey} className="text-yellow-300" />
                  <span>{stats.studentsWithLogin} With Login</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/student-registration')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 text-xs font-medium transition-all duration-200 border border-white/30"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="bg-white hover:bg-gray-50 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 text-xs font-medium transition-all duration-200"
            >
              <FontAwesomeIcon icon={faUpload} />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <FontAwesomeIcon icon={faSearch} className="text-blue-600 text-sm" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Search & Filter Students</h3>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="lg:hidden inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 filter-container ${showFilters ? '' : 'hidden lg:grid'}`}>
          <div className="sm:col-span-2 lg:col-span-1 min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Students</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, roll no, or email..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-2 text-gray-400 text-xs" />
            </div>
          </div>
          
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              <option value="">All Years</option>
              {Array.from(new Set(students.map(s => s.year))).filter(Boolean).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              <option value="">All Departments</option>
              {Array.from(new Set(students.map(s => s.department))).filter(Boolean).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="name">Name</option>
                <option value="rollNo">Roll No</option>
                <option value="year">Year</option>
                <option value="department">Department</option>
                <option value="status">Status</option>
                <option value="admissionDate">Admission Date</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
          <div className="flex flex-wrap gap-1 min-w-0">
            {searchTerm && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                Search: "{searchTerm}"
                <button className="ml-1 text-gray-500" onClick={() => setSearchTerm("")}>×</button>
              </span>
            )}
            {filterYear && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                Year: {filterYear}
                <button className="ml-1 text-gray-500" onClick={() => setFilterYear("")}>×</button>
              </span>
            )}
            {filterDepartment && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                Dept: {filterDepartment}
                <button className="ml-1 text-gray-500" onClick={() => setFilterDepartment("")}>×</button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{sortedStudents.length} result{sortedStudents.length !== 1 ? 's' : ''}</span>
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear all</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide nav-tabs-container px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className={`text-xs ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-3">
        {renderTabContent()}
      </div>

      {/* Mobile FAB for Add Student */}
      <button
        onClick={() => navigate('/student-registration')}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Add Student"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* Modals */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto student-modal">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Import Students</h3>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
                             <EnhancedBulkImport onClose={() => setShowBulkImport(false)} />
            </div>
          </div>
        </div>
      )}

      {showRollNumberGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto student-modal">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Roll Number Generator</h3>
                <button
                  onClick={() => setShowRollNumberGenerator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <RollNumberGenerator students={students} onClose={() => setShowRollNumberGenerator(false)} />
            </div>
          </div>
        </div>
      )}

      {showLoginManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto student-modal">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Login Credentials Manager</h3>
                <button
                  onClick={() => setShowLoginManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <LoginCredentialsManager students={students} onClose={() => setShowLoginManager(false)} />
            </div>
          </div>
        </div>
      )}

      {showEmailManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto student-modal">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Manager</h3>
                <button
                  onClick={() => setShowEmailManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <EmailManager students={students} onClose={() => setShowEmailManager(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStudentManagement;
