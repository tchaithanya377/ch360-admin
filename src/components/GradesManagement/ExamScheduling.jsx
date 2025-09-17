import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faUserGraduate,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSave,
  faTimes,
  faSearch,
  faFilter,
  faDownload,
  faPrint,
  faBell,
  faCalendarCheck,
  faBuilding,
  faUsers,
  faExclamationCircle,
  faCheckDouble,
  faInfoCircle,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

const ExamScheduling = () => {
  const [exams, setExams] = useState([
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Data Structures',
      examType: 'Mid-Semester',
      date: '2024-03-15',
      startTime: '10:00',
      endTime: '12:00',
      duration: '2 hours',
      venue: 'Room 101',
      capacity: 50,
      enrolledStudents: 45,
      invigilators: ['Dr. Smith', 'Prof. Johnson'],
      status: 'scheduled',
      seatingPlan: 'generated'
    },
    {
      id: 2,
      courseCode: 'EE201',
      courseName: 'Electrical Circuits',
      examType: 'End-Semester',
      date: '2024-03-20',
      startTime: '14:00',
      endTime: '17:00',
      duration: '3 hours',
      venue: 'Room 205',
      capacity: 40,
      enrolledStudents: 38,
      invigilators: ['Dr. Brown', 'Prof. Davis'],
      status: 'scheduled',
      seatingPlan: 'pending'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    examType: 'Mid-Semester',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: '',
    invigilators: []
  });

  const [venues, setVenues] = useState([
    { id: 1, name: 'Room 101', capacity: 50, type: 'Classroom' },
    { id: 2, name: 'Room 205', capacity: 40, type: 'Classroom' },
    { id: 3, name: 'Lab 1', capacity: 30, type: 'Laboratory' },
    { id: 4, name: 'Auditorium A', capacity: 100, type: 'Auditorium' }
  ]);

  const [invigilators, setInvigilators] = useState([
    { id: 1, name: 'Dr. Smith', department: 'Computer Science' },
    { id: 2, name: 'Prof. Johnson', department: 'Computer Science' },
    { id: 3, name: 'Dr. Brown', department: 'Electrical Engineering' },
    { id: 4, name: 'Prof. Davis', department: 'Electrical Engineering' }
  ]);

  const examTypes = [
    'Mid-Semester',
    'End-Semester',
    'Practical',
    'Viva',
    'Quiz',
    'Assignment',
    'Supplementary'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getSeatingPlanColor = (status) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExam) {
      // Update existing exam
      setExams(exams.map(exam => 
        exam.id === editingExam.id ? { ...formData, id: exam.id, status: 'scheduled', seatingPlan: 'pending' } : exam
      ));
    } else {
      // Add new exam
      const newExam = {
        ...formData,
        id: Date.now(),
        status: 'scheduled',
        seatingPlan: 'pending',
        enrolledStudents: 0
      };
      setExams([...exams, newExam]);
    }
    setShowForm(false);
    setEditingExam(null);
    setFormData({
      courseCode: '',
      courseName: '',
      examType: 'Mid-Semester',
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      capacity: '',
      invigilators: []
    });
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData(exam);
    setShowForm(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== examId));
    }
  };

  const generateSeatingPlan = (examId) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, seatingPlan: 'generated' } : exam
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Exam Scheduling System</h2>
            <p className="text-green-100 text-lg">Schedule exams, allocate venues, and manage invigilation duties</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Exams: {exams.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Scheduled: {exams.filter(e => e.status === 'scheduled').length}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Exam Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingExam(null);
                  setFormData({
                    courseCode: '',
                    courseName: '',
                    examType: 'Mid-Semester',
                    date: '',
                    startTime: '',
                    endTime: '',
                    venue: '',
                    capacity: '',
                    invigilators: []
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({...formData, examType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  >
                    {examTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.name}>
                        {venue.name} (Capacity: {venue.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExam(null);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {editingExam ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exams List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Scheduled Exams</h3>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-xl" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.courseCode}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.courseName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.examType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{exam.date}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.startTime} - {exam.endTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{exam.venue}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Capacity: {exam.capacity}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{exam.enrolledStudents}/{exam.capacity}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeatingPlanColor(exam.seatingPlan)}`}>
                          {exam.seatingPlan}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => generateSeatingPlan(exam.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Generate Seating Plan"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Venue Management</h4>
            <FontAwesomeIcon icon={faBuilding} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Manage exam venues and their capacities</p>
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
            Manage Venues
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Invigilation Duties</h4>
            <FontAwesomeIcon icon={faUsers} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Assign invigilators to exam sessions</p>
          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
            Assign Duties
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Seating Plans</h4>
            <FontAwesomeIcon icon={faDownload} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Generate and print seating arrangements</p>
          <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
            Generate Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamScheduling;
