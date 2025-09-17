import React from "react";

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Research Analytics & Reporting</h2>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive analytics for outputs, funding utilization, impact metrics, and automated NAAC/NBA/NIRF reports</p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">156</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Publications</h3>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">+12%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹2.4M</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Funding</h3>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">+8%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">89</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</h3>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-blue-600 dark:text-blue-400">+5%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">4.2</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Impact Factor</h3>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">+0.3</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Research Analytics Dashboard</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Publications Trend */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publications Trend</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Q1 Publications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Q2 Publications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">52</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Q3 Publications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">38</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Q4 Publications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">21</span>
                </div>
              </div>
            </div>

            {/* Funding Utilization */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Funding Utilization</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Research Grants</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Equipment</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">65%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Travel & Conferences</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">42%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Publications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">91%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h4>
            <div className="flex flex-wrap gap-3">
              <button className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Generate NAAC Report
              </button>
              <button className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Export Analytics
              </button>
              <button className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                View NIRF Data
              </button>
              <button className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Impact Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;


