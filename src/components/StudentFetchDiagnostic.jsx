import React, { useState, useEffect } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { DJANGO_BASE_URL } from '../config/apiConfig';
import studentApiService from '../services/studentApiService';
import { getStudents } from '../utils/djangoAuthHelpers';

const StudentFetchDiagnostic = () => {
  const { isAuthenticated, user, token } = useDjangoAuth();
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  useEffect(() => {
    // Gather initial diagnostic information
    const info = {
      isAuthenticated,
      user: user ? { id: user.id, username: user.username, email: user.email } : null,
      token: token ? `${token.substring(0, 20)}...` : null,
      baseURL: DJANGO_BASE_URL,
      localStorage: {
        django_token: localStorage.getItem('django_token') ? 'Present' : 'Missing',
        access_token: localStorage.getItem('access_token') ? 'Present' : 'Missing',
        refresh_token: localStorage.getItem('refresh_token') ? 'Present' : 'Missing',
      },
      timestamp: new Date().toISOString()
    };
    setDiagnosticResults(prev => ({ ...prev, authInfo: info }));
  }, [isAuthenticated, user, token]);

  const runDiagnostic = async () => {
    setLoading(true);
    setDiagnosticResults({});
    
    try {
      // Test 1: Direct API endpoint test
      setCurrentTest('Testing direct API endpoint...');
      await testDirectAPI();
      
      // Test 2: DjangoAuthService test
      setCurrentTest('Testing DjangoAuthService...');
      await testDjangoAuthService();
      
      // Test 3: StudentApiService test
      setCurrentTest('Testing StudentApiService...');
      await testStudentApiService();
      
      // Test 4: DjangoAuthHelpers test
      setCurrentTest('Testing DjangoAuthHelpers...');
      await testDjangoAuthHelpers();
      
      // Test 5: Context test
      setCurrentTest('Testing DjangoAuthContext...');
      await testDjangoAuthContext();
      
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnosticResults(prev => ({
        ...prev,
        diagnosticError: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const testDirectAPI = async () => {
    try {
      const studentsURL = `${DJANGO_BASE_URL}/v1/students/students/`;
      const authToken = token || localStorage.getItem('django_token') || localStorage.getItem('access_token');
      
      console.log('Testing direct API:', studentsURL);
      console.log('Using token:', authToken ? `${authToken.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(studentsURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const result = {
        url: studentsURL,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        tokenUsed: authToken ? `${authToken.substring(0, 20)}...` : 'No token',
        timestamp: new Date().toISOString()
      };

      if (response.ok) {
        try {
          result.data = await response.json();
          result.studentCount = result.data?.results?.length || result.data?.length || 0;
          result.success = true;
        } catch (e) {
          result.data = await response.text();
          result.parseError = e.message;
        }
      } else {
        try {
          result.error = await response.json();
        } catch (e) {
          result.error = await response.text();
        }
        result.success = false;
      }

      setDiagnosticResults(prev => ({ ...prev, directAPI: result }));
    } catch (error) {
      setDiagnosticResults(prev => ({
        ...prev,
        directAPI: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testDjangoAuthService = async () => {
    try {
      // Import djangoAuthService dynamically to avoid circular imports
      const { default: djangoAuthService } = await import('../utils/djangoAuthService');
      
      const result = await djangoAuthService.getStudents({});
      
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthService: {
          success: result.success,
          data: result.data,
          error: result.error,
          count: result.count,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthService: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testStudentApiService = async () => {
    try {
      const result = await studentApiService.getStudents({});
      
      setDiagnosticResults(prev => ({
        ...prev,
        studentApiService: {
          success: true,
          data: result,
          studentCount: Array.isArray(result) ? result.length : 0,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDiagnosticResults(prev => ({
        ...prev,
        studentApiService: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testDjangoAuthHelpers = async () => {
    try {
      const result = await getStudents({});
      
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthHelpers: {
          success: result.success,
          data: result.data,
          error: result.error,
          count: result.count,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthHelpers: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testDjangoAuthContext = async () => {
    try {
      const { students } = useDjangoAuth();
      const result = await students.getStudents({});
      
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthContext: {
          success: result.success,
          data: result.data,
          error: result.error,
          count: result.count,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDiagnosticResults(prev => ({
        ...prev,
        djangoAuthContext: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const clearResults = () => {
    setDiagnosticResults({});
  };

  const renderResult = (key, result) => {
    if (!result) return null;
    
    return (
      <div key={key} className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2 capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </h3>
        
        {result.success !== undefined && (
          <div className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result.success ? 'SUCCESS' : 'FAILED'}
          </div>
        )}
        
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700 text-sm">{result.error}</p>
          </div>
        )}
        
        {result.data && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
            <p className="text-green-800 font-medium">Data:</p>
            <pre className="text-green-700 text-xs overflow-auto max-h-32">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
        
        {result.studentCount !== undefined && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
            <p className="text-blue-800 font-medium">Student Count: {result.studentCount}</p>
          </div>
        )}
        
        {result.url && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
            <p className="text-gray-800 font-medium">URL:</p>
            <p className="text-gray-700 text-sm break-all">{result.url}</p>
          </div>
        )}
        
        {result.status && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
            <p className="text-gray-800 font-medium">Status: {result.status} {result.statusText}</p>
          </div>
        )}
        
        {result.timestamp && (
          <p className="text-gray-500 text-xs">Tested at: {new Date(result.timestamp).toLocaleString()}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Student Fetch Diagnostic Tool</h1>
          <p className="text-blue-100 mt-1">Comprehensive testing of student fetching functionality</p>
        </div>

        <div className="p-6">
          {!isAuthenticated && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Warning:</strong> You are not authenticated. Some tests may fail.
            </div>
          )}

          <div className="flex space-x-4 mb-6">
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-medium transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Running Tests...' : 'Run Full Diagnostic'}
            </button>
            
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Results
            </button>
          </div>

          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                <p className="text-blue-800">{currentTest}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(diagnosticResults).map(([key, result]) => 
              renderResult(key, result)
            )}
          </div>

          {Object.keys(diagnosticResults).length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No diagnostic results yet. Click "Run Full Diagnostic" to start testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFetchDiagnostic;
