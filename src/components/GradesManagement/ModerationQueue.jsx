import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faCheckCircle,
  faTimes,
  faEye,
  faEdit,
  faTrash,
  faDownload,
  faUpload,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave,
  faExclamationTriangle,
  faArrowRight,
  faComments
} from '@fortawesome/free-solid-svg-icons';

const ModerationQueue = () => {
  const [moderationQueue, setModerationQueue] = useState([
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Data Structures',
      examType: 'Mid-Semester',
      examiner: 'Dr. Smith',
      submittedDate: '2024-03-10T10:30:00',
      status: 'pending',
      totalStudents: 45,
      averageMarks: 78.5,
      passRate: 91.1,
      priority: 'high',
      comments: 'High variance in marks distribution'
    },
    {
      id: 2,
      courseCode: 'EE201',
      courseName: 'Electrical Circuits',
      examType: 'End-Semester',
      examiner: 'Prof. Johnson',
      submittedDate: '2024-03-08T14:20:00',
      status: 'under_review',
      totalStudents: 38,
      averageMarks: 72.3,
      passRate: 84.2,
      priority: 'medium',
      comments: 'Normal distribution observed'
    },
    {
      id: 3,
      courseCode: 'ME301',
      courseName: 'Thermodynamics',
      examType: 'Practical',
      examiner: 'Dr. Brown',
      submittedDate: '2024-03-07T09:15:00',
      status: 'approved',
      totalStudents: 25,
      averageMarks: 85.2,
      passRate: 96.0,
      priority: 'low',
      comments: 'Excellent performance'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModerationForm, setShowModerationForm] = useState(false);
  const [moderationForm, setModerationForm] = useState({
    action: 'approve',
    comments: '',
    adjustments: []
  });

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    course: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'under_review': return faEye;
      case 'approved': return faCheckCircle;
      case 'rejected': return faTimes;
      default: return faClock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleModeration = (item) => {
    setSelectedItem(item);
    setShowModerationForm(true);
  };

  const handleModerationSubmit = (e) => {
    e.preventDefault();
    
    if (selectedItem) {
      setModerationQueue(moderationQueue.map(item => 
        item.id === selectedItem.id 
          ? { ...item, status: moderationForm.action === 'approve' ? 'approved' : 'rejected' }
          : item
      ));
    }
    
    setShowModerationForm(false);
    setSelectedItem(null);
    setModerationForm({ action: 'approve', comments: '', adjustments: [] });
  };

  const filteredQueue = moderationQueue.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.course && !item.courseCode.includes(filters.course)) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Moderation Queue</h2>
          <p className="text-gray-600">Review and moderate exam results before publication</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input
              type="text"
              value={filters.course}
              onChange={(e) => setFilters({...filters, course: e.target.value})}
              placeholder="Search course..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ status: '', priority: '', course: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Moderation</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredQueue.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.courseCode} - {item.courseName}</h4>
                    <p className="text-sm text-gray-600">{item.examType}</p>
                    <p className="text-sm text-gray-500">Examiner: {item.examiner}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(item.status)} className="mr-1" />
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{item.totalStudents}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{item.averageMarks.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Marks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{item.passRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Pass Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(item.submittedDate)}</p>
                  </div>
                </div>
                
                {item.comments && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faComments} className="text-gray-400 mt-1 mr-2" />
                      <p className="text-sm text-gray-700">{item.comments}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Submitted {formatDate(item.submittedDate)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleModeration(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                      Review
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      <FontAwesomeIcon icon={faDownload} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moderation Form Modal */}
      {showModerationForm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Moderate: {selectedItem.courseCode} - {selectedItem.courseName}
              </h3>
              <button
                onClick={() => {
                  setShowModerationForm(false);
                  setSelectedItem(null);
                  setModerationForm({ action: 'approve', comments: '', adjustments: [] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Examiner</p>
                  <p className="font-medium">{selectedItem.examiner}</p>
                </div>
                <div>
                  <p className="text-gray-600">Exam Type</p>
                  <p className="font-medium">{selectedItem.examType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Students</p>
                  <p className="font-medium">{selectedItem.totalStudents}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average Marks</p>
                  <p className="font-medium">{selectedItem.averageMarks.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pass Rate</p>
                  <p className="font-medium">{selectedItem.passRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium">{formatDate(selectedItem.submittedDate)}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleModerationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moderation Action</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="approve"
                      checked={moderationForm.action === 'approve'}
                      onChange={(e) => setModerationForm({...moderationForm, action: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Approve for publication</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="reject"
                      checked={moderationForm.action === 'reject'}
                      onChange={(e) => setModerationForm({...moderationForm, action: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Return for revision</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moderation Comments</label>
                <textarea
                  value={moderationForm.comments}
                  onChange={(e) => setModerationForm({...moderationForm, comments: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your moderation comments..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModerationForm(false);
                    setSelectedItem(null);
                    setModerationForm({ action: 'approve', comments: '', adjustments: [] });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md font-medium ${
                    moderationForm.action === 'approve'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {moderationForm.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {moderationQueue.filter(item => item.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faEye} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {moderationQueue.filter(item => item.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {moderationQueue.filter(item => item.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {moderationQueue.filter(item => item.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationQueue;
