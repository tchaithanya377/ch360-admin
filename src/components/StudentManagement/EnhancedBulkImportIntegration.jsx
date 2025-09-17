import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faUsers, 
  faGraduationCap, 
  faCheckCircle,
  faExclamationTriangle,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import EnhancedBulkImport from '../EnhancedBulkImport';

const EnhancedBulkImportIntegration = () => {
  const [showImport, setShowImport] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalImports: 0,
    lastImport: null
  });

  const handleImportSuccess = (count) => {
    // Add to import history
    const newImport = {
      id: Date.now(),
      date: new Date().toISOString(),
      count,
      status: 'success'
    };
    
    setImportHistory(prev => [newImport, ...prev.slice(0, 9)]); // Keep last 10
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalStudents: prev.totalStudents + count,
      totalImports: prev.totalImports + 1,
      lastImport: new Date().toISOString()
    }));
    
    // Close import modal
    setShowImport(false);
    
    // Show success message
    alert(`Successfully imported ${count} students!`);
  };

  const handleImportError = (error) => {
    // Add error to import history
    const newImport = {
      id: Date.now(),
      date: new Date().toISOString(),
      error: error.message,
      status: 'error'
    };
    
    setImportHistory(prev => [newImport, ...prev.slice(0, 9)]);
    
    // Close import modal
    setShowImport(false);
    
    // Show error message
    alert(`Import failed: ${error.message}`);
  };

  const downloadTemplate = () => {
    // This will trigger the template download from EnhancedBulkImport
    // You can also create a direct download link here
    const link = document.createElement('a');
    link.href = '/templates/student_import_template.xlsx';
    link.download = 'student_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Bulk Import</h1>
            <p className="text-gray-600 mt-1">
              Import multiple students with automatic Firebase Authentication
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download Template
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Start Import
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faUsers} className="text-3xl text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faUpload} className="text-3xl text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Imports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalImports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faGraduationCap} className="text-3xl text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Import</p>
              <p className="text-sm font-bold text-gray-900">
                {stats.lastImport ? new Date(stats.lastImport).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Firebase Authentication</h3>
              <p className="text-sm text-gray-500">Automatic account creation with consistent UIDs</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Excel Format Support</h3>
              <p className="text-sm text-gray-500">Perfect match for your existing Excel structure</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Data Validation</h3>
              <p className="text-sm text-gray-500">Real-time validation with detailed error reporting</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Batch Processing</h3>
              <p className="text-sm text-gray-500">Efficient processing for large datasets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import History */}
      {importHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Imports</h2>
          <div className="space-y-3">
            {importHistory.map((importItem) => (
              <div key={importItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {importItem.status === 'success' ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  ) : (
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {importItem.status === 'success' 
                        ? `Imported ${importItem.count} students`
                        : 'Import failed'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(importItem.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                {importItem.error && (
                  <p className="text-xs text-red-600">{importItem.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-4">How to Use</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="font-medium mr-2">1.</span>
            <span>Download the Excel template to see the required format</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">2.</span>
            <span>Fill in your student data following the template structure</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">3.</span>
            <span>Click "Start Import" and upload your Excel file</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">4.</span>
            <span>Select department, year, and section for the students</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">5.</span>
            <span>Review the data preview and confirm the import</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">6.</span>
            <span>Students will receive login credentials automatically</span>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <EnhancedBulkImport
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
          onError={handleImportError}
        />
      )}
    </div>
  );
};

export default EnhancedBulkImportIntegration;
