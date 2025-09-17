// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload, faFileAlt,
  faUsers, faFilter, faTimes, faCheckCircle, faExclamationTriangle,
  faCalendarAlt, faCog, faEye
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, getDocs, query, where, orderBy, onSnapshot
} from 'firebase/firestore';

const ExportData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    section: '',
    department: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeFields: {
      basic: true,
      academic: true,
      contact: true,
      family: true,
      financial: true,
      hostel: true,
      transport: true
    },
    fileName: 'student_data',
    includeHeaders: true,
    dateFormat: 'DD/MM/YYYY'
  });

  // Fetch students
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentsData = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get filtered students
  const getFilteredStudents = () => {
    let filtered = students;

    if (filters.year) {
      filtered = filtered.filter(student => student.year === filters.year);
    }
    if (filters.section) {
      filtered = filtered.filter(student => student.section === filters.section);
    }
    if (filters.department) {
      filtered = filtered.filter(student => student.department === filters.department);
    }
    if (filters.status) {
      filtered = filtered.filter(student => student.status === filters.status);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(student => {
        const admissionDate = student.admissionDate || student.createdAt;
        return admissionDate >= filters.dateFrom;
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter(student => {
        const admissionDate = student.admissionDate || student.createdAt;
        return admissionDate <= filters.dateTo;
      });
    }

    return selectedStudents.length > 0 
      ? filtered.filter(student => selectedStudents.includes(student.id))
      : filtered;
  };

  // Get export data based on selected fields
  const getExportData = () => {
    const filteredStudents = getFilteredStudents();
    const data = [];

    filteredStudents.forEach(student => {
      const row = {};

      if (exportConfig.includeFields.basic) {
        row['Student ID'] = student.id;
        row['Roll Number'] = student.rollNo;
        row['Name'] = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
        row['Gender'] = student.gender;
        row['Date of Birth'] = student.dateOfBirth;
        row['Blood Group'] = student.bloodGroup;
        row['Status'] = student.status;
      }

      if (exportConfig.includeFields.academic) {
        row['Year'] = student.year;
        row['Section'] = student.section;
        row['Department'] = student.department;
        row['Semester'] = student.semester;
        row['CGPA'] = student.cgpa || 'N/A';
        row['Admission Date'] = student.admissionDate;
      }

      if (exportConfig.includeFields.contact) {
        row['Email'] = student.email;
        row['Mobile'] = student.studentMobile || student.mobile;
        row['Address'] = student.address;
        row['Emergency Contact'] = student.emergencyContact;
      }

      if (exportConfig.includeFields.family) {
        row['Father Name'] = student.fatherName;
        row['Father Mobile'] = student.fatherMobile;
        row['Mother Name'] = student.motherName;
        row['Guardian Name'] = student.guardianName;
        row['Guardian Mobile'] = student.guardianMobile;
      }

      if (exportConfig.includeFields.financial) {
        row['Total Fee'] = student.totalFee || 0;
        row['Paid Fee'] = student.paidFee || 0;
        row['Outstanding Fee'] = (student.totalFee || 0) - (student.paidFee || 0);
        row['Payment Status'] = student.paymentStatus || 'Pending';
      }

      if (exportConfig.includeFields.hostel) {
        row['Hostel Block'] = student.hostelBlock || 'N/A';
        row['Room Number'] = student.roomNumber || 'N/A';
        row['Check-in Date'] = student.checkInDate || 'N/A';
        row['Hostel Status'] = student.hostelStatus || 'Not Allocated';
      }

      if (exportConfig.includeFields.transport) {
        row['Transport Route'] = student.transportRoute || 'N/A';
        row['Pickup Location'] = student.pickupLocation || 'N/A';
        row['Drop Location'] = student.dropLocation || 'N/A';
        row['Transport Status'] = student.transportStatus || 'Not Allocated';
      }

      data.push(row);
    });

    return data;
  };

  // Export to CSV
  const exportToCSV = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    let csvContent = '';

    if (exportConfig.includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportConfig.fileName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export to Excel (simplified - creates CSV with .xlsx extension)
  const exportToExcel = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    let csvContent = '';

    if (exportConfig.includeHeaders) {
      csvContent += headers.join('\t') + '\n';
    }

    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      csvContent += values.join('\t') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportConfig.fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF (simplified - creates HTML that can be printed as PDF)
  const exportToPDF = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Data Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
            @media print {
              body { margin: 0; }
              table { font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Data Export</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = getExportData();
      
      switch (exportConfig.format) {
        case 'csv':
          exportToCSV(data);
          break;
        case 'excel':
          exportToExcel(data);
          break;
        case 'pdf':
          exportToPDF(data);
          break;
        default:
          exportToCSV(data);
      }
      
      alert(`Data exported successfully! ${data.length} records exported.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Select all students
  const selectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
          <p className="text-gray-600">Export student data in various formats</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={selectAllStudents}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Select All</span>
          </button>
          <button
            onClick={clearSelection}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>Clear Selection</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FontAwesomeIcon icon={faFilter} className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filtered Students</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected Students</p>
              <p className="text-2xl font-semibold text-gray-900">{selectedStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Export Format</p>
              <p className="text-lg font-semibold text-gray-900">{exportConfig.format.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {Array.from(new Set(students.map(s => s.year))).filter(Boolean).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={filters.section}
                  onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sections</option>
                  {Array.from(new Set(students.map(s => s.section))).filter(Boolean).map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {Array.from(new Set(students.map(s => s.department))).filter(Boolean).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setFilters({
                  year: '',
                  section: '',
                  department: '',
                  status: '',
                  dateFrom: '',
                  dateTo: ''
                })}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                <input
                  type="text"
                  value={exportConfig.fileName}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="student_data"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeHeaders}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Headers</span>
                </label>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Include Fields</h4>
                <div className="space-y-2">
                  {Object.entries(exportConfig.includeFields).map(([key, value]) => (
                    <div key={key}>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setExportConfig(prev => ({
                            ...prev,
                            includeFields: {
                              ...prev.includeFields,
                              [key]: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting || filteredStudents.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={exporting ? faCog : faDownload} className={exporting ? 'animate-spin' : ''} />
                <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Total Records:</strong> {filteredStudents.length}</p>
                <p><strong>Selected Records:</strong> {selectedStudents.length}</p>
                <p><strong>Export Format:</strong> {exportConfig.format.toUpperCase()}</p>
                <p><strong>File Name:</strong> {exportConfig.fileName}_{new Date().toISOString().split('T')[0]}.{exportConfig.format}</p>
              </div>

              {filteredStudents.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-1">Name</th>
                        <th className="text-left p-1">Roll No</th>
                        <th className="text-left p-1">Year</th>
                        <th className="text-left p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.slice(0, 10).map((student) => (
                        <tr key={student.id} className="border-t border-gray-100">
                          <td className="p-1">{student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}</td>
                          <td className="p-1">{student.rollNo}</td>
                          <td className="p-1">{student.year}</td>
                          <td className="p-1">{student.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Showing first 10 of {filteredStudents.length} records
                    </p>
                  )}
                </div>
              )}

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mb-2" />
                  <p>No students match the current filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
