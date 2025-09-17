import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaCheck, 
  FaSave, 
  FaTimes, 
  FaGraduationCap,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaStar,
  FaEdit
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentGrading = () => {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ungraded');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: '',
    rubric_scores: {}
  });

  const queryClient = useQueryClient();

  // Fetch assignments for dropdown
  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApiService.getAssignments(),
  });

  // Fetch submissions for selected assignment
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignment, { search: searchTerm, status: statusFilter }],
    queryFn: () => {
      if (!selectedAssignment) return { results: [] };
      return assignmentsApiService.getAssignmentSubmissions(selectedAssignment);
    },
    enabled: !!selectedAssignment,
  });

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, data }) => assignmentsApiService.gradeSubmission(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-submissions']);
      setGradingSubmission(null);
      setGradeData({ grade: '', feedback: '', rubric_scores: {} });
      toast.success('Submission graded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to grade submission: ${error.message}`);
    },
  });

  const handleGrade = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || '',
      rubric_scores: submission.rubric_scores || {}
    });
  };

  const handleSaveGrade = () => {
    if (!gradeData.grade) {
      toast.error('Grade is required');
      return;
    }
    
    const gradeValue = parseFloat(gradeData.grade);
    const maxPoints = gradingSubmission.assignment?.max_points || 100;
    
    if (gradeValue < 0 || gradeValue > maxPoints) {
      toast.error(`Grade must be between 0 and ${maxPoints}`);
      return;
    }

    gradeMutation.mutate({
      submissionId: gradingSubmission.id,
      data: gradeData
    });
  };

  const handleCancelGrade = () => {
    setGradingSubmission(null);
    setGradeData({ grade: '', feedback: '', rubric_scores: {} });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'missing':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'graded':
        return <FaCheck className="h-4 w-4" />;
      case 'late':
        return <FaExclamationCircle className="h-4 w-4" />;
      case 'missing':
        return <FaTimes className="h-4 w-4" />;
      default:
        return <FaClock className="h-4 w-4" />;
    }
  };

  const isLate = (submissionDate, dueDate) => {
    return new Date(submissionDate) > new Date(dueDate);
  };

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeLetter = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Submissions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load assignment submissions'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assignment Grading
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Grade and provide feedback on student submissions
          </p>
        </div>

        {/* Assignment Selection and Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Assignment
              </label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose an assignment</option>
                {assignments?.results?.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={!selectedAssignment}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={!selectedAssignment}
              >
                <option value="ungraded">Ungraded</option>
                <option value="graded">Graded</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grading Statistics */}
        {selectedAssignment && submissions?.results && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {submissions.results.length}
                  </p>
                </div>
                <FaGraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {submissions.results.filter(s => s.grade !== null && s.grade !== undefined).length}
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {submissions.results.filter(s => s.grade === null || s.grade === undefined).length}
                  </p>
                </div>
                <FaClock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(() => {
                      const gradedSubmissions = submissions.results.filter(s => s.grade !== null && s.grade !== undefined);
                      if (gradedSubmissions.length === 0) return 'N/A';
                      const average = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length;
                      return average.toFixed(1);
                    })()}
                  </p>
                </div>
                <FaStar className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        {selectedAssignment ? (
          <div className="space-y-4">
            {submissions?.results?.length > 0 ? (
              submissions.results.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FaUser className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {submission.student_name || submission.student?.name || 'Unknown Student'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="h-4 w-4" />
                            <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
                          </div>
                          {submission.grade !== null && submission.grade !== undefined && (
                            <div className="flex items-center space-x-1">
                              <FaGraduationCap className="h-4 w-4" />
                              <span className={`font-medium ${getGradeColor(submission.grade, submission.assignment?.max_points)}`}>
                                Grade: {submission.grade}/{submission.assignment?.max_points} ({getGradeLetter(submission.grade, submission.assignment?.max_points)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span>{submission.status}</span>
                      </span>
                      {isLate(submission.submitted_at, submission.assignment?.due_date) && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Late
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {submission.content && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Content:</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                          {submission.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            <FaFileAlt className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Previous Feedback:</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                          {submission.feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
                      <FaClock className="h-4 w-4" />
                      <span>Last updated: {new Date(submission.updated_at).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleGrade(submission)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>{submission.grade !== null && submission.grade !== undefined ? 'Update Grade' : 'Grade'}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaGraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Submissions Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No submissions have been made for this assignment yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFilter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select an Assignment
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose an assignment from the dropdown above to view and grade its submissions.
            </p>
          </div>
        )}

        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Grade Submission
                  </h2>
                  <button
                    onClick={handleCancelGrade}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {gradingSubmission.student_name || gradingSubmission.student?.name || 'Unknown Student'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {new Date(gradingSubmission.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Max Points:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {gradingSubmission.assignment?.max_points || 100}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grade Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="0"
                        max={gradingSubmission.assignment?.max_points || 100}
                        step="0.1"
                        placeholder="Enter grade"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        / {gradingSubmission.assignment?.max_points || 100}
                      </span>
                    </div>
                    {gradeData.grade && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Letter Grade: </span>
                        <span className={`font-medium ${getGradeColor(parseFloat(gradeData.grade), gradingSubmission.assignment?.max_points || 100)}`}>
                          {getGradeLetter(parseFloat(gradeData.grade), gradingSubmission.assignment?.max_points || 100)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          ({((parseFloat(gradeData.grade) / (gradingSubmission.assignment?.max_points || 100)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={6}
                      placeholder="Provide feedback for the student..."
                    />
                  </div>

                  {/* Submission Content Preview */}
                  {gradingSubmission.content && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Content:</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                          {gradingSubmission.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancelGrade}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveGrade}
                      disabled={gradeMutation.isPending}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {gradeMutation.isPending ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaSave className="h-4 w-4" />
                      )}
                      <span>Save Grade</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentGrading;
















