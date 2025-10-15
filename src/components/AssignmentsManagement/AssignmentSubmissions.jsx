import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaEye, 
  FaDownload, 
  FaTrash, 
  FaCheck, 
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
  FaExclamationCircle
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentSubmissions = () => {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingSubmission, setViewingSubmission] = useState(null);

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

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: (submissionId) => assignmentsApiService.deleteSubmission(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-submissions']);
      toast.success('Submission deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete submission: ${error.message}`);
    },
  });

  const handleDelete = (submissionId, studentName) => {
    if (window.confirm(`Are you sure you want to delete the submission from "${studentName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(submissionId);
    }
  };

  const handleView = (submission) => {
    setViewingSubmission(submission);
  };

  const handleCloseView = () => {
    setViewingSubmission(null);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            Assignment Submissions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage student submissions for assignments
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
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
                <option value="missing">Missing</option>
              </select>
            </div>
          </div>
        </div>

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
                          {submission.grade && (
                            <div className="flex items-center space-x-1">
                              <FaGraduationCap className="h-4 w-4" />
                              <span>Grade: {submission.grade}/{submission.assignment?.max_points}</span>
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
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                          {submission.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                      <div className="space-y-2">
                        {submission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FaFileAlt className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                                </p>
                                {attachment.size && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {attachment.url && (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                title="Download file"
                              >
                                <FaDownload className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h4>
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(submission)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View submission"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(submission.id, submission.student_name || submission.student?.name)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete submission"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
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
              Choose an assignment from the dropdown above to view its submissions.
            </p>
          </div>
        )}

        {/* View Submission Modal */}
        {viewingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Submission Details
                  </h2>
                  <button
                    onClick={handleCloseView}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {viewingSubmission.student_name || viewingSubmission.student?.name || 'Unknown Student'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {new Date(viewingSubmission.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center space-x-1 w-fit ${getStatusColor(viewingSubmission.status)}`}>
                          {getStatusIcon(viewingSubmission.status)}
                          <span>{viewingSubmission.status}</span>
                        </span>
                      </div>
                      {viewingSubmission.grade && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Grade:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {viewingSubmission.grade}/{viewingSubmission.assignment?.max_points}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {new Date(viewingSubmission.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Content */}
                  {viewingSubmission.content && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Content:</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {viewingSubmission.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {viewingSubmission.attachments && viewingSubmission.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                      <div className="space-y-3">
                        {viewingSubmission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FaFileAlt className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                                </p>
                                {attachment.size && (
                                  <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {attachment.url && (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <FaDownload className="h-4 w-4" />
                                <span>Download</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {viewingSubmission.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {viewingSubmission.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissions;

















