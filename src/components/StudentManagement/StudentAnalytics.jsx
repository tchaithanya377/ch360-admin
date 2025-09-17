import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, faChartBar, faChartPie, faUsers, faGraduationCap,
  faCalendarAlt, faMapMarkerAlt, faEnvelope, faPhone, faUserGraduate,
  faArrowTrendUp, faArrowTrendDown, faEquals, faEye, faDownload,
  faFilter, faSearch, faArrowsRotate, faCalendarCheck, faClock, faCheckCircle, faKey
} from "@fortawesome/free-solid-svg-icons";

const StudentAnalytics = ({ students }) => {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("bar");

  // Calculate analytics data
  const calculateAnalytics = () => {
    let filteredStudents = students;

    // Apply filters
    if (selectedYear !== "all") {
      filteredStudents = filteredStudents.filter(s => s.year === selectedYear);
    }
    if (selectedDepartment !== "all") {
      filteredStudents = filteredStudents.filter(s => s.department === selectedDepartment);
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      let cutoffDate;
      switch (timeRange) {
        case "30days":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1year":
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      filteredStudents = filteredStudents.filter(s => {
        const admissionDate = s.admissionDate || s.createdAt;
        return admissionDate && new Date(admissionDate) >= cutoffDate;
      });
    }

    // Department distribution
    const departmentStats = {};
    filteredStudents.forEach(student => {
      const dept = student.department || "Unknown";
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // Year distribution
    const yearStats = {};
    filteredStudents.forEach(student => {
      const year = student.year || "Unknown";
      yearStats[year] = (yearStats[year] || 0) + 1;
    });

    // Gender distribution
    const genderStats = {};
    filteredStudents.forEach(student => {
      const gender = student.gender || "Unknown";
      genderStats[gender] = (genderStats[gender] || 0) + 1;
    });

    // Status distribution
    const statusStats = {};
    filteredStudents.forEach(student => {
      const status = student.status || "Unknown";
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    // Monthly admissions
    const monthlyStats = {};
    filteredStudents.forEach(student => {
      const admissionDate = student.admissionDate || student.createdAt;
      if (admissionDate) {
        const month = new Date(admissionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      }
    });

    // Email verification stats
    const emailVerified = filteredStudents.filter(s => s.emailVerified).length;
    const emailNotVerified = filteredStudents.length - emailVerified;

    // Login credentials stats
    const hasLoginCredentials = filteredStudents.filter(s => s.hasLoginCredentials).length;
    const noLoginCredentials = filteredStudents.length - hasLoginCredentials;

    return {
      totalStudents: filteredStudents.length,
      departmentStats,
      yearStats,
      genderStats,
      statusStats,
      monthlyStats,
      emailVerified,
      emailNotVerified,
      hasLoginCredentials,
      noLoginCredentials,
      filteredStudents
    };
  };

  const analytics = calculateAnalytics();

  // Get unique years and departments for filters
  const uniqueYears = [...new Set(students.map(s => s.year))].filter(Boolean).sort();
  const uniqueDepartments = [...new Set(students.map(s => s.department))].filter(Boolean).sort();

  // Export analytics data
  const exportAnalytics = () => {
    const csvContent = [
      "Metric,Value",
      `Total Students,${analytics.totalStudents}`,
      `Email Verified,${analytics.emailVerified}`,
      `Email Not Verified,${analytics.emailNotVerified}`,
      `Has Login Credentials,${analytics.hasLoginCredentials}`,
      `No Login Credentials,${analytics.noLoginCredentials}`,
      "",
      "Department,Count",
      ...Object.entries(analytics.departmentStats).map(([dept, count]) => `${dept},${count}`),
      "",
      "Year,Count",
      ...Object.entries(analytics.yearStats).map(([year, count]) => `${year},${count}`),
      "",
      "Gender,Count",
      ...Object.entries(analytics.genderStats).map(([gender, count]) => `${gender},${count}`),
      "",
      "Status,Count",
      ...Object.entries(analytics.statusStats).map(([status, count]) => `${status},${count}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faChartLine} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Analytics</h2>
            <p className="text-gray-600">Comprehensive insights and analytics about student data</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportAnalytics}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email Verified</p>
              <p className="text-3xl font-bold text-green-600">{analytics.emailVerified}</p>
              <p className="text-xs text-gray-500">
                {analytics.totalStudents > 0 ? Math.round((analytics.emailVerified / analytics.totalStudents) * 100) : 0}% of total
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Has Login Credentials</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.hasLoginCredentials}</p>
              <p className="text-xs text-gray-500">
                {analytics.totalStudents > 0 ? Math.round((analytics.hasLoginCredentials / analytics.totalStudents) * 100) : 0}% of total
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faUserGraduate} className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.statusStats.active || 0}</p>
              <p className="text-xs text-gray-500">
                {analytics.totalStudents > 0 ? Math.round(((analytics.statusStats.active || 0) / analytics.totalStudents) * 100) : 0}% of total
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.departmentStats)
              .sort(([,a], [,b]) => b - a)
              .map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{dept}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Year Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Year Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.yearStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([year, count]) => (
                <div key={year} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{year}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.genderStats).map(([gender, count]) => (
              <div key={gender} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{gender}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'active' ? 'bg-green-600' : 
                        status === 'inactive' ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                      style={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FontAwesomeIcon icon={faUserGraduate} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">New Admissions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.filteredStudents.filter(s => {
                    const admissionDate = s.admissionDate || s.createdAt;
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return admissionDate && new Date(admissionDate) > thirtyDaysAgo;
                  }).length}
                </p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <FontAwesomeIcon icon={faEnvelope} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email Verified</p>
                <p className="text-2xl font-bold text-green-600">{analytics.emailVerified}</p>
                <p className="text-xs text-gray-500">Students with verified emails</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <FontAwesomeIcon icon={faKey} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Login Credentials</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.hasLoginCredentials}</p>
                <p className="text-xs text-gray-500">Students with login access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{Object.keys(analytics.departmentStats).length}</p>
            <p className="text-sm text-gray-600">Departments</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{Object.keys(analytics.yearStats).length}</p>
            <p className="text-sm text-gray-600">Academic Years</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {analytics.totalStudents > 0 ? Math.round((analytics.emailVerified / analytics.totalStudents) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Email Verification Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
