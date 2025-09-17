import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaUsers, 
  FaFileAlt, 
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch assignment statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['assignment-stats', selectedPeriod, selectedCategory],
    queryFn: () => assignmentsApiService.getAssignmentStats({
      period: selectedPeriod,
      category: selectedCategory
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch assignments for category filter
  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApiService.getAssignments(),
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['assignment-categories'],
    queryFn: () => assignmentsApiService.getCategories(),
  });

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 && <FaArrowUp className="h-3 w-3 text-green-500 mr-1" />}
              {trend < 0 && <FaArrowDown className="h-3 w-3 text-red-500 mr-1" />}
              {trend === 0 && <FaMinus className="h-3 w-3 text-gray-500 mr-1" />}
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {Math.abs(trend)}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color = 'bg-blue-500' }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const GradeDistribution = ({ grades }) => {
    if (!grades || grades.length === 0) {
      return (
        <div className="text-center py-8">
          <FaChartPie className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No grade data available</p>
        </div>
      );
    }

    const gradeRanges = [
      { label: 'A (90-100)', min: 90, max: 100, color: 'bg-green-500' },
      { label: 'B (80-89)', min: 80, max: 89, color: 'bg-blue-500' },
      { label: 'C (70-79)', min: 70, max: 79, color: 'bg-yellow-500' },
      { label: 'D (60-69)', min: 60, max: 69, color: 'bg-orange-500' },
      { label: 'F (0-59)', min: 0, max: 59, color: 'bg-red-500' }
    ];

    const distribution = gradeRanges.map(range => {
      const count = grades.filter(grade => grade >= range.min && grade <= range.max).length;
      return { ...range, count, percentage: grades.length > 0 ? (count / grades.length) * 100 : 0 };
    });

    return (
      <div className="space-y-3">
        {distribution.map((range, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${range.color}`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{range.count}</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">({range.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const exportToCSV = () => {
    if (!stats) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Assignments', stats.total_assignments || 0],
      ['Active Assignments', stats.active_assignments || 0],
      ['Total Submissions', stats.total_submissions || 0],
      ['Graded Submissions', stats.graded_submissions || 0],
      ['Pending Grading', stats.pending_grading || 0],
      ['Average Grade', stats.average_grade || 0],
      ['Submission Rate', `${stats.submission_rate || 0}%`],
      ['On-time Submissions', stats.on_time_submissions || 0],
      ['Late Submissions', stats.late_submissions || 0]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Statistics exported successfully');
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Statistics
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statsError.message || 'Failed to load assignment statistics'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assignment Statistics
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive analytics and insights for assignment performance
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaDownload className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Assignments"
              value={stats?.total_assignments || 0}
              icon={FaFileAlt}
              color="bg-blue-500"
              subtitle="All time"
              trend={stats?.assignments_trend}
            />
            <StatCard
              title="Active Assignments"
              value={stats?.active_assignments || 0}
              icon={FaClock}
              color="bg-green-500"
              subtitle="Currently open"
              trend={stats?.active_trend}
            />
            <StatCard
              title="Total Submissions"
              value={stats?.total_submissions || 0}
              icon={FaGraduationCap}
              color="bg-purple-500"
              subtitle="All submissions"
              trend={stats?.submissions_trend}
            />
            <StatCard
              title="Average Grade"
              value={stats?.average_grade ? stats.average_grade.toFixed(1) : 'N/A'}
              icon={FaStar}
              color="bg-yellow-500"
              subtitle="Out of 100"
              trend={stats?.grade_trend}
            />
          </div>
        </div>

        {/* Submission Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submission Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Status</h3>
              <div className="space-y-4">
                <ProgressBar
                  label="Graded Submissions"
                  value={stats?.graded_submissions || 0}
                  max={stats?.total_submissions || 1}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Pending Grading"
                  value={stats?.pending_grading || 0}
                  max={stats?.total_submissions || 1}
                  color="bg-orange-500"
                />
                <ProgressBar
                  label="On-time Submissions"
                  value={stats?.on_time_submissions || 0}
                  max={stats?.total_submissions || 1}
                  color="bg-blue-500"
                />
                <ProgressBar
                  label="Late Submissions"
                  value={stats?.late_submissions || 0}
                  max={stats?.total_submissions || 1}
                  color="bg-red-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission Rate</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.submission_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Rate</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.completion_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Time to Submit</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.avg_submission_time || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade Distribution</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.grade_distribution || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        {stats?.grades && stats.grades.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <GradeDistribution grades={stats.grades} />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <FaFileAlt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.type === 'submission' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : activity.type === 'grade'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {stats?.top_performers && stats.top_performers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                {stats.top_performers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{performer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {performer.submissions} submissions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{performer.average_grade}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentStatistics;









