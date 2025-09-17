import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faIdCard,
  faMoneyBillWave,
  faBus,
  faHome,
  faChartBar,
  faUsers,
  faGraduationCap,
  faBuilding,
  faCalendarAlt,
  faPlus,
  faDownload,
  faUpload,
  faCog,
  faBell,
  faSearch,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import studentApiService from '../../services/studentApiService';

const StudentDashboardDjango = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    byYear: {},
    bySection: {},
    byDepartment: {},
    byHostel: {},
    byTransport: {},
    feeStatus: { paid: 0, pending: 0, overdue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Handle URL parameters for direct navigation
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view && ['overview', 'fees', 'grades', 'hostel', 'transport', 'idcards'].includes(view)) {
      setSelectedView(view);
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await studentApiService.getStudentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Students</p>
              <p className="text-3xl font-bold">{stats.total || 0}</p>
            </div>
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Students</p>
              <p className="text-3xl font-bold">{stats.active || 0}</p>
            </div>
            <FontAwesomeIcon icon={faUserGraduate} className="text-4xl text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">New Admissions</p>
              <p className="text-3xl font-bold">{stats.new_admissions || 0}</p>
            </div>
            <FontAwesomeIcon icon={faPlus} className="text-4xl text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending Documents</p>
              <p className="text-3xl font-bold">{stats.pending_documents || 0}</p>
            </div>
            <FontAwesomeIcon icon={faIdCard} className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.by_department || {}).map(([dept, count]) => (
            <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{dept}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Year Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Year Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.by_year || {}).map(([year, count]) => (
            <div key={year} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">Year {year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFees = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Fee Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-900">{stats.feeStatus?.paid || 0}</p>
            <p className="text-sm text-green-600">Paid</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-900">{stats.feeStatus?.pending || 0}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-900">{stats.feeStatus?.overdue || 0}</p>
            <p className="text-sm text-red-600">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedView) {
      case "overview":
        return renderOverview();
      case "fees":
        return renderFees();
      case "grades":
        return <div className="text-center py-8"><p>Grades management coming soon...</p></div>;
      case "hostel":
        return <div className="text-center py-8"><p>Hostel management coming soon...</p></div>;
      case "transport":
        return <div className="text-center py-8"><p>Transport management coming soon...</p></div>;
      case "idcards":
        return <div className="text-center py-8"><p>ID Card generation coming soon...</p></div>;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Comprehensive student data overview</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: faChartBar },
              { id: 'fees', name: 'Fees', icon: faMoneyBillWave },
              { id: 'grades', name: 'Grades', icon: faGraduationCap },
              { id: 'hostel', name: 'Hostel', icon: faHome },
              { id: 'transport', name: 'Transport', icon: faBus },
              { id: 'idcards', name: 'ID Cards', icon: faIdCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboardDjango;
