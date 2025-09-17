import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate, faPlus, faUpload, faIdCard, faMoneyBillWave,
  faGraduationCap, faHome, faBus, faEnvelope, faFileAlt,
  faChartBar, faCog, faDownload, faSearch, faFilter,
  faEye, faEdit, faTrash, faCheckCircle, faExclamationTriangle,
  faUsers, faBell, faDatabase, faShieldAlt, faPalette, faTimes,
  faChevronDown, faChevronUp, faBolt, faArrowRight, faComments
} from "@fortawesome/free-solid-svg-icons";
import studentApiService from '../services/studentApiService';
import EnhancedBulkImport from "./EnhancedBulkImport";

// Import new components
import LoginCredentialsManager from "./StudentManagement/LoginCredentialsManager";
import StudentAnalytics from "./StudentManagement/StudentAnalytics";
import DocumentManager from "./StudentManagement/DocumentManager";
import EnhancedIDCardGenerator from "./StudentManagement/EnhancedIDCardGenerator";
import Reports from "./Reports";
import SystemSettings from "./SystemSettings";
import ExportData from "./ExportData";
import StudentCRUD from "./StudentManagement/StudentCRUD";

const StudentManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("sm.activeTab") || "overview");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [showIDCardGenerator, setShowIDCardGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("sm.searchTerm") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => localStorage.getItem("sm.searchTerm") || "");
  const [filterYear, setFilterYear] = useState(() => localStorage.getItem("sm.filterYear") || "");
  const [filterDepartment, setFilterDepartment] = useState(() => localStorage.getItem("sm.filterDepartment") || "");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("sm.sortBy") || "name");
  const [sortDir, setSortDir] = useState(() => localStorage.getItem("sm.sortDir") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Reduced for better fit
  const [showFilters, setShowFilters] = useState(false);
  const [filterSection, setFilterSection] = useState(() => localStorage.getItem("sm.filterSection") || "");

  // Edit/View modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch students from Django API
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterDepartment) params.department = filterDepartment;
        if (filterYear) params.year = filterYear;
        if (filterSection) params.section = filterSection;
        
        const studentsData = await studentApiService.getStudents(params);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setError("");
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [filterDepartment, filterYear, filterSection]);

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => (s.status || '').toString().toLowerCase() === 'active').length,
    newAdmissions: students.filter(s => {
      const admissionDate = s.admission_date || s.created_at;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return admissionDate && new Date(admissionDate) > thirtyDaysAgo;
    }).length,
    pendingFees: students.filter(s => (s.total_fee || 0) > (s.paid_fee || 0)).length,
    hostelStudents: students.filter(s => s.hostel_status === 'allocated').length,
    transportStudents: students.filter(s => s.transport_status === 'allocated').length
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         student.roll_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         student.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    
    return matchesSearch && matchesYear && matchesDepartment;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (s) => {
      switch (sortBy) {
        case "name": return (s.name || `${s.first_name || ''} ${s.last_name || ''}`).toLowerCase();
        case "rollNo": return (s.roll_number || '').toString().toLowerCase();
        case "year": return (s.year || '').toString().toLowerCase();
        case "department": return (s.department || '').toLowerCase();
        case "status": return (s.status || '').toLowerCase();
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
    // Reset to first page when filters/search/sort change
    setCurrentPage(1);
  }, [debouncedSearch, filterYear, filterDepartment, filterSection, sortBy, sortDir]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterYear("");
    setFilterDepartment("");
    setFilterSection("");
    setSortBy("name");
    setSortDir("asc");
  };

  // CRUD helpers
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      roll_number: student.roll_number || '',
      email: student.email || '',
      department: student.department || filterDepartment || '',
      year: student.year || filterYear || '',
      section: student.section || filterSection || '',
      status: student.status || 'active'
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.department || !editForm.year || !editForm.section) {
      alert('Please select department, year and section');
      return;
    }
    try {
      await studentApiService.updateStudent(editingStudent.id, editForm);
      setShowEditModal(false);
      // Reload students
      const params = {};
      if (filterDepartment) params.department = filterDepartment;
      if (filterYear) params.year = filterYear;
      if (filterSection) params.section = filterSection;
      const studentsData = await studentApiService.getStudents(params);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (e) {
      console.error('Failed to update student', e);
      alert('Failed to update student: ' + e.message);
    }
  };

  const removeStudent = async (student) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentApiService.deleteStudent(student.id);
      // Reload students
      const params = {};
      if (filterDepartment) params.department = filterDepartment;
      if (filterYear) params.year = filterYear;
      if (filterSection) params.section = filterSection;
      const studentsData = await studentApiService.getStudents(params);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (e) {
      console.error('Failed to delete student', e);
      alert('Failed to delete student: ' + e.message);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addStudent':
        navigate('/student-registration');
        break;
      case 'bulkImport':
        setShowBulkImport(true);
        break;
      
      case 'credentials':
        setActiveTab('credentials');
        break;
      case 'analytics':
        setActiveTab('analytics');
        break;
      case 'documents':
        setActiveTab('documents');
        break;
      case 'idCards':
        setShowIDCardGenerator(true);
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

  // Quick actions data - updated with new features
  const quickActions = [
    {
      id: 'addStudent',
      title: 'Add Student',
      description: 'Register a new student',
      icon: faPlus,
      color: 'bg-blue-500',
      action: () => handleQuickAction('addStudent')
    },
    {
      id: 'bulkImport',
      title: 'Enhanced Bulk Import',
      description: 'Import with Firebase Auth',
      icon: faUpload,
      color: 'bg-green-500',
      action: () => handleQuickAction('bulkImport')
    },
    
    {
      id: 'credentials',
      title: 'Login Credentials',
      description: 'Manage student logins',
      icon: faShieldAlt,
      color: 'bg-indigo-500',
      action: () => handleQuickAction('credentials')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Student data insights',
      icon: faChartBar,
      color: 'bg-pink-500',
      action: () => handleQuickAction('analytics')
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Manage documents',
      icon: faFileAlt,
      color: 'bg-red-500',
      action: () => handleQuickAction('documents')
    }
  ];

  // Navigation tabs - updated (removed Email Manager, Attendance, Communication, Portal, Feedback, Notifications)
  const tabs = [
    { id: 'overview', name: 'Overview', icon: faEye },
    { id: 'students', name: 'Students', icon: faUsers },
    { id: 'credentials', name: 'Login Credentials', icon: faShieldAlt },
    { id: 'analytics', name: 'Analytics', icon: faChartBar },
    { id: 'documents', name: 'Documents', icon: faFileAlt },
    { id: 'id-cards', name: 'ID Cards', icon: faIdCard },
    { id: 'reports', name: 'Reports', icon: faChartBar }
  ];

  // Persist preferences
  useEffect(() => { localStorage.setItem("sm.activeTab", activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem("sm.searchTerm", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("sm.filterYear", filterYear); }, [filterYear]);
  useEffect(() => { localStorage.setItem("sm.filterDepartment", filterDepartment); }, [filterDepartment]);
  useEffect(() => { localStorage.setItem("sm.sortBy", sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem("sm.sortDir", sortDir); }, [sortDir]);
  useEffect(() => { localStorage.setItem("sm.filterSection", filterSection); }, [filterSection]);

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
            {/* Compact Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 flex-shrink-0 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faBolt} className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 quick-actions-grid">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 text-left transform hover:-translate-y-1 flex flex-col items-center justify-center"
                  >
                    <div className={`${action.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm mb-3`}>
                      <FontAwesomeIcon icon={action.icon} className="text-lg" />
                    </div>
                    <div className="text-center w-full">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1">{action.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Statistics */}
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
                    <FontAwesomeIcon icon={faPlus} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-rose-100 text-xs font-medium stats-label">Pending Fees</p>
                    <p className="text-3xl font-bold stats-value">{stats.pendingFees}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-violet-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-violet-100 text-xs font-medium stats-label">Hostel Students</p>
                    <p className="text-3xl font-bold stats-value">{stats.hostelStudents}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faHome} className="text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 rounded-lg shadow-md text-white relative stats-card">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-orange-100 text-xs font-medium stats-label">Transport Students</p>
                    <p className="text-3xl font-bold stats-value">{stats.transportStudents}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm w-fit stats-icon">
                    <FontAwesomeIcon icon={faBus} className="text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Recent Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 overflow-hidden flex-1 min-h-0 border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-sm" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Students</h3>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    <span onClick={() => setActiveTab('students')}>View All</span>
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-full student-table-container">
                {sortedStudents.length === 0 ? (
                  <div className="p-3 text-center text-gray-600 dark:text-gray-400 text-xs">No students found. Adjust filters or add a new student.</div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table h-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll No</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUserGraduate} className="text-gray-600 dark:text-gray-400 text-sm" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                                    {student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.roll_number}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white truncate max-w-[100px]">{student.department}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.year}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                student.status === 'inactive' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button onClick={() => openEditModal(student)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1" title="View"><FontAwesomeIcon icon={faEye} className="text-sm" /></button>
                                <button onClick={() => openEditModal(student)} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1" title="Edit"><FontAwesomeIcon icon={faEdit} className="text-sm" /></button>
                                <button onClick={() => removeStudent(student)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1" title="Delete"><FontAwesomeIcon icon={faTrash} className="text-sm" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tablet table */}
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 hidden sm:table lg:hidden h-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                          <th className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll No</th>
                          <th className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-1.5 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-1.5 py-1.5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-5 w-5">
                                  <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUserGraduate} className="text-gray-600 text-xs" />
                                  </div>
                                </div>
                                <div className="ml-1.5">
                                  <div className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                                    {student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate max-w-[80px]">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-1.5 py-1.5 whitespace-nowrap text-xs text-gray-900">{student.roll_number}</td>
                            <td className="px-1.5 py-1.5 whitespace-nowrap text-xs text-gray-900 truncate max-w-[60px]">{student.department}</td>
                            <td className="px-1.5 py-1.5 whitespace-nowrap">
                              <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                                student.status === 'active' ? 'bg-green-100 text-green-800' :
                                student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-1.5 py-1.5 whitespace-nowrap text-xs font-medium">
                              <div className="flex space-x-0.5">
                                <button onClick={() => openEditModal(student)} className="text-blue-600 hover:text-blue-900 p-0.5"><FontAwesomeIcon icon={faEye} className="text-xs" /></button>
                                <button onClick={() => openEditModal(student)} className="text-green-600 hover:text-green-900 p-0.5"><FontAwesomeIcon icon={faEdit} className="text-xs" /></button>
                                <button onClick={() => removeStudent(student)} className="text-red-600 hover:text-red-900 p-0.5"><FontAwesomeIcon icon={faTrash} className="text-xs" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile list */}
                    <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700 h-full overflow-y-auto">
                      {paginatedStudents.map((student) => (
                        <div key={student.id} className="p-2 flex items-start gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faUserGraduate} className="text-gray-600 text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 text-xs truncate">
                                {student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                              </p>
                              <span className={`ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                                student.status === 'active' ? 'bg-green-100 text-green-800' :
                                student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Roll No:</span> {student.roll_number} • 
                              <span className="font-medium ml-1">Dept:</span> {student.department} • 
                              <span className="font-medium ml-1">Year:</span> {student.year}
                            </p>
                            <p className="text-xs text-gray-500 truncate mb-1">{student.email}</p>
                            <div className="flex gap-1 text-blue-600">
                              <button onClick={() => openEditModal(student)} className="text-xs bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">View</button>
                              <button onClick={() => openEditModal(student)} className="text-xs bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-green-600 dark:text-green-400">Edit</button>
                              <button onClick={() => removeStudent(student)} className="text-xs bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Compact Pagination */}
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
                              ? 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
                              : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                              ? 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
                              : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
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
      
      
      case 'students':
        return <StudentCRUD />;
      
      case 'credentials':
        return <LoginCredentialsManager students={students} />;
      
      case 'analytics':
        return <StudentAnalytics students={students} />;
      
      case 'documents':
        return <DocumentManager students={students} />;
      
      case 'id-cards':
        return <EnhancedIDCardGenerator />;
      
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
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(""); }}
          className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto student-management-container text-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-sm p-4 text-white flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <FontAwesomeIcon icon={faUserGraduate} className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Student Management</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Comprehensive student management system</p>
              <div className="flex items-center space-x-3 mt-1 text-xs">
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-200" />
                  <span>{students.length} Total Students</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" />
                  <span>{stats.activeStudents} Active</span>
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
              <span>Enhanced Bulk Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Search and Filters removed per request */}

      {/* Compact Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
          <nav className="flex overflow-x-auto scrollbar-hide nav-tabs-container px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 shadow-sm'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className={`text-xs ${activeTab === tab.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingStudent ? 'View / Edit Student' : 'Student'}</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input value={editForm.first_name || ''} onChange={(e)=>setEditForm(v=>({...v,first_name:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input value={editForm.last_name || ''} onChange={(e)=>setEditForm(v=>({...v,last_name:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                    <input value={editForm.roll_number || ''} onChange={(e)=>setEditForm(v=>({...v,roll_number:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input value={editForm.email || ''} onChange={(e)=>setEditForm(v=>({...v,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input value={editForm.department || ''} onChange={(e)=>setEditForm(v=>({...v,department:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                    <input value={editForm.year || ''} onChange={(e)=>setEditForm(v=>({...v,year:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                    <input value={editForm.section || ''} onChange={(e)=>setEditForm(v=>({...v,section:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={editForm.status || 'active'} onChange={(e)=>setEditForm(v=>({...v,status:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={()=>setShowEditModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showBulkImport && (
        <EnhancedBulkImport 
          onClose={() => setShowBulkImport(false)} 
          onSuccess={(count) => {
            setShowBulkImport(false);
            // Refresh the student list by triggering a re-fetch
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
            alert(`Successfully imported ${count} students!`);
          }}
        />
      )}



      {showIDCardGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto student-modal">
            <div className="p-4 sm:p-6 student-modal-content">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ID Card Generator</h3>
                <button
                  onClick={() => setShowIDCardGenerator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <EnhancedIDCardGenerator onClose={() => setShowIDCardGenerator(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
