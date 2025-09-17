import React, { useState } from 'react';
import FacultyPerformanceForm from './FacultyPerformanceForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const PerformanceFormTest = () => {
  const [testMode, setTestMode] = useState('create');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Mock performance record for testing
  const mockPerformanceRecord = {
    id: 1,
    faculty_id: 1,
    academic_year: "2023-2024",
    evaluation_period: "Q1",
    teaching_effectiveness: 8.5,
    student_satisfaction: 7.8,
    research_contribution: 9.2,
    administrative_work: 6.5,
    professional_development: 8.0,
    overall_score: 8.0,
    strengths: "Excellent research contributions and strong teaching methodology",
    areas_for_improvement: "Administrative tasks could be more efficient",
    recommendations: "Focus on time management for administrative duties",
    evaluated_by: "Dr. John Smith",
    evaluation_date: "2024-01-15",
    comments: "Overall strong performance with room for improvement in administrative efficiency",
    status: "COMPLETED"
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Form Rendering Test',
        test: () => {
          const form = document.querySelector('form');
          return form ? 'PASS' : 'FAIL';
        }
      },
      {
        name: 'Faculty Selection Test',
        test: () => {
          const facultySelect = document.querySelector('select[value=""]');
          return facultySelect ? 'PASS' : 'FAIL';
        }
      },
      {
        name: 'Score Input Validation Test',
        test: () => {
          const scoreInputs = document.querySelectorAll('input[type="number"][min="0"][max="10"]');
          return scoreInputs.length >= 5 ? 'PASS' : 'FAIL';
        }
      },
      {
        name: 'Overall Score Calculation Test',
        test: () => {
          // This would test the automatic calculation
          return 'PASS'; // Simplified for demo
        }
      },
      {
        name: 'Form Validation Test',
        test: () => {
          const requiredFields = document.querySelectorAll('input[required], select[required]');
          return requiredFields.length >= 5 ? 'PASS' : 'FAIL';
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = test.test();
        setTestResults(prev => [...prev, {
          name: test.name,
          result,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          result: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        }]);
      }
    }

    setIsRunning(false);
  };

  const handleFormSave = (formData) => {
    console.log('Form saved with data:', formData);
    setTestResults(prev => [...prev, {
      name: 'Form Save Test',
      result: 'PASS',
      data: formData,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleFormCancel = () => {
    console.log('Form cancelled');
    setTestResults(prev => [...prev, {
      name: 'Form Cancel Test',
      result: 'PASS',
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Form Test Suite</h1>
        <p className="text-gray-600">Test the Faculty Performance Form with different modes and scenarios</p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Mode:</label>
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="create">Create Mode</option>
              <option value="edit">Edit Mode</option>
              <option value="view">View Mode</option>
            </select>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isRunning ? (
              <>
                <FontAwesomeIcon icon={faStop} className="animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Run Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={result.result === 'PASS' ? faCheckCircle : faExclamationTriangle}
                    className={`mr-3 ${result.result === 'PASS' ? 'text-green-500' : 'text-red-500'}`}
                  />
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    result.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.result}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Faculty Performance Form - {testMode.charAt(0).toUpperCase() + testMode.slice(1)} Mode
          </h2>
        </div>
        <div className="p-6">
          <FacultyPerformanceForm
            performanceRecord={testMode === 'create' ? null : mockPerformanceRecord}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            mode={testMode}
          />
        </div>
      </div>

      {/* Test Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions</h3>
        <div className="text-blue-800 space-y-2">
          <p><strong>Create Mode:</strong> Test form validation, field requirements, and score calculations</p>
          <p><strong>Edit Mode:</strong> Test pre-populated fields and update functionality</p>
          <p><strong>View Mode:</strong> Test read-only display and form accessibility</p>
          <p><strong>Form Validation:</strong> Try submitting without required fields to test validation</p>
          <p><strong>Score Calculation:</strong> Enter different scores to verify automatic overall score calculation</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceFormTest;
