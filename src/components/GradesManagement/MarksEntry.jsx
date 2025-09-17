// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDjangoAuth } from '../../contexts/DjangoAuthContext';
import {
  faSearch,
  faFilter,
  faDownload,
  faUpload,
  faSave,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faCalculator,
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
  faFileAlt,
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
  faBookOpen
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

const MarksEntry = ({ 
  userRole, 
  currentSemester, 
  selectedDepartment, 
  businessRules, 
  permissions, 
  logAuditEvent,
  workflowStates,
  setWorkflowStates,
  coreEntities
}) => {
  const { user } = useDjangoAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [gradeCalculationMode, setGradeCalculationMode] = useState('automatic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Enhanced state for comprehensive marks management
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentMarks, setCurrentMarks] = useState({});

  // Validation state
  const [validationState, setValidationState] = useState({
    passingCriteria: businessRules.passingCriteria,
    gradeWeights: businessRules.gradeWeights,
    gradingScheme: businessRules.gradingScheme
  });

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load courses
        const coursesRef = collection(db, 'courses');
        const coursesQuery = query(coursesRef, where('status', '==', 'active'));
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);

        // Load exams
        const examsRef = collection(db, 'exams');
        const examsQuery = query(examsRef, where('status', '==', 'scheduled'));
        const examsSnapshot = await getDocs(examsQuery);
        const examsData = examsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExams(examsData);

        // Load students
        const studentsRef = collection(db, 'students');
        const studentsQuery = query(studentsRef, where('status', '==', 'active'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        console.error('Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter students based on course enrollment
  const filteredStudents = students.filter(student => {
    if (!selectedCourse) return false;
    return student.enrolledCourses?.includes(selectedCourse) || true; // Simplified for demo
  });

  // Handle marks input change
  const handleMarksChange = (studentId, examType, value) => {
    setCurrentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [examType]: value
      }
    }));
  };

  // Calculate total marks
  const calculateTotalMarks = (studentId) => {
    const studentMarks = currentMarks[studentId] || {};
    const internal = parseFloat(studentMarks.internal) || 0;
    const midSemester = parseFloat(studentMarks.midSemester) || 0;
    const endSemester = parseFloat(studentMarks.endSemester) || 0;
    
    const weights = businessRules.gradeWeights;
    return (internal * weights.internal / 100) + 
           (midSemester * weights.midSemester / 100) + 
           (endSemester * weights.endSemester / 100);
  };

  // Calculate grade based on total marks
  const calculateGrade = (totalMarks) => {
    const scheme = businessRules.gradingScheme.boundaries;
    for (const [grade, range] of Object.entries(scheme)) {
      if (totalMarks >= range.min && totalMarks <= range.max) {
        return { grade, points: range.points };
      }
    }
    return { grade: 'F', points: 0 };
  };

  // Save marks to Firebase
  const saveMarks = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      // Use Django auth user

      for (const [studentId, marksData] of Object.entries(currentMarks)) {
        const totalMarks = calculateTotalMarks(studentId);
        const gradeInfo = calculateGrade(totalMarks);
        
        const markDoc = {
          studentId,
          courseId: selectedCourse,
          examId: selectedExam,
          semester: currentSemester,
          marks: marksData,
          totalMarks,
          grade: gradeInfo.grade,
          gradePoints: gradeInfo.points,
          status: 'draft',
          enteredBy: user?.id,
          enteredAt: serverTimestamp(),
          lastModified: serverTimestamp()
        };

        const markRef = doc(collection(db, 'marks'));
        batch.set(markRef, markDoc);
      }

      await batch.commit();
      
      // Log audit event
      await logAuditEvent('marks', 'batch', 'marks_entered', {
        courseId: selectedCourse,
        examId: selectedExam,
        count: Object.keys(currentMarks).length
      });

      console.log('Marks saved successfully!');
      setCurrentMarks({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving marks:', error);
      console.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  // Submit for moderation
  const submitForModeration = async () => {
    try {
      const batch = writeBatch(db);
      
      for (const [studentId, marksData] of Object.entries(currentMarks)) {
        const markRef = doc(collection(db, 'marks'), studentId);
        batch.update(markRef, {
          status: 'under_moderation',
          submittedAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      await logAuditEvent('marks', 'batch', 'submitted_for_moderation', {
        courseId: selectedCourse,
        examId: selectedExam,
        count: Object.keys(currentMarks).length
      });

      console.log('Marks submitted for moderation!');
      setWorkflowStates(prev => ({ ...prev, marksEntry: 'under_moderation' }));
    } catch (error) {
      console.error('Error submitting for moderation:', error);
      console.error('Failed to submit for moderation');
    }
  };

  // Validation function
  const validateMarks = () => {
    const errors = {};
    
    for (const [studentId, marksData] of Object.entries(currentMarks)) {
      const student = students.find(s => s.id === studentId);
      if (!student) continue;

      const internal = parseFloat(marksData.internal) || 0;
      const midSemester = parseFloat(marksData.midSemester) || 0;
      const endSemester = parseFloat(marksData.endSemester) || 0;

      if (internal < 0 || internal > 100) {
        errors[`${studentId}_internal`] = 'Internal marks must be between 0-100';
      }
      if (midSemester < 0 || midSemester > 100) {
        errors[`${studentId}_midSemester`] = 'Mid-semester marks must be between 0-100';
      }
      if (endSemester < 0 || endSemester > 100) {
        errors[`${studentId}_endSemester`] = 'End-semester marks must be between 0-100';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marks entry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Marks Entry System</h2>
            <p className="text-green-100 text-lg">Enter and manage student marks with real-time validation</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={faEdit} className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {exam.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Enter Marks
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Bulk Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Marks Entry Table */}
      {selectedCourse && selectedExam && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Student Marks Entry</h3>
              <div className="flex items-center space-x-4 text-white">
                <span className="text-sm">Total Students: {filteredStudents.length}</span>
                <span className="text-sm">Status: {workflowStates.marksEntry}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Internal ({businessRules.gradeWeights.internal}%)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Mid-Semester ({businessRules.gradeWeights.midSemester}%)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    End-Semester ({businessRules.gradeWeights.endSemester}%)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => {
                  const studentMarks = currentMarks[student.id] || {};
                  const totalMarks = calculateTotalMarks(student.id);
                  const gradeInfo = calculateGrade(totalMarks);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentMarks.internal || ''}
                          onChange={(e) => handleMarksChange(student.id, 'internal', e.target.value)}
                          className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors[`${student.id}_internal`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={!isEditing}
                        />
                        {validationErrors[`${student.id}_internal`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`${student.id}_internal`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentMarks.midSemester || ''}
                          onChange={(e) => handleMarksChange(student.id, 'midSemester', e.target.value)}
                          className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors[`${student.id}_midSemester`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={!isEditing}
                        />
                        {validationErrors[`${student.id}_midSemester`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`${student.id}_midSemester`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentMarks.endSemester || ''}
                          onChange={(e) => handleMarksChange(student.id, 'endSemester', e.target.value)}
                          className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors[`${student.id}_endSemester`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={!isEditing}
                        />
                        {validationErrors[`${student.id}_endSemester`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`${student.id}_endSemester`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          totalMarks >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {totalMarks.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          gradeInfo.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {gradeInfo.grade} ({gradeInfo.points})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <FontAwesomeIcon icon={faCalculator} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (validateMarks()) {
                        saveMarks();
                      }
                    }}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Save Marks
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={submitForModeration}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium"
                  >
                    <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                    Submit for Moderation
                  </button>
                </div>
                
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {selectedCourse && selectedExam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Marks Entered</p>
                <p className="text-3xl font-bold text-gray-900">{Object.keys(currentMarks).length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredStudents.length > 0 
                    ? (filteredStudents.reduce((sum, student) => sum + calculateTotalMarks(student.id), 0) / filteredStudents.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <FontAwesomeIcon icon={faChartBar} className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredStudents.length > 0 
                    ? ((filteredStudents.filter(student => calculateTotalMarks(student.id) >= 40).length / filteredStudents.length) * 100).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <FontAwesomeIcon icon={faTrophy} className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
