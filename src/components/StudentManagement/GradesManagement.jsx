import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faDownload,
  faUpload,
  faSearch,
  faFilter,
  faGraduationCap,
  faChartLine,
  faAward,
  faCalculator
} from "@fortawesome/free-solid-svg-icons";
const GradesManagement = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    subject: "",
    marks: "",
    totalMarks: 100,
    semester: "",
    academicYear: "",
    grade: "",
    percentage: ""
  });

  // Grade calculation function
  const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    let grade = "";
    let gradePoint = 0;

    if (percentage >= 90) {
      grade = "A+";
      gradePoint = 4.0;
    } else if (percentage >= 80) {
      grade = "A";
      gradePoint = 3.7;
    } else if (percentage >= 70) {
      grade = "B+";
      gradePoint = 3.3;
    } else if (percentage >= 60) {
      grade = "B";
      gradePoint = 3.0;
    } else if (percentage >= 50) {
      grade = "C+";
      gradePoint = 2.3;
    } else if (percentage >= 40) {
      grade = "C";
      gradePoint = 2.0;
    } else {
      grade = "F";
      gradePoint = 0.0;
    }

    return { grade, gradePoint, percentage };
  };

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, []);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "students"));
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "grades"));
      const gradesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGrades(gradesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setLoading(false);
    }
  };

  const handleAddGrade = async () => {
    if (!newGrade.studentId || !newGrade.subject || !newGrade.marks) {
      alert("Please fill all required fields");
      return;
    }

    const { grade, gradePoint, percentage } = calculateGrade(
      parseFloat(newGrade.marks),
      parseFloat(newGrade.totalMarks)
    );

    try {
      await addDoc(collection(db, "grades"), {
        ...newGrade,
        marks: parseFloat(newGrade.marks),
        totalMarks: parseFloat(newGrade.totalMarks),
        grade,
        gradePoint,
        percentage,
        timestamp: new Date()
      });

      setNewGrade({
        studentId: "",
        subject: "",
        marks: "",
        totalMarks: 100,
        semester: "",
        academicYear: "",
        grade: "",
        percentage: ""
      });
      setShowAddForm(false);
      fetchGrades();
    } catch (error) {
      console.error("Error adding grade:", error);
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;

    const { grade, gradePoint, percentage } = calculateGrade(
      parseFloat(editingGrade.marks),
      parseFloat(editingGrade.totalMarks)
    );

    try {
      await updateDoc(doc(db, "grades", editingGrade.id), {
        ...editingGrade,
        marks: parseFloat(editingGrade.marks),
        totalMarks: parseFloat(editingGrade.totalMarks),
        grade,
        gradePoint,
        percentage,
        updatedAt: new Date()
      });

      setEditingGrade(null);
      fetchGrades();
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await deleteDoc(doc(db, "grades", gradeId));
        fetchGrades();
      } catch (error) {
        console.error("Error deleting grade:", error);
      }
    }
  };

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const matchesSearch = student && 
      (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       grade.subject?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !filterDepartment || (student && student.department === filterDepartment);
    const matchesYear = !filterYear || (student && student.Year === filterYear);

    return matchesSearch && matchesDepartment && matchesYear;
  });

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  const getStudentRollNo = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.rollNo : "N/A";
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-green-600 bg-green-100";
      case "B+":
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C+":
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const calculateGPA = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    
    const totalGradePoints = studentGrades.reduce((sum, grade) => sum + (grade.gradePoint || 0), 0);
    return (totalGradePoints / studentGrades.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-500 p-3 rounded-full">
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Grades Management</h1>
              <p className="text-gray-600">Manage student grades, marks, and academic performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Grade</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FontAwesomeIcon icon={faDownload} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {Array.from(new Set(students.map(s => s.department))).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            {Array.from(new Set(students.map(s => s.Year))).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterDepartment("");
              setFilterYear("");
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Add Grade Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Add New Grade</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newGrade.studentId}
              onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.rollNo}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Subject"
              value={newGrade.subject}
              onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Marks"
              value={newGrade.marks}
              onChange={(e) => setNewGrade({ ...newGrade, marks: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Total Marks"
              value={newGrade.totalMarks}
              onChange={(e) => setNewGrade({ ...newGrade, totalMarks: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Semester"
              value={newGrade.semester}
              onChange={(e) => setNewGrade({ ...newGrade, semester: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Academic Year"
              value={newGrade.academicYear}
              onChange={(e) => setNewGrade({ ...newGrade, academicYear: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGrade}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Add Grade
            </button>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No grades found
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getStudentName(grade.studentId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getStudentRollNo(grade.studentId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {grade.marks}/{grade.totalMarks}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.percentage?.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                        {grade.grade} ({grade.gradePoint})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateGPA(grade.studentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingGrade(grade)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Grade</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={editingGrade.subject}
                  onChange={(e) => setEditingGrade({ ...editingGrade, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input
                  type="number"
                  value={editingGrade.marks}
                  onChange={(e) => setEditingGrade({ ...editingGrade, marks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={editingGrade.totalMarks}
                  onChange={(e) => setEditingGrade({ ...editingGrade, totalMarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="text"
                  value={editingGrade.semester}
                  onChange={(e) => setEditingGrade({ ...editingGrade, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingGrade(null)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGrade}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesManagement;
