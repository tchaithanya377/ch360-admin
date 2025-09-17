import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faDownload,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faEye,
  faTrash,
  faFileAlt,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave,
  faCloudUploadAlt,
  faFileCsv,
  faChartBar,
  faCheckDouble,
  faExclamationCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const BulkUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      fileName: 'CS301_MidSem_Marks.csv',
      course: 'CS301',
      exam: 'Mid-Semester',
      uploadDate: '2024-03-10T10:30:00',
      status: 'completed',
      totalRecords: 45,
      successCount: 43,
      errorCount: 2,
      errors: [
        { row: 12, field: 'marks', message: 'Invalid marks value' },
        { row: 23, field: 'rollNo', message: 'Student not found' }
      ]
    },
    {
      id: 2,
      fileName: 'EE201_EndSem_Marks.csv',
      course: 'EE201',
      exam: 'End-Semester',
      uploadDate: '2024-03-08T14:20:00',
      status: 'completed',
      totalRecords: 38,
      successCount: 38,
      errorCount: 0,
      errors: []
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Standard Marks Template',
      description: 'Template for uploading standard exam marks',
      fields: ['Roll No', 'Name', 'Marks', 'Max Marks', 'Remarks'],
      downloadUrl: '/templates/standard_marks.csv'
    },
    {
      id: 2,
      name: 'Practical Marks Template',
      description: 'Template for uploading practical exam marks',
      fields: ['Roll No', 'Name', 'Theory Marks', 'Practical Marks', 'Viva Marks', 'Total Marks'],
      downloadUrl: '/templates/practical_marks.csv'
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSVFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        row.rowNumber = index + 2; // +2 because we start from line 2 and want 1-based indexing
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));
      
      setPreviewData(data);
      validateData(data);
    };
    reader.readAsText(file);
  };

  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, index) => {
      // Validate Roll No
      if (!row['Roll No'] || row['Roll No'].length < 3) {
        errors.push({
          row: row.rowNumber,
          field: 'Roll No',
          message: 'Roll number is required and must be at least 3 characters'
        });
      }

      // Validate Name
      if (!row['Name'] || row['Name'].length < 2) {
        errors.push({
          row: row.rowNumber,
          field: 'Name',
          message: 'Name is required and must be at least 2 characters'
        });
      }

      // Validate Marks
      const marks = parseFloat(row['Marks']);
      const maxMarks = parseFloat(row['Max Marks']) || 100;
      
      if (isNaN(marks) || marks < 0 || marks > maxMarks) {
        errors.push({
          row: row.rowNumber,
          field: 'Marks',
          message: `Marks must be a number between 0 and ${maxMarks}`
        });
      }
    });

    setValidationErrors(errors);
  };

  const handleUpload = () => {
    if (validationErrors.length > 0) {
      alert(`Please fix ${validationErrors.length} validation errors before uploading`);
      return;
    }

    // Simulate upload process
    const uploadRecord = {
      id: Date.now(),
      fileName: selectedFile.name,
      course: 'CS301', // This would be selected from dropdown
      exam: 'Mid-Semester', // This would be selected from dropdown
      uploadDate: new Date().toISOString(),
      status: 'completed',
      totalRecords: previewData.length,
      successCount: previewData.length - validationErrors.length,
      errorCount: validationErrors.length,
      errors: validationErrors
    };

    setUploadHistory([uploadRecord, ...uploadHistory]);
    setSelectedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
  };

  const downloadTemplate = (template) => {
    // Simulate template download
    const csvContent = template.fields.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.name.toLowerCase().replace(/\s+/g, '_') + '.csv';
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheckCircle;
      case 'processing': return faClock;
      case 'failed': return faExclamationTriangle;
      default: return faClock;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bulk Upload System</h2>
            <p className="text-blue-100 text-lg">Upload student marks in bulk using CSV files with validation</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Upload Marks</h3>
              <FontAwesomeIcon icon={faFileCsv} className="text-white text-xl" />
            </div>
          </div>
          <div className="p-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <FontAwesomeIcon icon={faUpload} className="text-5xl text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload CSV File</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Drag and drop your CSV file here, or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Choose File
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData([]);
                      setValidationErrors([]);
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )}

            {/* Validation Summary */}
            {validationErrors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 dark:text-red-400 mr-3" />
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    {validationErrors.length} validation errors found
                  </h4>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Please fix these errors before uploading
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={validationErrors.length > 0}
                  className={`w-full px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 ${
                    validationErrors.length > 0
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Upload Marks
                </button>
              </div>
            )}

            {/* Preview Button */}
            {previewData.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Download Templates</h3>
              <FontAwesomeIcon icon={faDownload} className="text-white text-xl" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                    </div>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-1" />
                      Download
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">Required fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.fields.map((field, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Upload History</h3>
            <FontAwesomeIcon icon={faChartBar} className="text-white text-xl" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <div key={upload.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{upload.fileName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {upload.course} - {upload.exam}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(upload.uploadDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(upload.status)} className="mr-1" />
                      {upload.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Total Records</p>
                    <p className="font-medium text-gray-900 dark:text-white">{upload.totalRecords}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Success</p>
                    <p className="font-medium text-green-600 dark:text-green-400">{upload.successCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Errors</p>
                    <p className="font-medium text-red-600 dark:text-red-400">{upload.errorCount}</p>
                  </div>
                </div>

                {upload.errors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Errors:</p>
                    <div className="space-y-1">
                      {upload.errors.slice(0, 3).map((error, index) => (
                        <p key={index} className="text-xs text-red-600 dark:text-red-400">
                          Row {error.row}: {error.message}
                        </p>
                      ))}
                      {upload.errors.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          ... and {upload.errors.length - 3} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).filter(key => key !== 'rowNumber').map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className={validationErrors.some(e => e.row === row.rowNumber) ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}>
                      {Object.entries(row).filter(([key]) => key !== 'rowNumber').map(([key, value]) => (
                        <td key={key} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {previewData.length > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Showing first 10 rows of {previewData.length} total rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
