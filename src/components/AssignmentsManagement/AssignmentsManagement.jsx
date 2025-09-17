import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaList, 
  FaFileAlt, 
  FaClipboardList, 
  FaChartBar, 
  FaGraduationCap,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentsManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch assignment statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['assignment-stats'],
    queryFn: () => assignmentsApiService.getAssignmentStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch recent assignments
  const { data: recentAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['recent-assignments'],
    queryFn: () => assignmentsApiService.getAssignments({ limit: 5 }),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch categories count
  const { data: categories } = useQuery({
    queryKey: ['assignment-categories'],
    queryFn: () => assignmentsApiService.getCategories(),
  });

  // Fetch templates count
  const { data: templates } = useQuery({
    queryKey: ['assignment-templates'],
    queryFn: () => assignmentsApiService.getTemplates(),
  });

  useEffect(() => {
    if (statsError) {
      toast.error('Failed to load assignment statistics');
    }
  }, [statsError]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  const RecentAssignmentItem = ({ assignment }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <FaFileAlt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Due: {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          assignment.status === 'published' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : assignment.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {assignment.status}
        </span>
      </div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assignments Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage assignments, submissions, and grading for your courses
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabButton
              id="overview"
              label="Overview"
              icon={FaChartBar}
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="assignments"
              label="Assignments"
              icon={FaFileAlt}
              isActive={activeTab === 'assignments'}
              onClick={setActiveTab}
            />
            <TabButton
              id="categories"
              label="Categories"
              icon={FaClipboardList}
              isActive={activeTab === 'categories'}
              onClick={setActiveTab}
            />
            <TabButton
              id="templates"
              label="Templates"
              icon={FaList}
              isActive={activeTab === 'templates'}
              onClick={setActiveTab}
            />
            <TabButton
              id="submissions"
              label="Submissions"
              icon={FaGraduationCap}
              isActive={activeTab === 'submissions'}
              onClick={setActiveTab}
            />
            <TabButton
              id="grading"
              label="Grading"
              icon={FaCheckCircle}
              isActive={activeTab === 'grading'}
              onClick={setActiveTab}
            />
            <TabButton
              id="statistics"
              label="Statistics"
              icon={FaChartBar}
              isActive={activeTab === 'statistics'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Assignments"
                value={stats?.total_assignments || 0}
                icon={FaFileAlt}
                color="bg-blue-500"
                subtitle="All time"
              />
              <StatCard
                title="Active Assignments"
                value={stats?.active_assignments || 0}
                icon={FaClock}
                color="bg-green-500"
                subtitle="Currently open"
              />
              <StatCard
                title="Total Submissions"
                value={stats?.total_submissions || 0}
                icon={FaGraduationCap}
                color="bg-purple-500"
                subtitle="All submissions"
              />
              <StatCard
                title="Pending Grading"
                value={stats?.pending_grading || 0}
                icon={FaExclamationTriangle}
                color="bg-orange-500"
                subtitle="Needs attention"
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                  title="Create Assignment"
                  description="Create a new assignment for your students"
                  icon={FaPlus}
                  color="bg-blue-500"
                  onClick={() => setActiveTab('assignments')}
                />
                <QuickActionCard
                  title="Manage Categories"
                  description="Organize assignments by categories"
                  icon={FaClipboardList}
                  color="bg-green-500"
                  onClick={() => setActiveTab('categories')}
                />
                <QuickActionCard
                  title="Create Template"
                  description="Create reusable assignment templates"
                  icon={FaList}
                  color="bg-purple-500"
                  onClick={() => setActiveTab('templates')}
                />
                <QuickActionCard
                  title="View Submissions"
                  description="Review and grade student submissions"
                  icon={FaGraduationCap}
                  color="bg-orange-500"
                  onClick={() => setActiveTab('submissions')}
                />
                <QuickActionCard
                  title="Grade Assignments"
                  description="Grade pending submissions"
                  icon={FaCheckCircle}
                  color="bg-red-500"
                  onClick={() => setActiveTab('grading')}
                />
                <QuickActionCard
                  title="View Statistics"
                  description="Analyze assignment performance"
                  icon={FaChartBar}
                  color="bg-indigo-500"
                  onClick={() => setActiveTab('statistics')}
                />
              </div>
            </div>

            {/* Recent Assignments */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Assignments
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {assignmentsLoading ? (
                  <div className="p-8 text-center">
                    <FaSpinner className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading assignments...</p>
                  </div>
                ) : recentAssignments?.results?.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {recentAssignments.results.map((assignment) => (
                      <RecentAssignmentItem key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaFileAlt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No assignments found</p>
                    <button
                      onClick={() => setActiveTab('assignments')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Your First Assignment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs will be implemented in separate components */}
        {activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="text-6xl text-gray-400 mb-4">
                {activeTab === 'assignments' && <FaFileAlt />}
                {activeTab === 'categories' && <FaClipboardList />}
                {activeTab === 'templates' && <FaList />}
                {activeTab === 'submissions' && <FaGraduationCap />}
                {activeTab === 'grading' && <FaCheckCircle />}
                {activeTab === 'statistics' && <FaChartBar />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This section will be implemented with dedicated components for {activeTab} management.
              </p>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsManagement;

