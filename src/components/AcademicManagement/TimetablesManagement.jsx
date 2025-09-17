import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBook,
  FaUser
} from 'react-icons/fa';

const TimetablesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    faculty: '',
    academic_year: '',
    semester: '',
    timetable_type: 'REGULAR',
    day_of_week: '',
    start_time: '',
    end_time: '',
    room: '',
    is_active: true,
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch courses and faculty for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, facultyResponse] = await Promise.all([
          academicApiService.getCourses(),
          // Note: You might need to adjust this based on your faculty API endpoint
          fetch('/api/v1/faculty/').then(res => res.json()).catch(() => ({ results: [] }))
        ]);
        setCourses(coursesResponse.results || []);
        setFaculty(facultyResponse.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Auto-open modal if ?add=1 is present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === '1') setShowModal(true);
    } catch (_) {}
  }, []);

  // Fetch timetables
  const { data: timetablesData, isLoading, error } = useQuery({
    queryKey: ['timetables', searchTerm, dayFilter, semesterFilter],
    queryFn: () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (dayFilter) params.day_of_week = dayFilter;
      if (semesterFilter) params.semester = semesterFilter;
      return academicApiService.getTimetables(params);
    }
  });

  // Create timetable mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetables']);
      setShowModal(false);
      resetForm();
    }
  });

  // Update timetable mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateTimetable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetables']);
      setShowModal(false);
      setEditingTimetable(null);
      resetForm();
    }
  });

  // Delete timetable mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetables']);
    }
  });

  const resetForm = () => {
    setFormData({
      course: '',
      faculty: '',
      academic_year: '',
      semester: '',
      timetable_type: 'REGULAR',
      day_of_week: '',
      start_time: '',
      end_time: '',
      room: '',
      is_active: true,
      notes: ''
    });
  };

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    setFormData({
      course: timetable.course,
      faculty: timetable.faculty,
      academic_year: timetable.academic_year,
      semester: timetable.semester,
      timetable_type: timetable.timetable_type || 'REGULAR',
      day_of_week: timetable.day_of_week,
      start_time: timetable.start_time,
      end_time: timetable.end_time,
      room: timetable.room,
      is_active: timetable.is_active !== false,
      notes: timetable.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      course: parseInt(formData.course),
      faculty: parseInt(formData.faculty)
    };

    if (editingTimetable) {
      updateMutation.mutate({ id: editingTimetable.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? `${facultyMember.first_name} ${facultyMember.last_name}` : 'Unknown Faculty';
  };

  const timetables = timetablesData?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading timetables</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaClock className="h-8 w-8 mr-3 text-orange-600" />
                Timetables Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Schedule classes, manage time slots and room assignments
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Timetable
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timetables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of Week
              </label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Days</option>
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Semesters</option>
                <option value="FALL">Fall</option>
                <option value="SPRING">Spring</option>
                <option value="SUMMER">Summer</option>
                <option value="WINTER">Winter</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDayFilter('');
                  setSemesterFilter('');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Timetables Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Class Timetables
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {timetables.map((timetable) => (
                  <tr key={timetable.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getCourseTitle(timetable.course)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {timetable.academic_year} - {timetable.semester}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getFacultyName(timetable.faculty)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {timetable.day_of_week}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {timetable.start_time} - {timetable.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {timetable.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(timetable)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Edit timetable"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(timetable.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete timetable"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="View details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {timetables.length === 0 && (
          <div className="text-center py-12">
            <FaClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No timetables found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first timetable entry.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Timetable
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingTimetable ? 'Edit Timetable' : 'Add New Timetable'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course section
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">---------</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timetable type</label>
                    <select value={formData.timetable_type} onChange={(e)=>setFormData({ ...formData, timetable_type:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="REGULAR">Regular Schedule</option>
                      <option value="EXAM">Exam Schedule</option>
                      <option value="SPECIAL">Special Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Faculty
                    </label>
                    <select
                      required
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select faculty</option>
                      {faculty.map((facultyMember) => (
                        <option key={facultyMember.id} value={facultyMember.id}>
                          {facultyMember.first_name} {facultyMember.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="FALL">Fall</option>
                      <option value="SPRING">Spring</option>
                      <option value="SUMMER">Summer</option>
                      <option value="WINTER">Winter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Day of Week
                    </label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">---------</option>
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start time
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <button type="button" className="text-orange-600 hover:underline" onClick={()=>setFormData({ ...formData, start_time: new Date().toISOString().slice(11,16) })}>Now</button>
                        <span>Note: You are 5.5 hours ahead of server time.</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End time
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <button type="button" className="text-orange-600 hover:underline" onClick={()=>setFormData({ ...formData, end_time: new Date().toISOString().slice(11,16) })}>Now</button>
                        <span>Note: You are 5.5 hours ahead of server time.</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Classroom or venue"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="isActive" type="checkbox" checked={formData.is_active} onChange={(e)=>setFormData({ ...formData, is_active:e.target.checked })} className="h-4 w-4" />
                    <label htmlFor="isActive" className="text-sm">Is active</label>
                  </div>
                  <p className="text-xs text-gray-500 -mt-2">Whether this timetable entry is active</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea rows={3} value={formData.notes} onChange={(e)=>setFormData({ ...formData, notes:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Additional notes" />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTimetable(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTimetable ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetablesManagement;
