import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faPlus, faEdit, faTrash, faEye, faSearch, 
  faFilter, faDownload, faUpload, faUsers, faGraduationCap,
  faChartBar, faCog, faSave, faTimes, faCheck, faExclamationTriangle,
  faUniversity, faMapMarkerAlt, faPhone, faEnvelope, faGlobe,
  faCalendarAlt, faUserTie, faBook, faClipboardList, faBullhorn,
  faCalendar, faFileAlt, faCogs, faDatabase
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';
import facultyApiService from '../../services/facultyApiService';
import DepartmentForm from './DepartmentForm';
import DepartmentResources from './DepartmentResources';
import DepartmentAnnouncements from './DepartmentAnnouncements';
import DepartmentEvents from './DepartmentEvents';
import DepartmentDocuments from './DepartmentDocuments';
import DepartmentStats from './DepartmentStats';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentTypeFilter, setDepartmentTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [stats, setStats] = useState({
    total_departments: 0,
    active_departments: 0,
    total_faculty: 0,
    total_students: 0,
    total_courses: 0
  });

  // Faculty list for HOD assignment
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);

  useEffect(() => {
    loadDepartments({ page, page_size: pageSize });
    loadStats();
    loadFaculty();
  }, []);

  // Refetch on filter/search/page changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDepartments({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        department_type: departmentTypeFilter || undefined,
        page,
        page_size: pageSize
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, departmentTypeFilter, page]);

  const loadFaculty = async () => {
    setFacultyLoading(true);
    try {
      const res = await facultyApiService.getFaculty();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.results)
          ? res.results
          : [];
      setFaculty(list);
    } catch (e) {
      console.error('Failed to load faculty:', e);
      setFaculty([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  const loadDepartments = async (params = {}) => {
    setLoading(true);
    try {
      const data = await departmentApiService.getDepartments(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setDepartments(normalized);
      const count = typeof data?.count === 'number' ? data.count : normalized.length;
      setTotalCount(count);
    } catch (err) {
      console.warn('API not available, using mock data:', err.message);
      // Fallback to mock data when API is not available
      const mockDepartments = [
        {
          id: 1,
          name: 'Computer Science',
          code: 'CS',
          description: 'Department of Computer Science and Engineering',
          head_of_department: 'Dr. John Smith',
          faculty_count: 25,
          student_count: 450,
          status: 'ACTIVE',
          department_type: 'ACADEMIC',
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Electrical Engineering',
          code: 'EE',
          description: 'Department of Electrical and Electronics Engineering',
          head_of_department: 'Dr. Jane Doe',
          faculty_count: 20,
          student_count: 380,
          status: 'ACTIVE',
          department_type: 'ACADEMIC',
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 3,
          name: 'Mechanical Engineering',
          code: 'ME',
          description: 'Department of Mechanical Engineering',
          head_of_department: 'Dr. Bob Johnson',
          faculty_count: 18,
          student_count: 320,
          status: 'ACTIVE',
          department_type: 'ACADEMIC',
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];
      setDepartments(mockDepartments);
      setTotalCount(mockDepartments.length);
      setError('API not available - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await departmentApiService.getDepartmentStats();
      setStats(data);
    } catch (err) {
      console.warn('API not available, using mock stats:', err.message);
      // Fallback to mock stats when API is not available
      const mockStats = {
        total_departments: 3,
        active_departments: 3,
        total_faculty: 63,
        total_students: 1150,
        department_breakdown: [
          {
            id: 1,
            name: 'Computer Science',
            faculty_count: 25,
            student_count: 450,
            resource_count: 12,
            announcement_count: 8,
            event_count: 5,
            document_count: 15
          },
          {
            id: 2,
            name: 'Electrical Engineering',
            faculty_count: 20,
            student_count: 380,
            resource_count: 10,
            announcement_count: 6,
            event_count: 4,
            document_count: 12
          },
          {
            id: 3,
            name: 'Mechanical Engineering',
            faculty_count: 18,
            student_count: 320,
            resource_count: 8,
            announcement_count: 5,
            event_count: 3,
            document_count: 10
          }
        ],
        resource_stats: {
          total_resources: 30,
          available_resources: 25,
          in_use_resources: 5,
          maintenance_resources: 0
        },
        announcement_stats: {
          total_announcements: 19,
          published_announcements: 15,
          draft_announcements: 4,
          urgent_announcements: 2
        },
        event_stats: {
          total_events: 12,
          upcoming_events: 8,
          ongoing_events: 2,
          completed_events: 2
        },
        document_stats: {
          total_documents: 37,
          public_documents: 30,
          private_documents: 7,
          recent_documents: 5
        }
      };
      setStats(mockStats);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApiService.deleteDepartment(id);
        loadDepartments();
        loadStats();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setActiveTab('details');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDepartment(null);
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    setEditingDepartment(null);
    loadDepartments();
    loadStats();
  };

  const departmentList = Array.isArray(departments) ? departments : [];
  const filteredDepartments = departmentList.filter(dept => {
    const hodNameForSearch = typeof dept.head_of_department === 'object'
      ? (dept.head_of_department?.name || dept.head_of_department?.fullName || '')
      : (dept.head_of_department || '');
    const matchesSearch = dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hodNameForSearch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || dept.status === statusFilter;
    const matchesType = !departmentTypeFilter || dept.department_type === departmentTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: faChartBar },
    { id: 'departments', name: 'Departments', icon: faBuilding },
    { id: 'resources', name: 'Resources', icon: faCogs },
    { id: 'announcements', name: 'Announcements', icon: faBullhorn },
    { id: 'events', name: 'Events', icon: faCalendar },
    { id: 'documents', name: 'Documents', icon: faFileAlt },
    { id: 'analytics', name: 'Analytics', icon: faDatabase }
  ];

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <FontAwesomeIcon icon={icon} className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Departments"
          value={stats.total_departments || 0}
          icon={faBuilding}
          color="blue"
        />
        <StatCard
          title="Active Departments"
          value={stats.active_departments || 0}
          icon={faCheck}
          color="green"
        />
        <StatCard
          title="Total Faculty"
          value={stats.total_faculty || 0}
          icon={faUsers}
          color="purple"
        />
        <StatCard
          title="Total Students"
          value={stats.total_students || 0}
          icon={faGraduationCap}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Departments</h3>
        <div className="space-y-3">
          {departmentList.slice(0, 5).map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{dept.name}</p>
                  <p className="text-sm text-gray-600">{dept.code} • {dept.head_of_department}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                dept.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dept.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="MERGED">Merged</option>
              <option value="DISSOLVED">Dissolved</option>
            </select>
            <select
              value={departmentTypeFilter}
              onChange={(e) => setDepartmentTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="ACADEMIC">Academic</option>
              <option value="ADMINISTRATIVE">Administrative</option>
              <option value="RESEARCH">Research</option>
              <option value="SERVICE">Service</option>
              <option value="SUPPORT">Support</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Head of Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty/Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
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
                      {(() => {
                        const getNameFromObj = (o) => (
                          o?.personalDetails?.fullName || o?.name || `${o?.firstName || ''} ${o?.lastName || ''}`.trim()
                        );
                        const getHodInfo = (d) => {
                          // Common explicit name fields
                          const nameCandidates = [
                            d.head_of_department_name,
                            d.head_of_department_label,
                            d.hod_name,
                            d.hod,
                            d.head,
                            typeof d.head_of_department === 'string' && isNaN(Number(d.head_of_department)) ? d.head_of_department : null,
                            typeof d.head_of_department === 'object' ? getNameFromObj(d.head_of_department) : null
                          ].filter(Boolean);

                          const idCandidates = [
                            d.head_of_department_id,
                            typeof d.head_of_department === 'number' ? d.head_of_department : null,
                            (typeof d.head_of_department === 'string' && !isNaN(Number(d.head_of_department))) ? Number(d.head_of_department) : null
                          ].filter(v => v !== null && v !== undefined && String(v).length > 0);

                          let hodName = nameCandidates[0] || '';
                          let hodEmail = d.head_of_department_email || '';

                          if (!hodName && idCandidates.length > 0) {
                            const match = faculty.find(f => String(f.id) === String(idCandidates[0]));
                            if (match) {
                              hodName = getNameFromObj(match);
                              hodEmail = hodEmail || match.contactDetails?.email || match.email || '';
                            }
                          }

                          return {
                            name: hodName || 'N/A',
                            email: hodEmail || 'N/A'
                          };
                        };

                        const { name, email } = getHodInfo(dept);
                        return (
                          <>
                            <div className="text-sm text-gray-900">{name}</div>
                            <div className="text-sm text-gray-500">{email}</div>
                          </>
                        );
                      })()}
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
                          : dept.status === 'INACTIVE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dept.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.faculty_count || 0} / {dept.student_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(dept)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleEdit(dept)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= totalCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= totalCount}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'departments':
        return renderDepartments();
      case 'resources':
        return <DepartmentResources selectedDepartment={selectedDepartment} />;
      case 'announcements':
        return <DepartmentAnnouncements selectedDepartment={selectedDepartment} />;
      case 'events':
        return <DepartmentEvents selectedDepartment={selectedDepartment} />;
      case 'documents':
        return <DepartmentDocuments selectedDepartment={selectedDepartment} />;
      case 'analytics':
        return <DepartmentStats stats={stats} departments={departments} />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="mt-2 text-gray-600">
            Manage departments, resources, announcements, events, and documents
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Department Form Modal */}
        {showModal && (
          <DepartmentForm
            department={editingDepartment}
            faculty={faculty}
            onClose={handleModalClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;
