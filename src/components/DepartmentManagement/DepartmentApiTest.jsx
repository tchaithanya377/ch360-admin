import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faCheck, faTimes, faSpinner, faExclamationTriangle,
  faBuilding, faCogs, faBullhorn, faCalendar, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const testEndpoints = [
    {
      name: 'Test API Connection',
      method: 'GET',
      endpoint: '/departments/',
      test: () => departmentApiService.testApiConnection(),
      icon: faBuilding
    },
    {
      name: 'Get Departments',
      method: 'GET',
      endpoint: '/departments/',
      test: () => departmentApiService.getDepartments({ page_size: 5 }),
      icon: faBuilding
    },
    {
      name: 'Create Test Department',
      method: 'POST',
      endpoint: '/departments/',
      test: () => departmentApiService.createDepartment({
        name: 'Test Department',
        code: 'TEST001',
        department_type: 'ACADEMIC',
        email: 'test@university.edu',
        phone: '+1-555-0123'
      }),
      icon: faBuilding
    },
    {
      name: 'Get Department Stats',
      method: 'GET',
      endpoint: '/departments/stats/',
      test: () => departmentApiService.getDepartmentStats(),
      icon: faBuilding
    },
    {
      name: 'Search Departments',
      method: 'POST',
      endpoint: '/departments/search/',
      test: () => departmentApiService.searchDepartments({ search: 'test' }),
      icon: faBuilding
    },
    {
      name: 'Get Resources',
      method: 'GET',
      endpoint: '/departments/resources/',
      test: () => departmentApiService.getResources({ page_size: 5 }),
      icon: faCogs
    },
    {
      name: 'Get Announcements',
      method: 'GET',
      endpoint: '/departments/announcements/',
      test: () => departmentApiService.getAnnouncements({ page_size: 5 }),
      icon: faBullhorn
    },
    {
      name: 'Get Events',
      method: 'GET',
      endpoint: '/departments/events/',
      test: () => departmentApiService.getEvents({ page_size: 5 }),
      icon: faCalendar
    },
    {
      name: 'Get Documents',
      method: 'GET',
      endpoint: '/departments/documents/',
      test: () => departmentApiService.getDocuments({ page_size: 5 }),
      icon: faFileAlt
    }
  ];

  const runSingleTest = async (test) => {
    setTestResults(prev => ({
      ...prev,
      [test.name]: { status: 'running', message: 'Testing...' }
    }));

    try {
      const startTime = Date.now();
      const result = await test.test();
      const endTime = Date.now();
      const duration = endTime - startTime;

      setTestResults(prev => ({
        ...prev,
        [test.name]: {
          status: 'success',
          message: `Success (${duration}ms)`,
          data: result
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.name]: {
          status: 'error',
          message: error.message || 'Unknown error',
          error: error
        }
      }));
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTestResults({});

    for (const test of testEndpoints) {
      await runSingleTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimes} className="text-red-500" />;
      case 'running':
        return <FontAwesomeIcon icon={faSpinner} className="text-blue-500 animate-spin" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department API Test Suite</h1>
              <p className="text-gray-600">Test all department management API endpoints</p>
            </div>
            <button
              onClick={runAllTests}
              disabled={running}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Running Tests...
                </div>
              ) : (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Run All Tests
                </div>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {testEndpoints.map((test) => {
              const result = testResults[test.name];
              return (
                <div
                  key={test.name}
                  className={`border rounded-lg p-4 ${getStatusColor(result?.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={test.icon} className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600">
                          {test.method} {test.endpoint}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {result && (
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-2 text-sm font-medium">
                            {result.message}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => runSingleTest(test)}
                        disabled={running}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                  
                  {result?.error && (
                    <div className="mt-3 p-3 bg-red-100 rounded text-sm text-red-700">
                      <strong>Error:</strong> {result.error.message}
                    </div>
                  )}
                  
                  {result?.data && (
                    <div className="mt-3 p-3 bg-green-100 rounded text-sm">
                      <strong>Response:</strong> {JSON.stringify(result.data, null, 2).substring(0, 200)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(testResults).filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(testResults).filter(r => r.status === 'running').length}
                  </div>
                  <div className="text-gray-600">Running</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentApiTest;
