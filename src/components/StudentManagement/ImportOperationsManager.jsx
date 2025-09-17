import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faFile, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';

const ImportOperationsManager = () => {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('students');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    setLoading(true);
    try {
      const data = await studentApiService.getImports();
      setImports(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await studentApiService.uploadBulkImportFile(selectedFile, importType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        loadImports();
      }, 1000);

    } catch (err) {
      setError(err.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const template = `first_name,last_name,email,roll_number,department,year,section,phone,date_of_birth,gender
John,Doe,john.doe@example.com,CS001,CSE,1,A,1234567890,2000-01-01,Male
Jane,Smith,jane.smith@example.com,CS002,CSE,1,B,1234567891,2000-02-02,Female`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'failed':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Import Operations</h2>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download Template
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Import</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Import Type</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="students">Students</option>
              <option value="enrollments">Enrollments</option>
              <option value="documents">Documents</option>
              <option value="custom_fields">Custom Fields</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={uploading}
            />
          </div>
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
          {uploading && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Uploading... {uploadProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Import History</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {imports.map((importItem) => (
                <div key={importItem.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(importItem.status)}
                      <div>
                        <h4 className="font-medium">{importItem.filename}</h4>
                        <p className="text-sm text-gray-600">
                          Type: {importItem.import_type} • 
                          Records: {importItem.total_records} • 
                          Date: {new Date(importItem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(importItem.status)}`}>
                        {importItem.status}
                      </span>
                      {importItem.success_count && (
                        <span className="text-sm text-green-600">
                          {importItem.success_count} successful
                        </span>
                      )}
                      {importItem.error_count && (
                        <span className="text-sm text-red-600">
                          {importItem.error_count} errors
                        </span>
                      )}
                    </div>
                  </div>
                  {importItem.error_message && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {importItem.error_message}
                    </div>
                  )}
                </div>
              ))}
              {imports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No import operations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportOperationsManager;
