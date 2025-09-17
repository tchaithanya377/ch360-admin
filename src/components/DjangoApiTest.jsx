import React, { useState } from 'react';
import djangoAuthService from '../utils/djangoAuthService';
import { makeDjangoRequest, handleDjangoResponse } from '../utils/djangoAuthHelpers';
import { DJANGO_BASE_URL } from '../config/apiConfig.js';

const DjangoApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testDjangoConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('Testing Django API connection...', 'info');
      
      // Test basic connection
      const response = await fetch(`${DJANGO_BASE_URL}/accounts/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
        }),
      });

      if (response.ok) {
        addResult('✅ Django API is reachable and responding', 'success');
      } else {
        addResult(`⚠️ Django API responded with status: ${response.status}`, 'warning');
        const errorData = await response.json();
        addResult(`Error details: ${JSON.stringify(errorData)}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Failed to connect to Django API: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    
    try {
      addResult('Testing Django login...', 'info');
      
      // You can replace these with actual test credentials
      const result = await djangoAuthService.login('admin@gmail.com', 'password');
      
      if (result.success) {
        addResult('✅ Django login successful', 'success');
        addResult(`User: ${JSON.stringify(result.user)}`, 'info');
        
        // Check admin privileges
        const isAdmin = result.user?.is_staff || result.user?.is_superuser;
        addResult(`Admin privileges: ${isAdmin ? '✅ Yes' : '❌ No'}`, isAdmin ? 'success' : 'warning');
      } else {
        addResult(`❌ Django login failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Login test error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testAuthenticatedRequest = async () => {
    if (!djangoAuthService.isAuthenticated()) {
      addResult('❌ Not authenticated. Please login first.', 'error');
      return;
    }

    setLoading(true);
    
    try {
      addResult('Testing authenticated request...', 'info');
      
      const response = await makeDjangoRequest('/accounts/profile/');
      const result = await handleDjangoResponse(response);
      
      if (result.success) {
        addResult('✅ Authenticated request successful', 'success');
        addResult(`Profile data: ${JSON.stringify(result.data)}`, 'info');
      } else {
        addResult(`❌ Authenticated request failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Authenticated request error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Django API Integration Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testDjangoConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={testAuthenticatedRequest}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Auth Request
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Testing...</p>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-3">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Click a test button above.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-xs text-gray-500 mt-1 min-w-[60px]">
                  {result.timestamp}
                </span>
                <span className={`flex-1 ${getResultColor(result.type)}`}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status:</h3>
        <p>Django Token: {djangoAuthService.isAuthenticated() ? '✅ Present' : '❌ Not found'}</p>
        <p>Token Value: {djangoAuthService.getToken() ? '***' + djangoAuthService.getToken().slice(-10) : 'None'}</p>
        <p>API URL: <code className="bg-gray-200 px-2 py-1 rounded text-sm">{DJANGO_BASE_URL}</code></p>
        <p>Environment: <span className="font-semibold text-blue-600">{DJANGO_BASE_URL.includes('localhost') || DJANGO_BASE_URL.includes('127.0.0.1') ? 'Development' : 'Production'}</span></p>
      </div>
    </div>
  );
};

export default DjangoApiTest;
