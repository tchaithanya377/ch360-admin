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
import StudentStats from "./StudentStats";
import QuickActions from "./QuickActions";
import RecentActivities from "./RecentActivities";
import DepartmentOverview from "./DepartmentOverview";
import FeeOverview from "./FeeOverview";
import HostelOverview from "./HostelOverview";
import TransportOverview from "./TransportOverview";
import IDCardGenerator from "./IDCardGenerator";
import GradesManagement from "./GradesManagement";
import EnhancedBulkImport from "../EnhancedBulkImport";

const StudentDashboard = () => {
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
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "students"));
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate comprehensive statistics
      const yearStats = {};
      const sectionStats = {};
      const departmentStats = {};
      const hostelStats = {};
      const transportStats = {};
      let activeCount = 0;
      let inactiveCount = 0;
      let graduatedCount = 0;
      let feePaidCount = 0;
      let feePendingCount = 0;
      let feeOverdueCount = 0;

      students.forEach(student => {
        // Year statistics
        const year = student.Year || 'Unknown';
        yearStats[year] = (yearStats[year] || 0) + 1;

        // Section statistics
        const section = student.Section || 'Unknown';
        sectionStats[section] = (sectionStats[section] || 0) + 1;

        // Department statistics
        const department = student.department || 'Unknown';
        departmentStats[department] = (departmentStats[department] || 0) + 1;

        // Hostel statistics
        const hostel = student.hostelRequired ? 'Required' : 'Not Required';
        hostelStats[hostel] = (hostelStats[hostel] || 0) + 1;

        // Transport statistics
        const transport = student.transportRequired ? 'Required' : 'Not Required';
        transportStats[transport] = (transportStats[transport] || 0) + 1;

        // Status statistics
        const status = student.status || 'active';
        if (status === 'active') activeCount++;
        else if (status === 'inactive') inactiveCount++;
        else if (status === 'graduated') graduatedCount++;

        // Fee statistics
        const feeStatus = student.feeStatus || 'pending';
        if (feeStatus === 'paid') feePaidCount++;
        else if (feeStatus === 'pending') feePendingCount++;
        else if (feeStatus === 'overdue') feeOverdueCount++;
      });

      setStats({
        total: students.length,
        active: activeCount,
        inactive: inactiveCount,
        graduated: graduatedCount,
        byYear: yearStats,
        bySection: sectionStats,
        byDepartment: departmentStats,
        byHostel: hostelStats,
        byTransport: transportStats,
        feeStatus: {
          paid: feePaidCount,
          pending: feePendingCount,
          overdue: feeOverdueCount
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
              case "add-student":
          window.location.href = "/student-registration";
          break;
      case "bulk-import":
        setShowBulkImport(true);
        break;
      case "id-cards":
        setSelectedView("idcards");
        break;
      case "fees":
        setSelectedView("fees");
        break;
      case "grades":
        setSelectedView("grades");
        break;
      case "hostel":
        setSelectedView("hostel");
        break;
      case "transport":
        setSelectedView("transport");
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleBulkImportSuccess = (importedCount) => {
    setShowBulkImport(false);
    fetchDashboardData(); // Refresh the dashboard data
    alert(`Successfully imported ${importedCount} students!`);
  };

  const renderView = () => {
    switch (selectedView) {
      case "overview":
        return (
          <div className="space-y-6">
            <StudentStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentOverview stats={stats.byDepartment} />
              <RecentActivities />
            </div>
          </div>
        );
      case "fees":
        return <FeeOverview stats={stats.feeStatus} />;
      case "hostel":
        return <HostelOverview stats={stats.byHostel} />;
      case "transport":
        return <TransportOverview stats={stats.byTransport} />;
      case "idcards":
        return <IDCardGenerator />;
      case "grades":
        return <GradesManagement />;
      default:
        return <StudentStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:mb-4 mb-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-blue-500 p-2.5 sm:p-3 rounded-full">
                <FontAwesomeIcon icon={faUserGraduate} className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Management Dashboard</h1>
                <p className="text-gray-600 text-sm sm:text-base">Comprehensive university student administration system</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-3 mt-2 lg:mt-0 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/student-registration')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Student</span>
              </button>
              <button 
                onClick={() => setShowBulkImport(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Enhanced Bulk Import</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Overview", icon: faChartBar },
              { id: "fees", label: "Fee Management", icon: faMoneyBillWave },
              { id: "grades", label: "Grades Management", icon: faGraduationCap },
              { id: "hostel", label: "Hostel Management", icon: faHome },
              { id: "transport", label: "Transport Management", icon: faBus },
              { id: "idcards", label: "ID Cards", icon: faIdCard },
              { id: "reports", label: "Reports", icon: faDownload }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedView === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading dashboard data...</span>
            </div>
          ) : (
            renderView()
          )}
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <EnhancedBulkImport
          onClose={() => setShowBulkImport(false)}
          onSuccess={handleBulkImportSuccess}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
