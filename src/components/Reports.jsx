// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt, faDownload, faChartBar, faUsers, faGraduationCap,
  faMoneyBillWave, faHome, faBus, faCalendarAlt, faFilter,
  faPrint, faEye, faTimes, faPlus
} from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../services/studentApiService';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    section: '',
    department: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch students from Django API
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.year) params.year = filters.year;
        if (filters.section) params.section = filters.section;
        if (filters.department) params.department = filters.department;
        // status/date filters are applied client-side in generateReport
        const studentsData = await studentApiService.getStudents(params);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (e) {
        console.error('Failed to load students for reports', e);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [filters.year, filters.section, filters.department]);

  // Available reports
  const availableReports = [
    {
      id: 'student-list',
      name: 'Student List Report',
      description: 'Complete list of all students with basic information',
      icon: faUsers,
      color: 'bg-blue-500'
    },
    {
      id: 'academic-performance',
      name: 'Academic Performance Report',
      description: 'Student grades and academic performance analysis',
      icon: faGraduationCap,
      color: 'bg-green-500'
    },
    {
      id: 'fee-collection',
      name: 'Fee Collection Report',
      description: 'Fee collection status and outstanding amounts',
      icon: faMoneyBillWave,
      color: 'bg-yellow-500'
    },
    {
      id: 'hostel-occupancy',
      name: 'Hostel Occupancy Report',
      description: 'Hostel room allocation and occupancy status',
      icon: faHome,
      color: 'bg-purple-500'
    },
    {
      id: 'transport-allocation',
      name: 'Transport Allocation Report',
      description: 'Transport route allocations and vehicle utilization',
      icon: faBus,
      color: 'bg-indigo-500'
    },
    {
      id: 'admission-trends',
      name: 'Admission Trends Report',
      description: 'Student admission trends and statistics',
      icon: faChartBar,
      color: 'bg-red-500'
    },
    {
      id: 'attendance-report',
      name: 'Attendance Report',
      description: 'Student attendance records and analysis',
      icon: faCalendarAlt,
      color: 'bg-pink-500'
    },
    {
      id: 'demographic-analysis',
      name: 'Demographic Analysis',
      description: 'Student demographic distribution and analysis',
      icon: faUsers,
      color: 'bg-teal-500'
    }
  ];

  // Generate report data
  const generateReport = () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    let filteredStudents = students;

    // Apply filters
    if (filters.year) {
      filteredStudents = filteredStudents.filter(student => (student.year || student.academic_year) === filters.year);
    }
    if (filters.section) {
      filteredStudents = filteredStudents.filter(student => student.section === filters.section);
    }
    if (filters.department) {
      filteredStudents = filteredStudents.filter(student => (student.department || student.dept) === filters.department);
    }
    if (filters.status) {
      filteredStudents = filteredStudents.filter(student => (student.status || '').toLowerCase() === filters.status.toLowerCase());
    }

    let report = {
      type: selectedReport,
      generatedAt: new Date(),
      totalRecords: filteredStudents.length,
      filters: filters,
      data: []
    };

    switch (selectedReport) {
      case 'student-list':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          email: student.email,
          year: student.year,
          section: student.section,
          department: student.department,
          status: student.status,
          mobile: student.studentMobile || student.mobile
        }));
        break;

      case 'academic-performance':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          cgpa: student.cgpa || 'N/A',
          semester: student.semester || 'N/A',
          attendance: student.attendance || 'N/A',
          status: student.status
        }));
        break;

      case 'fee-collection':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          totalFee: student.total_fee ?? student.totalFee ?? 0,
          paidFee: student.paid_fee ?? student.paidFee ?? 0,
          outstandingFee: (student.total_fee ?? student.totalFee ?? 0) - (student.paid_fee ?? student.paidFee ?? 0),
          paymentStatus: student.paymentStatus || 'Pending'
        }));
        break;

      case 'hostel-occupancy':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          hostelBlock: student.hostel_block || student.hostelBlock || 'N/A',
          roomNumber: student.hostel_room || student.roomNumber || 'N/A',
          checkInDate: student.hostel_checkin || student.checkInDate || 'N/A',
          status: student.hostel_status || student.hostelStatus || 'Not Allocated'
        }));
        break;

      case 'transport-allocation':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          route: student.transport_route || 'N/A',
          pickupLocation: student.pickup_location || 'N/A',
          dropLocation: student.drop_location || 'N/A',
          status: student.transport_status || 'Not Allocated'
        }));
        break;

      case 'admission-trends':
        const yearStats = {};
        filteredStudents.forEach(student => {
          const year = student.year || 'Unknown';
          yearStats[year] = (yearStats[year] || 0) + 1;
        });
        report.data = Object.entries(yearStats).map(([year, count]) => ({
          year,
          count,
          percentage: ((count / (filteredStudents.length || 1)) * 100).toFixed(2)
        }));
        break;

      case 'attendance-report':
        report.data = filteredStudents.map(student => ({
          id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          rollNo: student.roll_number || student.rollNo,
          totalDays: student.totalDays || 0,
          presentDays: student.presentDays || 0,
          absentDays: student.absentDays || 0,
          attendancePercentage: student.attendancePercentage || 0
        }));
        break;

      case 'demographic-analysis':
        const genderStats = {};
        const departmentStats = {};
        filteredStudents.forEach(student => {
          const gender = student.gender || 'Unknown';
          const department = student.department || 'Unknown';
          genderStats[gender] = (genderStats[gender] || 0) + 1;
          departmentStats[department] = (departmentStats[department] || 0) + 1;
        });
        report.data = {
          gender: Object.entries(genderStats).map(([gender, count]) => ({
            gender,
            count,
            percentage: ((count / (filteredStudents.length || 1)) * 100).toFixed(2)
          })),
          department: Object.entries(departmentStats).map(([dept, count]) => ({
            department: dept,
            count,
            percentage: ((count / (filteredStudents.length || 1)) * 100).toFixed(2)
          }))
        };
        break;

      default:
        report.data = [];
    }

    setReportData(report);
    setShowPreview(true);
  };

  // Export report
  const exportReport = (format = 'pdf') => {
    if (!reportData) {
      alert('No report data to export');
      return;
    }

    // Create CSV content
    let csvContent = '';
    
    if (Array.isArray(reportData.data)) {
      if (reportData.data.length > 0) {
        const headers = Object.keys(reportData.data[0]);
        csvContent = headers.join(',') + '\n';
        
        reportData.data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else {
      // Handle complex data structures
      csvContent = 'Report Data\n';
      Object.entries(reportData.data).forEach(([key, value]) => {
        csvContent += `${key}\n`;
        if (Array.isArray(value)) {
          value.forEach(item => {
            csvContent += Object.values(item).join(',') + '\n';
          });
        }
      });
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Report exported successfully!');
  };

  // Print report
  const printReport = () => {
    if (!reportData) {
      alert('No report data to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedReport.replace('-', ' ').toUpperCase()} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedReport.replace('-', ' ').toUpperCase()} REPORT</h1>
            <p>Generated on: ${reportData.generatedAt.toLocaleString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Records:</strong> ${reportData.totalRecords}</p>
            <p><strong>Filters Applied:</strong> ${Object.entries(reportData.filters).filter(([k,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ') || 'None'}</p>
          </div>
          <table>
            ${Array.isArray(reportData.data) && reportData.data.length > 0 ? `
              <thead>
                <tr>
                  ${Object.keys(reportData.data[0]).map(key => `<th>${key.toUpperCase()}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${reportData.data.map(row => `
                  <tr>
                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            ` : '<tr><td>No data available</td></tr>'}
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate and export various student reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Report Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${report.color} text-white p-2 rounded-lg`}>
                      <FontAwesomeIcon icon={report.icon} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          {selectedReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setFilters({
                      year: '',
                      section: '',
                      department: '',
                      status: '',
                      dateFrom: '',
                      dateTo: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={generateReport}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Generate Report
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReport.replace('-', ' ').toUpperCase()} Report
                </h3>
                <p className="text-sm text-gray-600">
                  Generated on {reportData?.generatedAt?.toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={printReport}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faPrint} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Records</p>
                <p className="text-2xl font-semibold text-blue-900">{reportData?.totalRecords || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Report Type</p>
                <p className="text-lg font-semibold text-green-900">
                  {selectedReport.replace('-', ' ').toUpperCase()}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Filters Applied</p>
                <p className="text-sm font-semibold text-yellow-900">
                  {Object.entries(filters).filter(([k,v]) => v).length || 0} filters
                </p>
              </div>
            </div>

            {/* Report Data */}
            <div className="overflow-x-auto">
              {Array.isArray(reportData?.data) && reportData.data.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData.data[0]).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, valueIndex) => (
                          <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">No data available for this report</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
