import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faChartBar,
  faChartPie,
  faUsers,
  faTrophy,
  faArrowUp,
  faArrowDown,
  faMinus,
  faCalendarAlt,
  faFilter,
  faDownload,
  faEye,
  faEdit,
  faStar,
  faAward,
  faGraduationCap,
  faBookOpen,
  faCog,
  faFileAlt,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import usePerformanceManagement from '../../hooks/usePerformanceManagement';

const PerformanceDashboard = () => {
  const {
    performanceRecords,
    performanceReviews,
    performanceMetrics,
    facultyList,
    loading,
    error,
    getPerformanceStats,
    filterPerformanceRecords,
    getFacultyPerformanceHistory
  } = usePerformanceManagement();

  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison

  const stats = getPerformanceStats();
  const filteredRecords = filterPerformanceRecords({
    department: selectedDepartment,
    year: selectedTimeframe === 'current' ? new Date().getFullYear() : null
  });

  // Calculate performance trends
  const getPerformanceTrends = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearRecords = performanceRecords.filter(r => r.academic_year === currentYear);
    const lastYearRecords = performanceRecords.filter(r => r.academic_year === lastYear);
    
    const currentAvg = currentYearRecords.length > 0 
      ? currentYearRecords.reduce((sum, r) => sum + (r.overall_score || 0), 0) / currentYearRecords.length
      : 0;
    
    const lastAvg = lastYearRecords.length > 0
      ? lastYearRecords.reduce((sum, r) => sum + (r.overall_score || 0), 0) / lastYearRecords.length
      : 0;
    
    const trend = currentAvg - lastAvg;
    
    return {
      current: Math.round(currentAvg * 10) / 10,
      previous: Math.round(lastAvg * 10) / 10,
      trend: Math.round(trend * 10) / 10,
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
  };

  const trends = getPerformanceTrends();

  // Get top performers
  const getTopPerformers = () => {
    return filteredRecords
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5);
  };

  const topPerformers = getTopPerformers();

  // Get departments with performance data
  const getDepartments = () => {
    const departments = new Set();
    performanceRecords.forEach(record => {
      const dept = record.department || record.faculty?.department;
      if (dept) departments.add(dept);
    });
    return Array.from(departments);
  };

  const departments = getDepartments();

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <FontAwesomeIcon icon={icon} className="text-white text-xl" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <FontAwesomeIcon 
            icon={trend.direction === 'up' ? faArrowUp : trend.direction === 'down' ? faArrowDown : faMinus}
            className={`text-sm mr-1 ${
              trend.direction === 'up' ? 'text-green-500' : 
              trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}
          />
          <span className={`text-sm font-medium ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {Math.abs(trend.value)} points from last year
          </span>
        </div>
      )}
    </div>
  );

  const PerformanceChart = () => {
    const scoreRanges = [
      { range: '9-10', label: 'Excellent', color: 'bg-green-500', count: 0 },
      { range: '8-8.9', label: 'Very Good', color: 'bg-blue-500', count: 0 },
      { range: '7-7.9', label: 'Good', color: 'bg-yellow-500', count: 0 },
      { range: '6-6.9', label: 'Satisfactory', color: 'bg-orange-500', count: 0 },
      { range: '0-5.9', label: 'Needs Improvement', color: 'bg-red-500', count: 0 }
    ];

    filteredRecords.forEach(record => {
      const score = record.overall_score || 0;
      if (score >= 9) scoreRanges[0].count++;
      else if (score >= 8) scoreRanges[1].count++;
      else if (score >= 7) scoreRanges[2].count++;
      else if (score >= 6) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    const maxCount = Math.max(...scoreRanges.map(r => r.count));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
        <div className="space-y-3">
          {scoreRanges.map((range, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600">{range.range}</div>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${range.color}`}
                    style={{ width: maxCount > 0 ? `${(range.count / maxCount) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm text-gray-900 text-right">{range.count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DepartmentComparison = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
      <div className="space-y-4">
        {Object.entries(stats.departmentStats).map(([dept, deptStats]) => (
          <div key={dept} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">{dept}</span>
                <span className="text-gray-600">{deptStats.averageScore}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${
                    deptStats.averageScore >= 8 ? 'bg-green-500' :
                    deptStats.averageScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(deptStats.averageScore / 10) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{deptStats.count} records</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TopPerformersList = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
      <div className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">
                  {performer.faculty_name || `${performer.faculty?.first_name} ${performer.faculty?.last_name}`}
                </p>
                <p className="text-sm text-gray-600">{performer.department || performer.faculty?.department}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{performer.overall_score}/10</p>
              <p className="text-sm text-gray-600">{performer.academic_year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading performance dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Comprehensive view of faculty performance metrics and trends</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Year</option>
            <option value="all">All Time</option>
            <option value="last3">Last 3 Years</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value={stats.totalRecords}
          icon={faFileAlt}
          color="bg-blue-500"
          subtitle={`${filteredRecords.length} filtered`}
        />
        <StatCard
          title="Average Score"
          value={stats.averageScore}
          icon={faChartLine}
          color="bg-green-500"
          trend={{ direction: trends.trendDirection, value: Math.abs(trends.trend) }}
        />
        <StatCard
          title="Completed Reviews"
          value={stats.statusDistribution.completed}
          icon={faCheckCircle}
          color="bg-purple-500"
          subtitle={`${stats.totalReviews} total reviews`}
        />
        <StatCard
          title="Top Performers"
          value={stats.scoreDistribution.excellent}
          icon={faTrophy}
          color="bg-yellow-500"
          subtitle="Score ≥ 80"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution Chart */}
        <PerformanceChart />

        {/* Department Comparison */}
        <DepartmentComparison />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="lg:col-span-2">
          <TopPerformersList />
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {performanceMetrics.slice(0, 5).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{metric.name}</p>
                  <p className="text-sm text-gray-600">{metric.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{metric.weight}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{trends.current}</div>
            <div className="text-sm text-gray-600">Current Year Average</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{trends.previous}</div>
            <div className="text-sm text-gray-600">Previous Year Average</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold flex items-center justify-center ${
              trends.trendDirection === 'up' ? 'text-green-600' : 
              trends.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <FontAwesomeIcon 
                icon={trends.trendDirection === 'up' ? faArrowUp : trends.trendDirection === 'down' ? faArrowDown : faMinus}
                className="mr-2"
              />
              {Math.abs(trends.trend)}
            </div>
            <div className="text-sm text-gray-600">Change (points)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
