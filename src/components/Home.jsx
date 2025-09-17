import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaCog,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaUserGraduate,
  FaBookOpen,
  FaBuilding,
  FaShieldAlt
} from 'react-icons/fa';

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for demonstration
  const stats = {
    totalStudents: 1247,
    totalFaculty: 89,
    activeCourses: 156,
    upcomingEvents: 12
  };

  const recentActivities = [
    { id: 1, type: 'student', action: 'New student registration', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'faculty', action: 'Faculty profile updated', time: '15 minutes ago', status: 'info' },
    { id: 3, type: 'course', action: 'New course added', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'event', action: 'Event scheduled', time: '2 hours ago', status: 'warning' },
    { id: 5, type: 'system', action: 'System maintenance completed', time: '3 hours ago', status: 'success' }
  ];

  const quickActions = [
    { title: 'Add Student', icon: FaUserGraduate, color: 'blue', colorClass: 'text-blue-600 dark:text-blue-400', path: '/student-registration' },
    { title: 'Add Faculty', icon: FaChalkboardTeacher, color: 'green', colorClass: 'text-green-600 dark:text-green-400', path: '/add-faculty' },
    { title: 'Create Course', icon: FaBookOpen, color: 'purple', colorClass: 'text-purple-600 dark:text-purple-400', path: '/add-course' },
    { title: 'Manage Events', icon: FaCalendarAlt, color: 'orange', colorClass: 'text-orange-600 dark:text-orange-400', path: '/event-management' },
    { title: 'Fee Management', icon: FaFileAlt, color: 'red', colorClass: 'text-red-600 dark:text-red-400', path: '/fee-management' },
    { title: 'System Settings', icon: FaCog, color: 'gray', colorClass: 'text-gray-600 dark:text-gray-400', path: '/system-settings' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300 ease-in-out">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, Administrator!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <FaBell className="text-xl" />
              <span className="text-sm">3 new notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="text-xl" />
              <span className="text-sm">System Status: Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Faculty
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalFaculty}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FaChalkboardTeacher className="text-2xl text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.activeCourses}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FaGraduationCap className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Events
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.upcomingEvents}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FaCalendarAlt className="text-2xl text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="p-4 rounded-lg transition-all duration-300 hover:scale-105 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-full bg-white dark:bg-gray-600">
                      <action.icon className={`text-xl ${action.colorClass}`} />
                    </div>
                    <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                      {action.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2 p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
              <button className="text-sm font-medium transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${getStatusColor(activity.status)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                    <FaArrowRight className="text-sm text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="p-6 rounded-xl shadow-lg dark:shadow-gray-900/20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <FaChartLine className="text-2xl text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    System Performance
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    98.5%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <FaClock className="text-2xl text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Uptime
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    99.9%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <FaBuilding className="text-2xl text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Sessions
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    47
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="text-2xl text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Security Status
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;