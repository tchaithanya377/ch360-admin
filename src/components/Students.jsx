import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaStar,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    fatherName: "",
    motherName: "",
    siblings: "",
    currentCourses: [{ course: "", progress: "" }],
    professionalExperience: [{ title: "", company: "", duration: "", description: "" }],
    skills: [""],
    projects: [{ name: "", description: "" }],
    education: { degree: "", university: "", year: "" },
    mentorDetails: { name: "", email: "", phone: "" },
    customFields: [],
    status: "active",
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  // Fetch students from Django API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await studentApiService.getStudents();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  // Handle Custom Field Change
  const handleCustomFieldChange = (index, e) => {
    const { name, value } = e.target;
    const customFields = [...studentData.customFields];
    customFields[index] = { ...customFields[index], [name]: value };
    setStudentData({ ...studentData, customFields });
  };

  // Add or Update Student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update student
        await studentApiService.updateStudent(editingId, studentData);
        setEditingId(null);
      } else {
        // Add new student
        await studentApiService.createStudent(studentData);
      }
      
      // Refresh the students list
      const studentsData = await studentApiService.getStudents();
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      
      // Reset form
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setStudentData({
      name: "",
      email: "",
      phone: "",
      address: "",
      fatherName: "",
      motherName: "",
      siblings: "",
      currentCourses: [{ course: "", progress: "" }],
      professionalExperience: [{ title: "", company: "", duration: "", description: "" }],
      skills: [""],
      projects: [{ name: "", description: "" }],
      education: { degree: "", university: "", year: "" },
      mentorDetails: { name: "", email: "", phone: "" },
      customFields: [],
      status: "active",
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
  };

  // Delete Student
  const handleDelete = async (id) => {
    try {
      await studentApiService.deleteStudent(id);
      setStudents(students.filter((student) => student.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Edit Student
  const handleEdit = (student) => {
    setStudentData(student);
    setEditingId(student.id);
    setShowForm(true);
  };

  // Add Custom Field
  const addCustomField = () => {
    setStudentData({
      ...studentData,
      customFields: [...studentData.customFields, { key: "", value: "" }],
    });
  };

  // Filter and search students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300 relative">
      {/* Dark mode background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 opacity-50"></div>
      <div className="relative z-10">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage student information, enrollment, and academic progress
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              setEditingId(null);
            }}
            className="mt-4 lg:mt-0 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="text-sm" />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Student Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingId ? "Edit Student" : "Add New Student"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <FaUserGraduate className="text-blue-500" />
                      <span>Personal Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={studentData.name}
                        onChange={handleChange}
                        required
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={studentData.email}
                        onChange={handleChange}
                        required
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={studentData.phone}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={studentData.address}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Family Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Family Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="fatherName"
                        placeholder="Father's Name"
                        value={studentData.fatherName}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        name="motherName"
                        placeholder="Mother's Name"
                        value={studentData.motherName}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        name="siblings"
                        placeholder="Number of Siblings"
                        value={studentData.siblings}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <FaGraduationCap className="text-green-500" />
                      <span>Education</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="degree"
                        placeholder="Degree"
                        value={studentData.education.degree}
                        onChange={(e) => {
                          const newEducation = { ...studentData.education, degree: e.target.value };
                          setStudentData({ ...studentData, education: newEducation });
                        }}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        name="university"
                        placeholder="University"
                        value={studentData.education.university}
                        onChange={(e) => {
                          const newEducation = { ...studentData.education, university: e.target.value };
                          setStudentData({ ...studentData, education: newEducation });
                        }}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        name="year"
                        placeholder="Graduation Year"
                        value={studentData.education.year}
                        onChange={(e) => {
                          const newEducation = { ...studentData.education, year: e.target.value };
                          setStudentData({ ...studentData, education: newEducation });
                        }}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Status and Enrollment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status & Enrollment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        name="status"
                        value={studentData.status}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                      <input
                        type="date"
                        name="enrollmentDate"
                        value={studentData.enrollmentDate}
                        onChange={handleChange}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      <FaCheck className="text-sm" />
                      <span>{editingId ? "Update Student" : "Add Student"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Students List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Students ({filteredStudents.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-12 text-center border border-gray-200 dark:border-gray-700">
              <FaUserGraduate className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No students found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first student"
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
              <AnimatePresence>
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 dark:hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {student.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(student.id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <FaEnvelope className="text-gray-400" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                          <FaPhone className="text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.education?.degree && (
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                          <FaGraduationCap className="text-gray-400" />
                          <span>{student.education.degree}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this student? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

export default ManageStudents;