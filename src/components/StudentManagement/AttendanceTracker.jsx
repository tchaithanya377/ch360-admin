import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faClock,
  faUserPlus, faCopy, faArrowsRotate, faCalendarAlt, faCheck,
  faTimes, faSpinner, faChartBar, faChartLine
} from "@fortawesome/free-solid-svg-icons";
const AttendanceTracker = ({ students }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [attendanceMode, setAttendanceMode] = useState("manual"); // manual, bulk, qr
  const [bulkAction, setBulkAction] = useState("present"); // present, absent, late

  // Attendance statuses
  const attendanceStatuses = [
    { id: "present", name: "Present", color: "green", icon: faCheckCircle },
    { id: "absent", name: "Absent", color: "red", icon: faTimes },
    { id: "late", name: "Late", color: "yellow", icon: faClock },
    { id: "excused", name: "Excused", color: "blue", icon: faExclamationTriangle }
  ];

  // Get filtered students
  const getFilteredStudents = () => {
    let filtered = students;

    if (filterDepartment !== "all") {
      filtered = filtered.filter(s => s.department === filterDepartment);
    }
    if (filterYear !== "all") {
      filtered = filtered.filter(s => s.year === filterYear);
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  // Get unique departments and years for filters
  const uniqueDepartments = [...new Set(students.map(s => s.department))].filter(Boolean).sort();
  const uniqueYears = [...new Set(students.map(s => s.year))].filter(Boolean).sort();

  // Initialize attendance data for selected students
  const initializeAttendance = () => {
    const initialData = {};
    filteredStudents.forEach(student => {
      initialData[student.id] = {
        status: "present",
        time: new Date().toLocaleTimeString(),
        remarks: "",
        markedBy: "admin",
        markedAt: new Date()
      };
    });
    setAttendanceData(initialData);
  };

  // Update attendance for a student
  const updateAttendance = (studentId, status, remarks = "") => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        status,
        time: new Date().toLocaleTimeString(),
        remarks,
        markedBy: "admin",
        markedAt: new Date()
      }
    }));
  };

  // Bulk update attendance
  const bulkUpdateAttendance = () => {
    const newData = { ...attendanceData };
    filteredStudents.forEach(student => {
      newData[student.id] = {
        status: bulkAction,
        time: new Date().toLocaleTimeString(),
        remarks: `Bulk marked as ${bulkAction}`,
        markedBy: "admin",
        markedAt: new Date()
      };
    });
    setAttendanceData(newData);
  };

  // Save attendance to database
  const saveAttendance = async () => {
    if (Object.keys(attendanceData).length === 0) {
      alert("No attendance data to save.");
      return;
    }

    setIsSaving(true);

    try {
      const batch = writeBatch(db);
      const attendanceRecords = [];

      Object.entries(attendanceData).forEach(([studentId, data]) => {
        const attendanceRecord = {
          studentId,
          date: selectedDate,
          status: data.status,
          time: data.time,
          remarks: data.remarks,
          markedBy: data.markedBy,
          markedAt: data.markedAt,
          createdAt: serverTimestamp()
        };

        attendanceRecords.push(attendanceRecord);

        // Add to batch
        const attendanceRef = doc(collection(db, "attendance"));
        batch.set(attendanceRef, attendanceRecord);
      });

      await batch.commit();

      // Update attendance history
      setAttendanceHistory(prev => [...attendanceRecords, ...prev]);
      
      alert("Attendance saved successfully!");
      setAttendanceData({});
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance. Please try again.");
      setIsSaving(false);
    }
  };

  // Export attendance data
  const exportAttendance = () => {
    const csvContent = [
      "Date,Student Name,Roll Number,Department,Year,Status,Time,Remarks",
      ...Object.entries(attendanceData).map(([studentId, data]) => {
        const student = students.find(s => s.id === studentId);
        return `"${selectedDate}","${student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim()}","${student?.rollNo}","${student?.department}","${student?.year}","${data.status}","${data.time}","${data.remarks}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    const total = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(d => d.status === "present").length;
    const absent = Object.values(attendanceData).filter(d => d.status === "absent").length;
    const late = Object.values(attendanceData).filter(d => d.status === "late").length;
    const excused = Object.values(attendanceData).filter(d => d.status === "excused").length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  const stats = calculateStats();

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
    initializeAttendance();
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
    setAttendanceData({});
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attendance Tracker</h2>
            <p className="text-gray-600">Track and manage student attendance</p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Attendance Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <select
              value={attendanceMode}
              onChange={(e) => setAttendanceMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="manual">Manual Entry</option>
              <option value="bulk">Bulk Update</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={selectAllStudents}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Select All Students</span>
          </button>

          <button
            onClick={clearSelection}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUndo} />
            <span>Clear Selection</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faHistory} />
            <span>Attendance History</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {attendanceMode === "bulk" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          
          <div className="flex items-center space-x-4">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {attendanceStatuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>

            <button
              onClick={bulkUpdateAttendance}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>Apply to All</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Statistics */}
      {Object.keys(attendanceData).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.presentPercentage}%</p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={exportAttendance}
              disabled={Object.keys(attendanceData).length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Export</span>
            </button>
            <button
              onClick={saveAttendance}
              disabled={isSaving || Object.keys(attendanceData).length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const attendance = attendanceData[student.id];
                const status = attendanceStatuses.find(s => s.id === (attendance?.status || "present"));
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                      </div>
                      <div className="text-xs text-gray-500">{student.year}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={attendance?.status || "present"}
                        onChange={(e) => updateAttendance(student.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          status?.id === "present" ? "bg-green-100 text-green-800 border-green-200" :
                          status?.id === "absent" ? "bg-red-100 text-red-800 border-red-200" :
                          status?.id === "late" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                          "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {attendanceStatuses.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {attendance?.time || "Not marked"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={attendance?.remarks || ""}
                        onChange={(e) => updateAttendance(student.id, attendance?.status || "present", e.target.value)}
                        placeholder="Add remarks..."
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
          
          {attendanceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No attendance history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceHistory.slice(0, 20).map((record, index) => {
                    const student = students.find(s => s.id === record.studentId);
                    const status = attendanceStatuses.find(s => s.id === record.status);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim()}
                          </div>
                          <div className="text-xs text-gray-500">{student?.rollNo}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            status?.id === "present" ? "bg-green-100 text-green-800" :
                            status?.id === "absent" ? "bg-red-100 text-red-800" :
                            status?.id === "late" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            <FontAwesomeIcon icon={status?.icon} className="mr-1" />
                            {status?.name}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{record.time}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{record.remarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
