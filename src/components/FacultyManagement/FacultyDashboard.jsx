import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faUserTie,
  faChartBar,
  faCalendarAlt,
  faChalkboardTeacher,
  faChartLine,
  faCheckCircle,
  faClock,
  faUserClock,
  faUniversity,
  faAward,
  faFlask,
  faBell
} from "@fortawesome/free-solid-svg-icons";

const FacultyDashboard = ({
  stats,
  activities,
  notifications,
  faculty,
  facultyCount,
  facultyLoading,
  page,
  setPage,
  pageSize,
  onNavigate
}) => {
  const quickActions = [
    { id: 1, name: 'Add Faculty', icon: faUserPlus, color: 'blue', action: () => onNavigate && onNavigate('profile'), description: 'Add new faculty members' },
    { id: 2, name: 'Manage Profiles', icon: faUserTie, color: 'indigo', action: () => onNavigate && onNavigate('profile'), description: 'Update faculty information' },
    { id: 3, name: 'View Reports', icon: faChartBar, color: 'purple', action: () => onNavigate && onNavigate('reports'), description: 'Generate analytics' },
    { id: 4, name: 'Leave Requests', icon: faCalendarAlt, color: 'orange', action: () => onNavigate && onNavigate('leave'), description: 'Review pending requests' },
    { id: 6, name: 'Performance Review', icon: faChartLine, color: 'red', action: () => onNavigate && onNavigate('performance'), description: 'Track faculty performance' }
  ];

  return (
    <div className="space-y-6">
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
                  <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No faculty found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">Page {facultyCount ? page : 0} of {facultyCount ? Math.ceil(facultyCount / pageSize) : 0}</div>
          <div className="space-x-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => (p * pageSize < facultyCount ? p + 1 : p))} disabled={page * pageSize >= facultyCount} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

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
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm">{count}</span>
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
                <span className="font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
};

export default FacultyDashboard;


