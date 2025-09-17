import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { LoadingSpinner } from '../LazyComponent';

const CoursePrerequisitesManagement = () => {
  const [selectedPrerequisite, setSelectedPrerequisite] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    prerequisite_course: '',
    batch: '',
    is_mandatory: true,
    minimum_grade: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [checkForm, setCheckForm] = useState({
    student_id: '',
    batch_id: '',
    course_id: ''
  });
  const [checkResult, setCheckResult] = useState(null);
  const queryClient = useQueryClient();

  // Fetch course prerequisites
  const { data: prerequisites, isLoading, error } = useQuery({
    queryKey: ['coursePrerequisites', searchTerm, filterCourse],
    queryFn: () => academicApiService.getCoursePrerequisites({
      search: searchTerm,
      course: filterCourse
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch courses for dropdowns
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicApiService.getCourses(),
    staleTime: 10 * 60 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createCoursePrerequisite(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coursePrerequisites']);
      setShowForm(false);
      setFormData({
        course: '',
        prerequisite_course: '',
        batch: '',
        is_mandatory: true,
        minimum_grade: '',
        description: ''
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateCoursePrerequisite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coursePrerequisites']);
      setSelectedPrerequisite(null);
      setShowForm(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteCoursePrerequisite(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['coursePrerequisites']);
    },
  });

  // Check prerequisites mutation
  const checkPrerequisitesMutation = useMutation({
    mutationFn: ({ studentId, batchId, courseId }) => 
      academicApiService.checkPrerequisites(studentId, batchId, courseId),
    onSuccess: (data) => {
      setCheckResult(data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPrerequisite) {
      updateMutation.mutate({
        id: selectedPrerequisite.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (prerequisite) => {
    setSelectedPrerequisite(prerequisite);
    setFormData({
      course: (typeof prerequisite.course === 'object' ? prerequisite.course?.id : prerequisite.course) || '',
      prerequisite_course: (typeof prerequisite.prerequisite_course === 'object' ? prerequisite.prerequisite_course?.id : prerequisite.prerequisite_course) || '',
      batch: (typeof prerequisite.batch === 'object' ? prerequisite.batch?.id : prerequisite.batch) || '',
      is_mandatory: prerequisite.is_mandatory ?? true,
      minimum_grade: prerequisite.minimum_grade || '',
      description: prerequisite.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this prerequisite?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCheckPrerequisites = (e) => {
    e.preventDefault();
    if (checkForm.student_id && checkForm.batch_id && checkForm.course_id) {
      checkPrerequisitesMutation.mutate({
        studentId: checkForm.student_id,
        batchId: checkForm.batch_id,
        courseId: checkForm.course_id
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading prerequisites: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Prerequisites Management</h1>
          <p className="text-gray-600 mt-2">Manage course prerequisites and enrollment requirements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Prerequisite
        </button>
      </div>

      {/* Prerequisites Check Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Check Prerequisites</h2>
        <form onSubmit={handleCheckPrerequisites} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={checkForm.student_id}
              onChange={(e) => setCheckForm({ ...checkForm, student_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter student ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch ID
            </label>
            <input
              type="text"
              value={checkForm.batch_id}
              onChange={(e) => setCheckForm({ ...checkForm, batch_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter batch ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course ID
            </label>
            <input
              type="text"
              value={checkForm.course_id}
              onChange={(e) => setCheckForm({ ...checkForm, course_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course ID"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={checkPrerequisitesMutation.isPending}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {checkPrerequisitesMutation.isPending ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>
        
        {/* Check Result */}
        {checkResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Prerequisites Check Result:</h3>
            <div className={`p-3 rounded-lg ${
              checkResult.eligible 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-medium">
                {checkResult.eligible ? '✅ Eligible' : '❌ Not Eligible'}
              </p>
              {checkResult.missing_prerequisites && checkResult.missing_prerequisites.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Missing Prerequisites:</p>
                  <ul className="list-disc list-inside">
                    {checkResult.missing_prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search prerequisites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses?.results?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prerequisites Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prerequisite Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandatory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimum Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prerequisites?.results?.map((prerequisite) => (
                <tr key={prerequisite.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(typeof prerequisite.course === 'object' ? prerequisite.course?.name : prerequisite.course_title) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(typeof prerequisite.prerequisite_course === 'object' ? prerequisite.prerequisite_course?.name : prerequisite.prerequisite_course_title) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(typeof prerequisite.batch === 'object' ? prerequisite.batch?.name : prerequisite.batch_name) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prerequisite.is_mandatory 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prerequisite.is_mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prerequisite.minimum_grade || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(prerequisite)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prerequisite.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedPrerequisite ? 'Edit Prerequisite' : 'Add Prerequisite'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses?.results?.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prerequisite Course
                  </label>
                  <select
                    value={formData.prerequisite_course}
                    onChange={(e) => setFormData({ ...formData, prerequisite_course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Prerequisite Course</option>
                    {courses?.results?.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Grade
                  </label>
                  <input
                    type="text"
                    value={formData.minimum_grade}
                    onChange={(e) => setFormData({ ...formData, minimum_grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., B+, 75%"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_mandatory"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_mandatory" className="ml-2 block text-sm text-gray-900">
                  Mandatory Prerequisite
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPrerequisite(null);
                    setFormData({
                      course: '',
                      prerequisite_course: '',
                      batch: '',
                      is_mandatory: true,
                      minimum_grade: '',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePrerequisitesManagement;
