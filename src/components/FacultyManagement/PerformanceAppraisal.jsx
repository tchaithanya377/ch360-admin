import React, { useState, useEffect } from "react";
import facultyApiService from '../../services/facultyApiService';
import usePerformanceManagement from '../../hooks/usePerformanceManagement';
import PerformanceDashboard from './PerformanceDashboard';
import FacultyPerformanceForm from './FacultyPerformanceForm';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartBar,
  faStar,
  faComments,
  faFileAlt,
  faAward,
  faCalculator,
  faDownload,
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faCheckCircle,
  faTimes,
  faUserGraduate,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserClock,
  faSave,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faRefresh
} from "@fortawesome/free-solid-svg-icons";

const PerformanceAppraisal = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Use the performance management hook
  const {
    performanceRecords,
    performanceReviews,
    performanceMetrics,
    facultyList,
    loading,
    error,
    loadData,
    loadMockData,
    refreshDynamicData,
    forceUseApiData,
    createPerformanceRecord,
    updatePerformanceRecord,
    deletePerformanceRecord,
    createPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
    createPerformanceMetric,
    filterPerformanceRecords,
    clearError
  } = usePerformanceManagement();

  const handleFormSave = async (formData) => {
    try {
      if (formMode === 'create') {
        await createPerformanceRecord(formData);
      } else if (formMode === 'edit') {
        await updatePerformanceRecord(selectedItem.id, formData);
      }
      setShowModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error saving performance record:', err);
    }
  };

  const handleFormCancel = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormMode('create');
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      if (type === "performance-record") {
        await deletePerformanceRecord(id);
      } else if (type === "performance-review") {
        await deletePerformanceReview(id);
      }
    } catch (err) {
      console.error('Error deleting performance record:', err);
    }
  };

  const openModal = (type, item = null, mode = 'create') => {
    setModalType(type);
    setSelectedItem(item);
    setFormMode(mode);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormMode('create');
    clearError();
  };

  const filteredPerformanceRecords = filterPerformanceRecords({
    search: searchTerm,
    department: filterDepartment,
    year: filterYear
  });

  // Debug logging
  useEffect(() => {
    console.log('PerformanceAppraisal - performanceRecords:', performanceRecords);
    console.log('PerformanceAppraisal - facultyList:', facultyList);
    console.log('PerformanceAppraisal - loading:', loading);
    console.log('PerformanceAppraisal - error:', error);
  }, [performanceRecords, facultyList, loading, error]);

  // Force load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: faChartLine, count: 0 },
    { id: "performance-records", name: "Performance Records", icon: faFileAlt, count: performanceRecords.length },
    { id: "performance-reviews", name: "Performance Reviews", icon: faComments, count: performanceReviews.length },
    { id: "performance-metrics", name: "Performance Metrics", icon: faCalculator, count: performanceMetrics.length },
    { id: "performance-reports", name: "Performance Reports", icon: faChartBar, count: 0 }
  ];

  const renderPerformanceRecords = () => (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Records</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadData()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                  title="Reload Data"
                >
                  <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                  Reload
                </button>
                <button
                  onClick={() => loadMockData()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  title="Load Mock Data"
                >
                  <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
                  Load Mock Data
                </button>
                <button
                  onClick={() => refreshDynamicData()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                  title="Refresh Dynamic Data"
                >
                  <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                  Refresh Data
                </button>
                <button
                  onClick={() => forceUseApiData()}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                  title="Force Use API Data"
                >
                  <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
                  Use API Data
                </button>
                <button
          onClick={() => openModal("performance-record", null, 'create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Performance Record
              </button>
              </div>
            </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by faculty name or ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {Array.from(new Set(performanceRecords.map(r => r.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
                  </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {Array.from(new Set(performanceRecords.map(r => r.academic_year))).sort().reverse().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Status Indicator */}
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}
      
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          Loading performance data...
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{performanceRecords.length}</div>
            <div className="text-gray-600">Performance Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{facultyList.length}</div>
            <div className="text-gray-600">Faculty Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{performanceReviews.length}</div>
            <div className="text-gray-600">Performance Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{performanceMetrics.length}</div>
            <div className="text-gray-600">Performance Metrics</div>
          </div>
        </div>
      </div>

      {/* Performance Records Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teaching (0-10)</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Research (0-10)</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin (0-10)</th>
              <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall (0-10)</th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
            {filteredPerformanceRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.faculty ? `${record.faculty.first_name} ${record.faculty.last_name}` : 
                   (record.faculty_name ? 
                     record.faculty_name.replace(/\([^)]*\)/g, '').replace(/^Dr\.?\s*/i, '').trim() : 
                     `Faculty ID: ${record.faculty_id}`)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.faculty?.department || record.department || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.academic_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(record.teaching_effectiveness / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{record.teaching_effectiveness}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(record.research_contribution / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{record.research_contribution}/10</span>
                  </div>
                      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(record.administrative_work / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{record.administrative_work}/10</span>
                  </div>
                      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          record.overall_score >= 8 ? 'bg-green-600' :
                          record.overall_score >= 6 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${(record.overall_score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className={record.overall_score >= 8 ? 'text-green-600' : record.overall_score >= 6 ? 'text-yellow-600' : 'text-red-600'}>
                      {record.overall_score}/10
                    </span>
                  </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                    record.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                    record.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                    {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                    <button 
                      onClick={() => openModal("performance-record", record, 'edit')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => openModal("performance-record", record, 'view')}
                      className="text-green-600 hover:text-green-900"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id, "performance-record")}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        {filteredPerformanceRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faInfoCircle} className="text-4xl mb-4" />
            <p>No performance records found</p>
          </div>
        )}
            </div>
          </div>
        );

  const renderPerformanceReviews = () => (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Reviews</h3>
              <button
          onClick={() => openModal("performance-review")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {review.reviewer_name || `Reviewer ${review.reviewer_id}`}
              </h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                review.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                review.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {review.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Faculty:</strong> {review.faculty_name || review.performance_record?.faculty_name}</p>
              <p><strong>Review Date:</strong> {new Date(review.review_date).toLocaleDateString()}</p>
              <p><strong>Rating:</strong> {review.rating}/5</p>
              <p><strong>Comments:</strong> {review.comments?.substring(0, 100)}...</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => openModal("performance-review", review)}
                className="text-blue-600 hover:text-blue-900"
                title="Edit"
              >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
              <button 
                onClick={() => handleDelete(review.id, "performance-review")}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

  const renderPerformanceMetrics = () => (
          <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <button
          onClick={() => openModal("performance-metric")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Metric
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{metric.name}</h4>
              <FontAwesomeIcon icon={faCalculator} className="text-purple-600" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Category:</strong> {metric.category}</p>
              <p><strong>Weight:</strong> {metric.weight}%</p>
              <p><strong>Description:</strong> {metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

  const renderPerformanceReports = () => (
          <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Reports</h3>
        <button
          onClick={() => {
            // Generate report logic
            console.log('Generate performance report');
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Generate Report
                          </button>
                        </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <FontAwesomeIcon icon={faChartLine} className="text-4xl mb-4" />
          <p>Performance reports will be generated here</p>
          <p className="text-sm">Select date range and faculty to generate detailed reports</p>
        </div>
            </div>
          </div>
        );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PerformanceDashboard />;
      case "performance-records":
        return renderPerformanceRecords();
      case "performance-reviews":
        return renderPerformanceReviews();
      case "performance-metrics":
        return renderPerformanceMetrics();
      case "performance-reports":
        return renderPerformanceReports();
      default:
        return <PerformanceDashboard />;
    }
  };

  const renderModal = () => {
    if (!showModal) return null;

    if (modalType === "performance-record") {
      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 w-11/12 max-w-6xl">
            <FacultyPerformanceForm
              performanceRecord={selectedItem}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              mode={formMode}
              facultyList={facultyList}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      );
    }

    // For other modal types, keep the existing modal structure
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedItem ? 'Edit' : 'Add'} {modalType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {error}
              </div>
            )}

            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faInfoCircle} className="text-4xl mb-4" />
              <p>Modal for {modalType} will be implemented here</p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance & Appraisal</h2>
          <p className="text-gray-600">Manage faculty performance evaluation and appraisal system</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            ) : (
              <FontAwesomeIcon icon={faUserClock} className="mr-2" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading && activeTab === "performance-records" ? (
            <div className="flex justify-center items-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-600" />
              <span className="ml-2 text-gray-600">Loading performance data...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default PerformanceAppraisal;