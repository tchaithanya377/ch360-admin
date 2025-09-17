import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faUserGraduate,
  faFileAlt,
  faCheckCircle,
  faExclamationTriangle,
  faArrowRight,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faDownload,
  faBell,
  faSearch,
  faFilter,
  faChartLine,
  faTrophy,
  faBookOpen,
  faUsers,
  faClipboardList,
  faFileSignature,
  faChartPie,
  faCalendarCheck,
  faCloudUploadAlt,
  faGraduationCap,
  faShieldAlt,
  faHistory,
  faLock,
  faUnlock,
  faTimes,
  faUpload,
  faHome,
  faCog,
  faUserShield,
  faCalculator,
  faChartBar,
  faExclamationCircle,
  faInfoCircle,
  faCheckDouble,
  faPlay,
  faPause,
  faStop
} from '@fortawesome/free-solid-svg-icons';

const ExamDashboard = ({ 
  gradesStats, 
  coreEntities, 
  userRole, 
  permissions, 
  recentActivities, 
  logAuditEvent 
}) => {
  const [upcomingExams, setUpcomingExams] = useState([
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Data Structures',
      examType: 'Mid-Semester',
      date: '2024-03-15',
      time: '10:00 AM',
      duration: '2 hours',
      totalStudents: 45,
      status: 'scheduled',
      venue: 'Room 101',
      department: 'Computer Science',
      instructor: 'Dr. Smith'
    },
    {
      id: 2,
      courseCode: 'EE201',
      courseName: 'Electrical Circuits',
      examType: 'End-Semester',
      date: '2024-03-20',
      time: '2:00 PM',
      duration: '3 hours',
      totalStudents: 38,
      status: 'scheduled',
      venue: 'Room 205',
      department: 'Electrical Engineering',
      instructor: 'Dr. Johnson'
    },
    {
      id: 3,
      courseCode: 'ME301',
      courseName: 'Thermodynamics',
      examType: 'Practical',
      date: '2024-03-18',
      time: '9:00 AM',
      duration: '4 hours',
      totalStudents: 25,
      status: 'scheduled',
      venue: 'Lab 3',
      department: 'Mechanical Engineering',
      instructor: 'Dr. Williams'
    }
  ]);

  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 1,
      type: 'marks_entry',
      title: 'CS301 Mid-Semester Marks Entry',
      description: '45 students pending marks entry',
      dueDate: '2024-03-16',
      priority: 'high',
      department: 'Computer Science',
      instructor: 'Dr. Smith'
    },
    {
      id: 2,
      type: 'moderation',
      title: 'EE201 Theory Paper Moderation',
      description: 'HOD approval required',
      dueDate: '2024-03-17',
      priority: 'medium',
      department: 'Electrical Engineering',
      instructor: 'Dr. Johnson'
    },
    {
      id: 3,
      type: 'result_publication',
      title: 'Semester 1 Results Publication',
      description: 'All departments ready for publication',
      dueDate: '2024-03-19',
      priority: 'high',
      department: 'All Departments',
      instructor: 'Controller of Examinations'
    }
  ]);

  const [examStats, setExamStats] = useState({
    totalExams: 12,
    completedExams: 8,
    pendingExams: 4,
    totalStudents: 1250,
    averageAttendance: 94.5,
    pendingMarksEntry: 3,
    pendingModeration: 2
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'marks_entry': return faEdit;
      case 'moderation': return faShieldAlt;
      case 'result_publication': return faFileAlt;
      case 'exam_scheduled': return faCalendarAlt;
      case 'results_published': return faCheckCircle;
      default: return faClipboardList;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'marks_entry': return 'bg-green-500';
      case 'moderation': return 'bg-orange-500';
      case 'result_publication': return 'bg-blue-500';
      case 'exam_scheduled': return 'bg-purple-500';
      case 'results_published': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {userRole}!</h2>
            <p className="text-indigo-100 text-lg">Here's what's happening in your Grades Management System</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={faGraduationCap} className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{examStats.totalExams}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2 this month</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{examStats.completedExams}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">67% completion rate</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Requires attention</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-xl">
              <FontAwesomeIcon icon={faClock} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{examStats.averageAttendance}%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2.5% improvement</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
              <FontAwesomeIcon icon={faUsers} className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Exams */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Upcoming Exams</h3>
              <button className="bg-white bg-opacity-20 p-2 rounded-lg text-white hover:bg-opacity-30 transition-all duration-200">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exam.courseCode} - {exam.courseName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exam.department}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{exam.date} at {exam.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{exam.totalStudents} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{exam.examType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faHome} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{exam.venue}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">Instructor: {exam.instructor}</span>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Pending Tasks</h3>
              <button className="bg-white bg-opacity-20 p-2 rounded-lg text-white hover:bg-opacity-30 transition-all duration-200">
                <FontAwesomeIcon icon={faBell} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`${getTypeColor(task.type)} p-2 rounded-lg`}>
                        <FontAwesomeIcon icon={getTypeIcon(task.type)} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faUserShield} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{task.instructor}</span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Recent Activities</h3>
            <button className="bg-white bg-opacity-20 p-2 rounded-lg text-white hover:bg-opacity-30 transition-all duration-200">
              <FontAwesomeIcon icon={faHistory} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                <div className={`${getTypeColor(activity.type)} p-3 rounded-xl`}>
                  <FontAwesomeIcon icon={getTypeIcon(activity.type)} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.department}</span>
                    <span>•</span>
                    <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group">
              <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faEdit} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Enter Marks</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add student marks</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group">
              <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faCalculator} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Calculate Grades</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Process final grades</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 group">
              <div className="bg-orange-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Moderate</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review submissions</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group">
              <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faFileAlt} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Publish Results</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Release to students</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;
