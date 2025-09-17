import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { departmentApiService } from '../../services/departmentApiService';
import { programsApiService } from '../../services/programsApiService';
import { 
  FaPlay, 
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaExclamationTriangle,
  FaBook,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaClipboardList,
  FaCheckCircle,
  FaGraduationCap
} from 'react-icons/fa';

const AcademicApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Test API Connection',
      method: 'GET',
      endpoint: '/courses/',
      test: () => academicApiService.getCourses({ page_size: 5 }),
      icon: FaBook,
      description: 'Test basic connection to academic API'
    },
    {
      name: 'Get Courses',
      method: 'GET',
      endpoint: '/courses/',
      test: () => academicApiService.getCourses({ page_size: 10 }),
      icon: FaBook,
      description: 'Fetch courses list'
    },
    {
      name: 'Get Course Statistics',
      method: 'GET',
      endpoint: '/courses/statistics/',
      test: () => academicApiService.getCourseStatistics(),
      icon: FaBook,
      description: 'Get course statistics'
    },
    {
      name: 'Create Test Course',
      method: 'POST',
      endpoint: '/courses/',
      test: () => academicApiService.createCourse({
        code: 'TEST101',
        title: 'Test Course',
        description: 'This is a test course created by the API test',
        level: 'UG',
        credits: 3,
        duration_weeks: 16,
        max_students: 50,
        department: 1,
        programs: [1, 2],
        status: 'ACTIVE'
      }),
      icon: FaBook,
      description: 'Create a test course'
    },
    {
      name: 'Get Departments',
      method: 'GET',
      endpoint: '/departments/',
      test: () => departmentApiService.getDepartments({ page_size: 10 }),
      icon: FaBuilding,
      description: 'Fetch departments for course form'
    },
    {
      name: 'Get Programs',
      method: 'GET',
      endpoint: '/programs/',
      test: () => programsApiService.getPrograms({ page_size: 10 }),
      icon: FaGraduationCap,
      description: 'Fetch programs for course form'
    },
    {
      name: 'Get Course Sections',
      method: 'GET',
      endpoint: '/course-sections/',
      test: () => academicApiService.getCourseSections({ page_size: 5 }),
      icon: FaUsers,
      description: 'Fetch course sections'
    },
    {
      name: 'Get Enrollments',
      method: 'GET',
      endpoint: '/enrollments/',
      test: () => academicApiService.getEnrollments({ page_size: 5 }),
      icon: FaGraduationCap,
      description: 'Fetch course enrollments'
    },
    {
      name: 'Get Timetables',
      method: 'GET',
      endpoint: '/timetables/',
      test: () => academicApiService.getTimetables({ page_size: 5 }),
      icon: FaCalendarAlt,
      description: 'Fetch timetables'
    },
    {
      name: 'Get Syllabi',
      method: 'GET',
      endpoint: '/syllabi/',
      test: () => academicApiService.getSyllabi({ page_size: 5 }),
      icon: FaFileAlt,
      description: 'Fetch syllabi'
    },
    {
      name: 'Get Syllabus Topics',
      method: 'GET',
      endpoint: '/syllabus-topics/',
      test: () => academicApiService.getSyllabusTopics({ page_size: 5 }),
      icon: FaClipboardList,
      description: 'Fetch syllabus topics'
    },
    {
      name: 'Get Batch Enrollments',
      method: 'GET',
      endpoint: '/batch-enrollments/',
      test: () => academicApiService.getBatchEnrollments({ page_size: 5 }),
      icon: FaUsers,
      description: 'Fetch batch enrollments'
    },
    {
      name: 'Get Course Prerequisites',
      method: 'GET',
      endpoint: '/course-prerequisites/',
      test: () => academicApiService.getCoursePrerequisites({ page_size: 5 }),
      icon: FaCheckCircle,
      description: 'Fetch course prerequisites'
    },
    {
      name: 'Get Academic Calendar',
      method: 'GET',
      endpoint: '/academic-calendar/',
      test: () => academicApiService.getAcademicCalendar({ page_size: 5 }),
      icon: FaCalendarAlt,
      description: 'Fetch academic calendar events'
    }
  ];

  const runTest = async (endpoint) => {
    setLoading(true);
    try {
      const result = await endpoint.test();
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'success',
          data: result,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    const results = {};
    
    for (const endpoint of testEndpoints) {
      try {
        const result = await endpoint.test();
        results[endpoint.name] = {
          status: 'success',
          data: result,
          timestamp: new Date().toLocaleTimeString()
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        };
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheck className="h-4 w-4 text-green-500" />;
      case 'error':
        return <FaTimes className="h-4 w-4 text-red-500" />;
      default:
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Academic API Endpoints Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Test all academic module API endpoints to verify connectivity
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FaPlay className="h-4 w-4 mr-2" />
              )}
              Run All Tests
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testEndpoints.map((endpoint) => {
              const result = testResults[endpoint.name];
              const IconComponent = endpoint.icon;
              
              return (
                <div
                  key={endpoint.name}
                  className={`border rounded-lg p-4 transition-all ${getStatusColor(result?.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {endpoint.name}
                      </h3>
                    </div>
                    {result && getStatusIcon(result.status)}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {endpoint.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {endpoint.method} {endpoint.endpoint}
                    </span>
                  </div>

                  {result && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Status: {result.status}</span>
                        <span>{result.timestamp}</span>
                      </div>
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                          {result.error}
                        </div>
                      )}
                      {result.data && (
                        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300">
                          {Array.isArray(result.data) 
                            ? `${result.data.length} items returned`
                            : result.data.results 
                              ? `${result.data.results.length} items returned`
                              : 'Data returned successfully'
                          }
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => runTest(endpoint)}
                    disabled={loading}
                    className="w-full mt-3 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test Endpoint
                  </button>
                </div>
              );
            })}
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Test Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(testResults).filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {testEndpoints.length - Object.keys(testResults).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Not Tested</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicApiTest;
