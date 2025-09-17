// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDjangoAuth } from '../../contexts/DjangoAuthContext';
import {
  faCalculator,
  faChartLine,
  faFileAlt,
  faDownload,
  faUpload,
  faSave,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faEye,
  faEdit,
  faLock,
  faUnlock,
  faHistory,
  faShieldAlt,
  faUserGraduate,
  faBook,
  faCalendarAlt,
  faChartBar,
  faCog,
  faBell,
  faPlus,
  faTrash,
  faArrowRight,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faGraduationCap,
  faUsers,
  faClipboardList,
  faFileSignature,
  faChartPie,
  faCalendarCheck,
  faCloudUploadAlt,
  faHome,
  faTrophy,
  faBookOpen,
  faSearch,
  faFilter,
  faPlay,
  faPause,
  faStop
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';

const GradeCalculation = ({ 
  coreEntities, 
  businessRules, 
  logAuditEvent 
}) => {
  const { user } = useDjangoAuth();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('2024-1');
  const [calculationMode, setCalculationMode] = useState('automatic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Enhanced state for grade calculation
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [calculatedGrades, setCalculatedGrades] = useState({});
  const [gradeHistory, setGradeHistory] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load students
        const studentsRef = collection(db, 'students');
        const studentsQuery = query(studentsRef, where('status', '==', 'active'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);

        // Load marks
        const marksRef = collection(db, 'marks');
        const marksQuery = query(marksRef, orderBy('enteredAt', 'desc'));
        const marksSnapshot = await getDocs(marksQuery);
        const marksData = marksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMarks(marksData);

        // Load existing grades
        const gradesRef = collection(db, 'grades');
        const gradesQuery = query(gradesRef, orderBy('createdAt', 'desc'));
        const gradesSnapshot = await getDocs(gradesQuery);
        const gradesData = gradesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGrades(gradesData);

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        console.error('Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter students based on search and department
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Calculate SGPA for a student
  const calculateSGPA = (studentId, semester) => {
    const studentMarks = marks.filter(mark => 
      mark.studentId === studentId && 
      mark.semester === semester &&
      mark.status === 'approved'
    );

    if (studentMarks.length === 0) return { sgpa: 0, totalCredits: 0, totalPoints: 0 };

    let totalCredits = 0;
    let totalPoints = 0;

    studentMarks.forEach(mark => {
      const credits = mark.credits || 3; // Default 3 credits per course
      const points = mark.gradePoints || 0;
      
      totalCredits += credits;
      totalPoints += (credits * points);
    });

    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    return {
      sgpa: parseFloat(sgpa.toFixed(2)),
      totalCredits,
      totalPoints
    };
  };

  // Calculate CGPA for a student
  const calculateCGPA = (studentId) => {
    const allStudentMarks = marks.filter(mark => 
      mark.studentId === studentId && 
      mark.status === 'approved'
    );

    if (allStudentMarks.length === 0) return { cgpa: 0, totalCredits: 0, totalPoints: 0 };

    let totalCredits = 0;
    let totalPoints = 0;

    allStudentMarks.forEach(mark => {
      const credits = mark.credits || 3;
      const points = mark.gradePoints || 0;
      
      totalCredits += credits;
      totalPoints += (credits * points);
    });

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    return {
      cgpa: parseFloat(cgpa.toFixed(2)),
      totalCredits,
      totalPoints
    };
  };

  // Get grade distribution
  const getGradeDistribution = (studentId, semester) => {
    const studentMarks = marks.filter(mark => 
      mark.studentId === studentId && 
      mark.semester === semester
    );

    const distribution = {};
    businessRules.gradingScheme.boundaries.forEach(grade => {
      distribution[grade] = 0;
    });

    studentMarks.forEach(mark => {
      const grade = mark.grade;
      if (distribution.hasOwnProperty(grade)) {
        distribution[grade]++;
      }
    });

    return distribution;
  };

  // Calculate grades for all students
  const calculateAllGrades = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      // Use Django auth user
      const newGrades = {};

      for (const student of filteredStudents) {
        const sgpa = calculateSGPA(student.id, selectedSemester);
        const cgpa = calculateCGPA(student.id);
        const gradeDistribution = getGradeDistribution(student.id, selectedSemester);

        const gradeData = {
          studentId: student.id,
          semester: selectedSemester,
          sgpa: sgpa.sgpa,
          cgpa: cgpa.cgpa,
          totalCredits: sgpa.totalCredits,
          totalPoints: sgpa.totalPoints,
          gradeDistribution,
          calculationMode,
          calculatedBy: user?.id,
          calculatedAt: serverTimestamp(),
          status: 'calculated'
        };

        const gradeRef = doc(collection(db, 'grades'));
        batch.set(gradeRef, gradeData);

        newGrades[student.id] = gradeData;
      }

      await batch.commit();
      setCalculatedGrades(newGrades);

      await logAuditEvent('grades', 'batch', 'grades_calculated', {
        semester: selectedSemester,
        count: filteredStudents.length,
        mode: calculationMode
      });

      console.log(`Grades calculated for ${filteredStudents.length} students!`);
    } catch (error) {
      console.error('Error calculating grades:', error);
      console.error('Failed to calculate grades');
    } finally {
      setSaving(false);
    }
  };

  // Export grades to CSV
  const exportGrades = () => {
    const gradesToExport = Object.values(calculatedGrades);
    
    if (gradesToExport.length === 0) {
      console.warn('No grades to export');
      return;
    }

    const csvData = gradesToExport.map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return {
        'Roll No': student?.rollNo || 'N/A',
        'Student Name': student?.name || 'N/A',
        'Semester': grade.semester,
        'SGPA': grade.sgpa,
        'CGPA': grade.cgpa,
        'Total Credits': grade.totalCredits,
        'Total Points': grade.totalPoints,
        'Status': grade.status,
        'Calculated At': grade.calculatedAt?.toDate?.() || new Date()
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades_${selectedSemester}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    logAuditEvent('grades', 'export', 'grades_exported', {
      semester: selectedSemester,
      count: gradesToExport.length
    });

    console.log('Grades exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading grade calculation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Grade Calculation System</h2>
            <p className="text-purple-100 text-lg">Calculate and manage student grades with advanced algorithms</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={faCalculator} className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="2024-1">2024-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2023-1">2023-1</option>
              <option value="2023-2">2023-2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calculation Mode</label>
            <select
              value={calculationMode}
              onChange={(e) => setCalculationMode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="weighted">Weighted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</label>
            <div className="flex space-x-2">
              <button
                onClick={calculateAllGrades}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Calculating...
                  </div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                    Calculate
                  </>
                )}
              </button>
              <button
                onClick={exportGrades}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredStudents.length} students found
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Student Grades</h3>
            <div className="flex items-center space-x-4 text-white">
              <span className="text-sm">Total Students: {filteredStudents.length}</span>
              <span className="text-sm">Semester: {selectedSemester}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Student</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Roll No</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Department</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">SGPA</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">CGPA</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Credits</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => {
                const sgpa = calculateSGPA(student.id, selectedSemester);
                const cgpa = calculateCGPA(student.id);
                const calculatedGrade = calculatedGrades[student.id];
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                          <FontAwesomeIcon icon={faUserGraduate} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{student.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        sgpa.sgpa >= 8.0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        sgpa.sgpa >= 6.0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        sgpa.sgpa >= 4.0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {sgpa.sgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cgpa.cgpa >= 8.0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        cgpa.cgpa >= 6.0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        cgpa.cgpa >= 4.0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {cgpa.cgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{sgpa.totalCredits}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        calculatedGrade ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {calculatedGrade ? 'Calculated' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                          <FontAwesomeIcon icon={faCalculator} />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                          <FontAwesomeIcon icon={faChartBar} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredStudents.length}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
              <FontAwesomeIcon icon={faUsers} className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average SGPA</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredStudents.length > 0 
                  ? (filteredStudents.reduce((sum, student) => sum + calculateSGPA(student.id, selectedSemester).sgpa, 0) / filteredStudents.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average CGPA</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredStudents.length > 0 
                  ? (filteredStudents.reduce((sum, student) => sum + calculateCGPA(student.id).cgpa, 0) / filteredStudents.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <FontAwesomeIcon icon={faTrophy} className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Calculated</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(calculatedGrades).length}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
              <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeCalculation;
