import React, { useState, useEffect } from "react";
import facultyApiService from '../services/facultyApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faGraduationCap,
  faChalkboardTeacher,
  faChartLine,
  faCalendarAlt,
  faMoneyBillWave,
  faFlask,
  faShieldAlt,
  faComments,
  faChartBar,
  faPlus,
  faSearch,
  faFilter,
  faDownload,
  faUpload,
  faEdit,
  faTrash,
  faEye,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faUsers,
  faBook,
  faAward,
  faFileAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard,
  faUniversity,
  faCalculator,
  faFileInvoice,
  faBell,
  faCog,
  faHandshake,
  faUserShield,
  faHistory,
  faSync,
  faPrint,
  faShare,
  faLink,
  faUnlink,
  faUserPlus,
  faUserEdit,
  faUserMinus,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faUserGraduate,
  faUserCog,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faBars,
  faTimes,
  faHome,
  faDashboard,
  faCalendar,
  faTasks,
  faFileText,
  faCog as faSettings,
  faSignOutAlt,
  faBell as faNotification,
  faUser,
  faChevronDown,
  faChevronRight,
  faStar,
  faMedal,
  faTrophy,
  faCertificate,
  faBookOpen,
  faLaptop,
  faMicroscope,
  faLightbulb,
  faRocket,
  faBullseye,
  faArrowUp,
  faChartPie,
  faTable,
  faListUl,
  faThLarge,
  faSort,
  faSortUp,
  faSortDown,
  faEllipsis,
  faCheck,
  faTimes as faClose,
  faSave,
  faUndo,
  faRedo,
  faCopy,
  faPaste,
  faCut,
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faList,
  faListOl,
  faQuoteLeft,
  faCode,
  faLink as faChain,
  faImage,
  faVideo,
  faMusic,
  faFile,
  faFolder,
  faFolderOpen,
  faCloud,
  faCloudUpload,
  faCloudDownload,
  faRotate,
  faSpinner,
  faCircle,
  faSquare,
  faHeart,
  faThumbsUp,
  faThumbsDown,
  faSmile,
  faFrown,
  faMeh,
  faGrin,
  faLaugh,
  faAngry,
  faSurprise,
  faTired,
  faDizzy,
  faDizzy as faDizzy2,
  faGrinBeam,
  faGrinHearts,
  faGrinStars,
  faGrinTears,
  faGrinTongue,
  faGrinTongueWink,
  faGrinWink,
  faKiss,
  faKissWinkHeart,
  faLaughSquint,
  faLaughWink,
  faSadCry,
  faSadTear,
  faSmileBeam,
  faSmileWink,
  faTired as faTired2,
  faAngry as faAngry2,
  faSurprise as faSurprise2,
  faDizzy as faDizzy3,
  faGrinBeam as faGrinBeam2,
  faGrinHearts as faGrinHearts2,
  faGrinStars as faGrinStars2,
  faGrinTears as faGrinTears2,
  faGrinTongue as faGrinTongue2,
  faGrinTongueWink as faGrinTongueWink2,
  faGrinWink as faGrinWink2,
  faKiss as faKiss2,
  faKissWinkHeart as faKissWinkHeart2,
  faLaughSquint as faLaughSquint2,
  faLaughWink as faLaughWink2,
  faSadCry as faSadCry2,
  faSadTear as faSadTear2,
  faSmileBeam as faSmileBeam2,
  faSmileWink as faSmileWink2
} from "@fortawesome/free-solid-svg-icons";

// Import sub-components
import FacultyProfileManagement from "./FacultyManagement/FacultyProfileManagement";
import FacultyCreateForm from "./FacultyManagement/FacultyCreateForm.jsx";
import PerformanceAppraisal from "./FacultyManagement/PerformanceAppraisal";
import LeaveAttendance from "./FacultyManagement/LeaveAttendance";
import ReportsAnalytics from "./FacultyManagement/ReportsAnalytics";
import FacultyDashboardView from "./FacultyManagement/FacultyDashboard";

const FacultyManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [facultyStats, setFacultyStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    probation: 0,
    departments: {},
    designations: {},
    recentHires: 0,
    upcomingRetirements: 0,
    averageExperience: 0,
    researchPublications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [facultyCount, setFacultyCount] = useState(0);
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pageSize] = useState(10);

  // Enhanced tabs with better organization
  const tabs = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: faDashboard, 
      color: "blue",
      description: "Overview and key metrics",
      badge: null
    },
    { 
      id: "profile", 
      name: "Profile Management", 
      icon: faUserTie, 
      color: "indigo",
      description: "Manage faculty profiles and personal information",
      badge: null
    },
    { 
      id: "performance", 
      name: "Performance", 
      icon: faChartLine, 
      color: "orange",
      description: "Track and evaluate faculty performance",
      badge: null
    },
    { 
      id: "leave", 
      name: "Leave & Attendance", 
      icon: faCalendarAlt, 
      color: "red",
      description: "Manage leave requests and attendance tracking",
      badge: "5"
    },
    { 
      id: "reports", 
      name: "Reports & Analytics", 
      icon: faChartBar, 
      color: "teal",
      description: "Generate reports and analyze data",
      badge: null
    }
  ];

  // Fetch faculty statistics with enhanced data
  useEffect(() => {
    const fetchFacultyStats = async () => {
      try {
        setLoading(true);
        const stats = await facultyApiService.getFacultyStats();
        const safeStats = {
          total: 0,
          active: 0,
          onLeave: 0,
          probation: 0,
          departments: {},
          designations: {},
          recentHires: 0,
          upcomingRetirements: 0,
          averageExperience: 0,
          researchPublications: 0,
          ...(stats || {}),
        };
        // Ensure nested maps always objects
        safeStats.departments = safeStats.departments || {};
        safeStats.designations = safeStats.designations || {};
        setFacultyStats(safeStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching faculty stats:', error);
        setLoading(false);
      }
    };

    fetchFacultyStats();
  }, []);

  // Load faculty list from backend and compute stats
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setFacultyLoading(true);
        const res = await facultyApiService.getFaculty({
          search: searchTerm || undefined,
          page,
          page_size: pageSize,
        });
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.results)
            ? res.results
            : Array.isArray(res?.data)
              ? res.data
              : [];
        const count = typeof res?.count === 'number' ? res.count : list.length;
        if (!alive) return;
        setFaculty(list);
        setFacultyCount(count);

        const toBool = (val) => {
          if (val === true) return true;
          if (typeof val === 'string') {
            const t = val.toLowerCase();
            return t === 'y' || t === 'yes' || t === 'active' || t === 'true';
          }
          return false;
        };

        const computed = {
          total: count,
          active: list.filter(f => toBool(f?.currently_associated) || (f?.status && String(f.status).toLowerCase() === 'active')).length,
          onLeave: list.filter(f => f?.status && String(f.status).toLowerCase().includes('leave')).length,
          probation: list.filter(f => f?.status && String(f.status).toLowerCase().includes('probation')).length,
          departments: {},
          designations: {},
          recentHires: 0,
          upcomingRetirements: 0,
          averageExperience: 0,
          researchPublications: 0,
        };

        list.forEach(f => {
          const dept = f.department || f.employmentDetails?.department || 'Unknown';
          const desig = f.present_designation || f.designation || f.employmentDetails?.designation || 'Unknown';
          computed.departments[dept] = (computed.departments[dept] || 0) + 1;
          computed.designations[desig] = (computed.designations[desig] || 0) + 1;
        });

        setFacultyStats(prev => ({ ...prev, ...computed }));
      } catch (e) {
        console.error('Error loading faculty:', e);
        setFaculty([]);
        setFacultyCount(0);
      } finally {
        setFacultyLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [searchTerm, page, pageSize]);

  const refreshFacultyList = async () => {
    try {
      setFacultyLoading(true);
      const res = await facultyApiService.getFaculty({
        search: searchTerm || undefined,
        page,
        page_size: pageSize,
      });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.results)
          ? res.results
          : Array.isArray(res?.data)
            ? res.data
            : [];
      const count = typeof res?.count === 'number' ? res.count : list.length;
      setFaculty(list);
      setFacultyCount(count);
    } catch (e) {
      console.error('Error refreshing faculty:', e);
    } finally {
      setFacultyLoading(false);
    }
  };

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activities = await facultyApiService.getFacultyActivities();
        const safeActivities = Array.isArray(activities) ? activities : [];
        setRecentActivities(safeActivities);
      } catch (error) {
        console.error('Error fetching faculty activities:', error);
      }
    };

    fetchActivities();
  }, []);

  // Mock notifications - in real app, fetch from Django API
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'info', message: 'New faculty application received', time: '2 hours ago' },
      { id: 2, type: 'warning', message: '3 faculty members on leave today', time: '4 hours ago' },
      { id: 3, type: 'success', message: 'Performance review completed', time: '1 day ago' },
      { id: 4, type: 'info', message: 'Monthly payroll processed', time: '2 days ago' }
    ]);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <FacultyDashboardView
            stats={facultyStats}
            activities={recentActivities}
            notifications={notifications}
            faculty={faculty}
            facultyCount={facultyCount}
            facultyLoading={facultyLoading}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            onNavigate={(tabId) => setActiveTab(tabId)}
          />
        );
      case "profile":
        return <FacultyProfileManagement />;
      case "performance":
        return <PerformanceAppraisal />;
      case "leave":
        return <LeaveAttendance />;
      case "reports":
        return <ReportsAnalytics />;
      default:
        return (
          <FacultyDashboardView
            stats={facultyStats}
            activities={recentActivities}
            notifications={notifications}
            faculty={faculty}
            facultyCount={facultyCount}
            facultyLoading={facultyLoading}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            onNavigate={(tabId) => setActiveTab(tabId)}
          />
        );
    }
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTab);

  // Enhanced Dashboard Component with better organization
  const FacultyDashboard = ({ stats, activities, notifications }) => {
    const quickActions = [
      { 
        id: 1, 
        name: 'Add Faculty', 
        icon: faUserPlus, 
        color: 'blue', 
        action: () => setShowCreateForm(true),
        description: 'Add new faculty members'
      },
      { 
        id: 2, 
        name: 'Manage Profiles', 
        icon: faUserTie, 
        color: 'indigo', 
        action: () => setActiveTab('profile'),
        description: 'Update faculty information'
      },
      { 
        id: 3, 
        name: 'View Reports', 
        icon: faChartBar, 
        color: 'purple', 
        action: () => setActiveTab('reports'),
        description: 'Generate analytics'
      },
      { 
        id: 4, 
        name: 'Leave Requests', 
        icon: faCalendarAlt, 
        color: 'orange', 
        action: () => setActiveTab('leave'),
        description: 'Review pending requests'
      },
      { 
        id: 6, 
        name: 'Performance Review', 
        icon: faChartLine, 
        color: 'red', 
        action: () => setActiveTab('performance'),
        description: 'Track faculty performance'
      }
    ];

    return (
      <div className="space-y-6">
                 {/* Welcome Section */}
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Faculty Management</h1>
              <p className="text-blue-100">Manage your academic workforce efficiently</p>
            </div>
            <div className="hidden md:block">
              <FontAwesomeIcon icon={faUsers} className="text-6xl text-blue-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Common tasks and shortcuts</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 group text-left"
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 text-${action.color}-600 dark:text-${action.color}-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon icon={action.icon} className="text-lg" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{action.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                 <FontAwesomeIcon icon={faUsers} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Faculty</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
               </div>
             </div>
           </div>

                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                 <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
               </div>
             </div>
           </div>

                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                 <FontAwesomeIcon icon={faClock} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onLeave}</p>
               </div>
             </div>
           </div>

                     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                 <FontAwesomeIcon icon={faUserClock} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Probation</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.probation}</p>
               </div>
             </div>
           </div>
        </div>

                 {/* Additional Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                 <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Hires</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentHires}</p>
               </div>
             </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                 <FontAwesomeIcon icon={faCalendarAlt} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Retirements</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingRetirements}</p>
               </div>
             </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                 <FontAwesomeIcon icon={faFlask} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Research Publications</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.researchPublications}</p>
               </div>
             </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                 <FontAwesomeIcon icon={faAward} className="text-xl" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Experience</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageExperience}y</p>
               </div>
             </div>
           </div>
         </div>

        {/* Faculty List (dynamic) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Directory</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">{facultyLoading ? 'Loading…' : `${facultyCount} total`}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">APAAR ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {faculty.map((f) => {
                  const name = f.personalDetails?.fullName || f.name || [f.first_name || f.firstName, f.last_name || f.lastName].filter(Boolean).join(' ') || '—';
                  const email = f.contactDetails?.email || f.email || '—';
                  const dept = f.department || f.employmentDetails?.department || '—';
                  const desig = f.present_designation || f.designation || f.employmentDetails?.designation || '—';
                  const status = f.status || (f.currently_associated ? 'ACTIVE' : '');
                  const empId = f.employee_id || f.employeeId || '—';
                  const apaar = f.apaar_faculty_id || f.apaarFacultyId || '—';
                  const phone = f.phone_number || f.phone || '—';
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{email}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{dept}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{desig}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{empId}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{apaar}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{phone}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{status || '—'}</td>
                    </tr>
                  );
                })}
                {!facultyLoading && faculty.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No faculty found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">Page {facultyCount ? page : 0} of {facultyCount ? Math.ceil(facultyCount / pageSize) : 0}</div>
            <div className="space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => (p * pageSize < facultyCount ? p + 1 : p))} disabled={page * pageSize >= facultyCount} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

                 {/* Department Distribution and Recent Activities */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
               <FontAwesomeIcon icon={faUniversity} className="mr-2 text-blue-600 dark:text-blue-400" />
               Department Distribution
             </h3>
             <div className="space-y-3">
               {Object.entries(stats.departments).map(([dept, count]) => (
                 <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <span className="text-gray-700 dark:text-gray-300 font-medium">{dept}</span>
                   <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm">
                     {count}
                   </span>
                 </div>
               ))}
             </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
               <FontAwesomeIcon icon={faUserTie} className="mr-2 text-green-600 dark:text-green-400" />
               Designation Distribution
             </h3>
             <div className="space-y-3">
               {Object.entries(stats.designations).map(([designation, count]) => (
                 <div key={designation} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <span className="text-gray-700 dark:text-gray-300 font-medium">{designation}</span>
                   <span className="font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm">
                     {count}
                   </span>
                 </div>
               ))}
             </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
               <FontAwesomeIcon icon={faHistory} className="mr-2 text-purple-600 dark:text-purple-400" />
               Recent Activities
             </h3>
             <div className="space-y-3">
               {activities.slice(0, 5).map((activity) => (
                 <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                   <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-gray-900 dark:text-gray-200 font-medium truncate">{activity.description}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       {activity.timestamp instanceof Date ? activity.timestamp.toLocaleDateString() : new Date(activity.timestamp).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>

                 {/* Notifications */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
             <FontAwesomeIcon icon={faBell} className="mr-2 text-orange-600 dark:text-orange-400" />
             Recent Notifications
           </h3>
           <div className="space-y-3">
             {notifications.map((notification) => (
               <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                 <div className={`w-3 h-3 rounded-full ${
                   notification.type === 'info' ? 'bg-blue-500' :
                   notification.type === 'warning' ? 'bg-yellow-500' :
                   notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                 }`}></div>
                 <div className="flex-1">
                   <p className="text-sm text-gray-900 dark:text-gray-200">{notification.message}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Faculty Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      Faculty Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
                      Streamlined academic workforce management
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className={`flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 ${mobileMenuOpen ? 'block' : 'hidden lg:flex'}`}>
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search faculty, courses, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                <span className="font-medium">Add Faculty</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faDownload} className="text-sm" />
                <span className="font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {getActiveTab()?.name || 'Dashboard'}
            </span>
            {searchTerm && (
              <>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400">
                  Search: "{searchTerm}"
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Tab Navigation with Categories */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex flex-wrap lg:flex-nowrap overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap relative group ${
                    activeTab === tab.id
                      ? `bg-white dark:bg-gray-800 text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-500 dark:border-${tab.color}-400 shadow-sm`
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  {tab.badge && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center ${
                      tab.badge === 'New' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Info */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${getActiveTab()?.color}-100 text-${getActiveTab()?.color}-600`}>
                <FontAwesomeIcon icon={getActiveTab()?.icon} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getActiveTab()?.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{getActiveTab()?.description}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fadeIn">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {showCreateForm && (
        <FacultyCreateForm
          onClose={() => setShowCreateForm(false)}
          onCreated={() => { setShowCreateForm(false); refreshFacultyList(); }}
        />
      )}
    </div>
  );
};

export default FacultyManagement;

