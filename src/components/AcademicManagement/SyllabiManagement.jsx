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
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBook
} from 'react-icons/fa';

const SyllabiManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [courses, setCourses] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    version: '1.0',
    academic_year: '',
    semester: '',
    learning_objectives: '',
    course_outline: '',
    assessment_methods: '',
    grading_policy: '',
    textbooks: '',
    additional_resources: '',
    status: 'DRAFT',
    approved_by: '',
    approved_at: ''
  });

  const queryClient = useQueryClient();

  // Fetch courses and approvers for dropdowns
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await academicApiService.getCourses();
        setCourses(response.results || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    const fetchApprovers = async () => {
      try {
        const res = await fetch('/api/v1/faculty/').then(r=>r.json()).catch(()=>({ results: [] }));
        setApprovers(res.results || []);
      } catch (_) {}
    };
    fetchCourses();
    fetchApprovers();
  }, []);

  // Auto-open modal if ?add=1 is present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === '1') setShowModal(true);
    } catch (_) {}
  }, []);

  // Fetch syllabi
  const { data: syllabiData, isLoading, error } = useQuery({
    queryKey: ['syllabi', searchTerm, statusFilter, semesterFilter],
    queryFn: () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (semesterFilter) params.semester = semesterFilter;
      return academicApiService.getSyllabi(params);
    }
  });

  // Create syllabus mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createSyllabus(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabi']);
      setShowModal(false);
      resetForm();
    }
  });

  // Update syllabus mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateSyllabus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabi']);
      setShowModal(false);
      setEditingSyllabus(null);
      resetForm();
    }
  });

  // Delete syllabus mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteSyllabus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabi']);
    }
  });

  const resetForm = () => {
    setFormData({
      course: '',
      version: '1.0',
      academic_year: '',
      semester: '',
      learning_objectives: '',
      course_outline: '',
      assessment_methods: '',
      grading_policy: '',
      textbooks: '',
      additional_resources: '',
      status: 'DRAFT',
      approved_by: '',
      approved_at: ''
    });
  };

  const handleEdit = (syllabus) => {
    setEditingSyllabus(syllabus);
    setFormData({
      course: syllabus.course,
      version: syllabus.version || '1.0',
      academic_year: syllabus.academic_year,
      semester: syllabus.semester,
      learning_objectives: syllabus.learning_objectives || '',
      course_outline: syllabus.course_outline || '',
      assessment_methods: syllabus.assessment_methods || '',
      grading_policy: syllabus.grading_policy || '',
      textbooks: syllabus.textbooks || '',
      additional_resources: syllabus.additional_resources || '',
      status: syllabus.status || 'DRAFT',
      approved_by: syllabus.approved_by || '',
      approved_at: syllabus.approved_at || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      course: parseInt(formData.course) || undefined,
      approved_by: formData.approved_by ? parseInt(formData.approved_by) : null
    };

    if (editingSyllabus) {
      updateMutation.mutate({ id: editingSyllabus.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  const syllabi = syllabiData?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading syllabi</h3>
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
                <FaFileAlt className="h-8 w-8 mr-3 text-green-600" />
                Syllabi Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create and manage course syllabi and learning objectives
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Syllabus
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
                  placeholder="Search syllabi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  setStatusFilter('');
                  setSemesterFilter('');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Syllabi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabi.map((syllabus) => (
            <div
              key={syllabus.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getCourseTitle(syllabus.course)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {syllabus.academic_year} - {syllabus.semester}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    syllabus.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : syllabus.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {syllabus.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {syllabus.learning_objectives}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(syllabus)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-md transition-colors"
                    title="Edit syllabus"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(syllabus.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                    title="Delete syllabus"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="View details"
                >
                  <FaEye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {syllabi.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No syllabi found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first syllabus.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Syllabus
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingSyllabus ? 'Edit Syllabus' : 'Add New Syllabus'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                    <input type="text" value={formData.version} onChange={(e)=>setFormData({ ...formData, version:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="1.0" />
                    <p className="text-xs text-gray-500 mt-1">Syllabus version</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Academic year
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">---------</option>
                      <option value="FALL">Fall</option>
                      <option value="SPRING">Spring</option>
                      <option value="SUMMER">Summer</option>
                      <option value="WINTER">Winter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning objectives</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.learning_objectives}
                      onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Course learning objectives"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course outline</label>
                    <textarea rows={4} value={formData.course_outline} onChange={(e)=>setFormData({ ...formData, course_outline:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Detailed course outline" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment methods</label>
                    <textarea rows={3} value={formData.assessment_methods} onChange={(e)=>setFormData({ ...formData, assessment_methods:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Assessment and evaluation methods" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grading policy</label>
                    <textarea rows={3} value={formData.grading_policy} onChange={(e)=>setFormData({ ...formData, grading_policy:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Grading policy and criteria" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Textbooks</label>
                    <textarea rows={3} value={formData.textbooks} onChange={(e)=>setFormData({ ...formData, textbooks:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Required and recommended textbooks" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional resources</label>
                    <textarea rows={3} value={formData.additional_resources} onChange={(e)=>setFormData({ ...formData, additional_resources:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Additional learning resources" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved by</label>
                    <select value={formData.approved_by} onChange={(e)=>setFormData({ ...formData, approved_by:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">---------</option>
                      {approvers.map(a => (
                        <option key={a.id} value={a.id}>{a.name || `${a.first_name || ''} ${a.last_name || ''}`.trim()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved at</label>
                    <input type="datetime-local" value={formData.approved_at} onChange={(e)=>setFormData({ ...formData, approved_at:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="-" />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingSyllabus(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSyllabus ? 'Update' : 'Create'}
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

export default SyllabiManagement;
