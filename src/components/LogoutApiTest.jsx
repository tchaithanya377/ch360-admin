import React, { useState } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import djangoAuthService from '../utils/djangoAuthService';

const LogoutApiTest = () => {
  const { logout, isAuthenticated, user } = useDjangoAuth();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runLogoutTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check authentication status
      addTestResult(
        'Authentication Check',
        'info',
        `User authenticated: ${isAuthenticated}`,
        { user, isAuthenticated }
      );

      // Test 2: Check token presence
      const token = djangoAuthService.getToken();
      addTestResult(
        'Token Check',
        token ? 'success' : 'warning',
        token ? 'Access token found' : 'No access token found',
        { hasToken: !!token }
      );

      // Test 3: Test logout API call directly
      if (token) {
        try {
          addTestResult(
            'Direct API Test',
            'info',
            'Testing direct API call to /accounts/logout/'
          );

          const response = await djangoAuthService.makeRequest('/accounts/logout/', {
            method: 'POST',
          });

          addTestResult(
            'Direct API Response',
            response.ok ? 'success' : 'error',
            `API call ${response.ok ? 'successful' : 'failed'} - Status: ${response.status}`,
            { status: response.status, statusText: response.statusText }
          );

          if (response.ok) {
            try {
              const responseData = await response.json();
              addTestResult(
                'API Response Data',
                'success',
                'Logout API returned data',
                responseData
              );
            } catch (e) {
              addTestResult(
                'API Response Data',
                'info',
                'Logout API returned empty response (expected)'
              );
            }
          }
        } catch (error) {
          addTestResult(
            'Direct API Test',
            'error',
            `API call failed: ${error.message}`,
            error
          );
        }
      }

      // Test 4: Test context logout
      try {
        addTestResult(
          'Context Logout Test',
          'info',
          'Testing logout through DjangoAuthContext'
        );

        const logoutResult = await logout();

        addTestResult(
          'Context Logout Result',
          logoutResult.success ? 'success' : 'error',
          logoutResult.success ? 'Context logout successful' : `Context logout failed: ${logoutResult.error}`,
          logoutResult
        );
      } catch (error) {
        addTestResult(
          'Context Logout Test',
          'error',
          `Context logout error: ${error.message}`,
          error
        );
      }

      // Test 5: Verify token cleanup
      const tokenAfterLogout = djangoAuthService.getToken();
      addTestResult(
        'Token Cleanup Check',
        !tokenAfterLogout ? 'success' : 'error',
        !tokenAfterLogout ? 'Token successfully cleared' : 'Token still present after logout',
        { tokenCleared: !tokenAfterLogout }
      );

      // Test 6: Check authentication state
      addTestResult(
        'Final Auth State',
        'info',
        `Authentication state after logout: ${isAuthenticated}`,
        { isAuthenticated }
      );

    } catch (error) {
      addTestResult(
        'Test Suite Error',
        'error',
        `Test suite failed: ${error.message}`,
        error
      );
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Logout API Test Suite</h1>
          <p className="text-blue-100 mt-1">Test the POST /api/accounts/logout/ endpoint functionality</p>
        </div>

        {/* Controls */}
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={runLogoutTests}
              disabled={isRunning}
              className={`px-6 py-2 rounded-md text-white font-medium transition ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Running Tests...' : 'Run Logout Tests'}
            </button>
            
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Results
            </button>
          </div>

          {/* Current State */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Current Authentication State</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Authenticated:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Has Token:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  djangoAuthService.getToken() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {djangoAuthService.getToken() ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">User:</span>
                <span className="ml-2 text-gray-600">
                  {user?.email || user?.username || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6">
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No test results yet. Click "Run Logout Tests" to start testing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{result.test}</h4>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer hover:text-gray-700">
                              View Details
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Endpoint Info */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <h3 className="font-medium text-gray-900 mb-2">API Endpoint Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Endpoint:</strong> POST /api/accounts/logout/</p>
            <p><strong>Base URL:</strong> {import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://campushub-backend1.onrender.com'}</p>
            <p><strong>Full URL:</strong> {import.meta.env.DEV ? 'http://127.0.0.1:8000/api/accounts/logout/' : 'https://campushub-backend1.onrender.com/api/accounts/logout/'}</p>
            <p><strong>Authentication:</strong> Bearer Token (JWT)</p>
            <p><strong>Expected Response:</strong> 200 OK (empty body or success message)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutApiTest;
