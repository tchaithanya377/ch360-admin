import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIcon, getTrendIcon } from '../../utils/iconValidator';

const GradeAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('passRate');

  const [analyticsData, setAnalyticsData] = useState({
    overallStats: {
      totalStudents: 1250,
      averageCGPA: 7.8,
      passRate: 92.5,
      topperCGPA: 9.8,
      averageAttendance: 94.2
    },
    departmentStats: [
      {
        name: 'Computer Science',
        totalStudents: 320,
        averageCGPA: 8.1,
        passRate: 94.2,
        topperCGPA: 9.8,
        courses: 24
      },
      {
        name: 'Electrical Engineering',
        totalStudents: 280,
        averageCGPA: 7.9,
        passRate: 91.8,
        topperCGPA: 9.6,
        courses: 22
      },
      {
        name: 'Mechanical Engineering',
        totalStudents: 250,
        averageCGPA: 7.6,
        passRate: 89.5,
        topperCGPA: 9.4,
        courses: 20
      },
      {
        name: 'Civil Engineering',
        totalStudents: 200,
        averageCGPA: 7.7,
        passRate: 90.2,
        topperCGPA: 9.5,
        courses: 18
      }
    ],
    gradeDistribution: [
      { grade: 'A+', count: 45, percentage: 3.6 },
      { grade: 'A', count: 180, percentage: 14.4 },
      { grade: 'B+', count: 320, percentage: 25.6 },
      { grade: 'B', count: 280, percentage: 22.4 },
      { grade: 'C+', count: 200, percentage: 16.0 },
      { grade: 'C', count: 120, percentage: 9.6 },
      { grade: 'D', count: 45, percentage: 3.6 },
      { grade: 'F', count: 60, percentage: 4.8 }
    ],
    trendData: [
      { semester: 'Sem 1', averageCGPA: 7.5, passRate: 90.2 },
      { semester: 'Sem 2', averageCGPA: 7.7, passRate: 91.5 },
      { semester: 'Sem 3', averageCGPA: 7.8, passRate: 92.1 },
      { semester: 'Sem 4', averageCGPA: 7.9, passRate: 92.8 },
      { semester: 'Sem 5', averageCGPA: 8.0, passRate: 93.2 },
      { semester: 'Sem 6', averageCGPA: 8.1, passRate: 93.8 }
    ],
    topPerformers: [
      { rank: 1, studentId: '23CS001', name: 'John Doe', cgpa: 9.8, department: 'Computer Science' },
      { rank: 2, studentId: '23EE002', name: 'Sarah Wilson', cgpa: 9.6, department: 'Electrical Engineering' },
      { rank: 3, studentId: '23ME003', name: 'Michael Brown', cgpa: 9.4, department: 'Mechanical Engineering' },
      { rank: 4, studentId: '23CS004', name: 'Emily Davis', cgpa: 9.3, department: 'Computer Science' },
      { rank: 5, studentId: '23EE005', name: 'David Johnson', cgpa: 9.2, department: 'Electrical Engineering' }
    ],
    coursePerformance: [
      { code: 'CS301', name: 'Data Structures', averageMarks: 78.5, passRate: 94.2, totalStudents: 45 },
      { code: 'EE201', name: 'Electrical Circuits', averageMarks: 75.2, passRate: 91.8, totalStudents: 38 },
      { code: 'ME301', name: 'Thermodynamics', averageMarks: 72.8, passRate: 89.5, totalStudents: 25 },
      { code: 'CS302', name: 'Computer Networks', averageMarks: 80.1, passRate: 96.0, totalStudents: 42 },
      { code: 'EE202', name: 'Digital Electronics', averageMarks: 77.3, passRate: 93.1, totalStudents: 35 }
    ]
  });

  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'NAAC Accreditation Report',
      description: 'Comprehensive report for NAAC accreditation',
      generatedDate: '2024-03-15T10:30:00',
      status: 'generated',
      type: 'accreditation',
      downloadCount: 5
    },
    {
      id: 2,
      name: 'NBA Compliance Report',
      description: 'NBA compliance and program outcomes report',
      generatedDate: '2024-03-14T16:00:00',
      status: 'generated',
      type: 'compliance',
      downloadCount: 3
    },
    {
      id: 3,
      name: 'Academic Performance Analysis',
      description: 'Detailed academic performance analysis',
      generatedDate: '2024-03-13T12:00:00',
      status: 'generated',
      type: 'analysis',
      downloadCount: 8
    }
  ]);

  const getMetricColor = (metric, value) => {
    if (metric === 'passRate') {
      if (value >= 90) return 'text-green-600 dark:text-green-400';
      if (value >= 80) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    if (metric === 'averageCGPA') {
      if (value >= 8.0) return 'text-green-600 dark:text-green-400';
      if (value >= 7.0) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600 dark:text-green-400';
    if (current < previous) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateReport = (type) => {
    const newReport = {
      id: Date.now(),
      name: `${type} Report - ${new Date().toLocaleDateString()}`,
      description: `Generated ${type} report`,
      generatedDate: new Date().toISOString(),
      status: 'generated',
      type: type,
      downloadCount: 0
    };
    setReports([newReport, ...reports]);
  };

  const filteredDepartmentStats = selectedDepartment === 'all' 
    ? analyticsData.departmentStats 
    : analyticsData.departmentStats.filter(dept => dept.name === selectedDepartment);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Grade Analytics Dashboard</h2>
            <p className="text-purple-100 text-lg">Comprehensive analytics and reporting for accreditation</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={getIcon('faChartPie')} className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => generateReport('NAAC')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={getIcon('faChartLine')} />
          <span>Generate NAAC Report</span>
        </button>
        <button
          onClick={() => generateReport('NBA')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={getIcon('faChartBar')} />
          <span>Generate NBA Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="current">Current Semester</option>
              <option value="last">Last Semester</option>
              <option value="year">Academic Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Departments</option>
              {analyticsData.departmentStats.map(dept => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="passRate">Pass Rate</option>
              <option value="averageCGPA">Average CGPA</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
              <FontAwesomeIcon icon={getIcon('faDownload')} className="mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={getIcon('faUserGraduate')} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overallStats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <FontAwesomeIcon icon={getIcon('faCalculator')} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average CGPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overallStats.averageCGPA}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <FontAwesomeIcon icon={getIcon('faCheckCircle')} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overallStats.passRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <FontAwesomeIcon icon={getIcon('faTrophy')} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Topper CGPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overallStats.topperCGPA}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={getIcon('faClock')} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overallStats.averageAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Department Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredDepartmentStats.map((dept, index) => (
                <div key={dept.name} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{dept.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{dept.totalStudents} students</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getMetricColor(selectedMetric, dept[selectedMetric])}`}>
                        {selectedMetric === 'passRate' ? `${dept.passRate}%` : dept.averageCGPA}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {selectedMetric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Average CGPA</p>
                      <p className="font-medium text-gray-900 dark:text-white">{dept.averageCGPA}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Pass Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">{dept.passRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Topper CGPA</p>
                      <p className="font-medium text-gray-900 dark:text-white">{dept.topperCGPA}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Grade Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analyticsData.gradeDistribution.map((grade) => (
                <div key={grade.grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-900 dark:text-white">
                      {grade.grade}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{grade.count} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${grade.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{grade.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Performance Trends</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.trendData.map((trend, index) => {
                const previous = index > 0 ? analyticsData.trendData[index - 1] : null;
                return (
                  <div key={trend.semester} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{trend.semester}</h4>
                      {previous && (
                        <FontAwesomeIcon 
                          icon={getTrendIcon(trend.averageCGPA, previous.averageCGPA)} 
                          className={`text-sm ${getTrendColor(trend.averageCGPA, previous.averageCGPA)}`} 
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Average CGPA</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trend.averageCGPA}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Pass Rate</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trend.passRate}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Top Performers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analyticsData.topPerformers.map((performer) => (
                <div key={performer.studentId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      performer.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      performer.rank === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                      performer.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    }`}>
                      {performer.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{performer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{performer.studentId} - {performer.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{performer.cgpa}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CGPA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Course Performance</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Marks</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pass Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.coursePerformance.map((course) => (
                  <tr key={course.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{course.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{course.averageMarks.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{course.passRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{course.totalStudents}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.passRate >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        course.passRate >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {course.passRate >= 90 ? 'Excellent' :
                         course.passRate >= 80 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Generated Reports</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Generated: {formatDate(report.generatedDate)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {report.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {report.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Downloads: {report.downloadCount}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      <FontAwesomeIcon icon={getIcon('faDownload')} className="mr-1" />
                      Download
                    </button>
                    <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium">
                      <FontAwesomeIcon icon={getIcon('faEye')} className="mr-1" />
                      Preview
                    </button>
                    <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                      <FontAwesomeIcon icon={getIcon('faTrash')} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeAnalytics;
