import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, faBuilding, faUsers, faGraduationCap, 
  faBook, faCogs, faBullhorn, faCalendar, faFileAlt,
  faArrowUp, faArrowDown, faMinus, faEye
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentStats = ({ stats, departments }) => {
  const [detailedStats, setDetailedStats] = useState({
    department_breakdown: [],
    resource_stats: {},
    announcement_stats: {},
    event_stats: {},
    document_stats: {},
    trends: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDetailedStats();
  }, []);

  const loadDetailedStats = async () => {
    setLoading(true);
    try {
      // Load additional statistics from the API
      const [resourcesData, announcementsData, eventsData, documentsData] = await Promise.all([
        departmentApiService.getResources({ page_size: 1000 }),
        departmentApiService.getAnnouncements({ page_size: 1000 }),
        departmentApiService.getEvents({ page_size: 1000 }),
        departmentApiService.getDocuments({ page_size: 1000 })
      ]);

      const resources = Array.isArray(resourcesData) ? resourcesData : resourcesData?.results || [];
      const announcements = Array.isArray(announcementsData) ? announcementsData : announcementsData?.results || [];
      const events = Array.isArray(eventsData) ? eventsData : eventsData?.results || [];
      const documents = Array.isArray(documentsData) ? documentsData : documentsData?.results || [];

      // Calculate department breakdown
      const departmentBreakdown = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        faculty_count: dept.faculty_count || 0,
        student_count: dept.student_count || 0,
        course_count: dept.course_count || 0,
        status: dept.status,
        department_type: dept.department_type
      }));

      // Calculate resource statistics
      const resourceStats = {
        total: resources.length,
        by_type: resources.reduce((acc, resource) => {
          acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
          return acc;
        }, {}),
        by_status: resources.reduce((acc, resource) => {
          acc[resource.status] = (acc[resource.status] || 0) + 1;
          return acc;
        }, {}),
        by_department: resources.reduce((acc, resource) => {
          const deptId = resource.department_id;
          if (deptId) {
            acc[deptId] = (acc[deptId] || 0) + 1;
          }
          return acc;
        }, {})
      };

      // Calculate announcement statistics
      const announcementStats = {
        total: announcements.length,
        by_type: announcements.reduce((acc, announcement) => {
          acc[announcement.announcement_type] = (acc[announcement.announcement_type] || 0) + 1;
          return acc;
        }, {}),
        by_priority: announcements.reduce((acc, announcement) => {
          acc[announcement.priority] = (acc[announcement.priority] || 0) + 1;
          return acc;
        }, {}),
        published: announcements.filter(a => a.is_published).length,
        draft: announcements.filter(a => !a.is_published).length
      };

      // Calculate event statistics
      const eventStats = {
        total: events.length,
        by_type: events.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {}),
        by_status: events.reduce((acc, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {}),
        public: events.filter(e => e.is_public).length,
        private: events.filter(e => !e.is_public).length,
        upcoming: events.filter(e => new Date(e.start_date) > new Date()).length,
        past: events.filter(e => new Date(e.start_date) < new Date()).length
      };

      // Calculate document statistics
      const documentStats = {
        total: documents.length,
        by_type: documents.reduce((acc, document) => {
          acc[document.document_type] = (acc[document.document_type] || 0) + 1;
          return acc;
        }, {}),
        by_status: documents.reduce((acc, document) => {
          acc[document.approval_status] = (acc[document.approval_status] || 0) + 1;
          return acc;
        }, {}),
        public: documents.filter(d => d.is_public).length,
        private: documents.filter(d => !d.is_public).length
      };

      setDetailedStats({
        department_breakdown: departmentBreakdown,
        resource_stats: resourceStats,
        announcement_stats: announcementStats,
        event_stats: eventStats,
        document_stats: documentStats,
        trends: {
          total_departments: departments.length,
          active_departments: departments.filter(d => d.status === 'ACTIVE').length,
          total_faculty: departmentBreakdown.reduce((sum, dept) => sum + dept.faculty_count, 0),
          total_students: departmentBreakdown.reduce((sum, dept) => sum + dept.student_count, 0),
          total_courses: departmentBreakdown.reduce((sum, dept) => sum + dept.course_count, 0)
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to load detailed statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue', trend = null, subtitle = null }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <FontAwesomeIcon icon={icon} className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <FontAwesomeIcon 
            icon={trend > 0 ? faArrowUp : trend < 0 ? faArrowDown : faMinus} 
            className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}
          />
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {Math.abs(trend)}% from last month
          </span>
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, data, type = 'bar' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(value / Math.max(...Object.values(data))) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Department Analytics</h2>
        <p className="text-gray-600">Comprehensive statistics and insights about departments and their resources</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Departments"
          value={detailedStats.trends.total_departments || 0}
          icon={faBuilding}
          color="blue"
          trend={5}
        />
        <StatCard
          title="Active Departments"
          value={detailedStats.trends.active_departments || 0}
          icon={faBuilding}
          color="green"
          trend={2}
        />
        <StatCard
          title="Total Faculty"
          value={detailedStats.trends.total_faculty || 0}
          icon={faUsers}
          color="purple"
          trend={8}
        />
        <StatCard
          title="Total Students"
          value={detailedStats.trends.total_students || 0}
          icon={faGraduationCap}
          color="orange"
          trend={12}
        />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detailedStats.department_breakdown.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                        <div className="text-sm text-gray-500">{dept.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {dept.department_type || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dept.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.faculty_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.student_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.course_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource and Content Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Resources by Type"
          data={detailedStats.resource_stats.by_type || {}}
        />
        <ChartCard
          title="Resources by Status"
          data={detailedStats.resource_stats.by_status || {}}
        />
        <ChartCard
          title="Announcements by Type"
          data={detailedStats.announcement_stats.by_type || {}}
        />
        <ChartCard
          title="Announcements by Priority"
          data={detailedStats.announcement_stats.by_priority || {}}
        />
        <ChartCard
          title="Events by Type"
          data={detailedStats.event_stats.by_type || {}}
        />
        <ChartCard
          title="Events by Status"
          data={detailedStats.event_stats.by_status || {}}
        />
        <ChartCard
          title="Documents by Type"
          data={detailedStats.document_stats.by_type || {}}
        />
        <ChartCard
          title="Documents by Status"
          data={detailedStats.document_stats.by_status || {}}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resources"
          value={detailedStats.resource_stats.total || 0}
          icon={faCogs}
          color="blue"
          subtitle="Across all departments"
        />
        <StatCard
          title="Published Announcements"
          value={detailedStats.announcement_stats.published || 0}
          icon={faBullhorn}
          color="green"
          subtitle={`${detailedStats.announcement_stats.draft || 0} drafts`}
        />
        <StatCard
          title="Upcoming Events"
          value={detailedStats.event_stats.upcoming || 0}
          icon={faCalendar}
          color="purple"
          subtitle={`${detailedStats.event_stats.past || 0} past events`}
        />
        <StatCard
          title="Total Documents"
          value={detailedStats.document_stats.total || 0}
          icon={faFileAlt}
          color="orange"
          subtitle={`${detailedStats.document_stats.public || 0} public`}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <FontAwesomeIcon icon={faEye} className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-800 font-medium">View All Resources</span>
          </button>
          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FontAwesomeIcon icon={faBullhorn} className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 font-medium">Manage Announcements</span>
          </button>
          <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-purple-800 font-medium">Schedule Events</span>
          </button>
          <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-orange-600 mr-3" />
            <span className="text-orange-800 font-medium">Upload Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStats;
