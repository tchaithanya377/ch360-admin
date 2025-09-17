import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
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
  faArrowRight,
  faComments,
  faMoneyBillWave,
  faFileAlt,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';

const RevaluationPortal = () => {
  const [revaluationRequests, setRevaluationRequests] = useState([
    {
      id: 1,
      studentId: '23CS001',
      studentName: 'John Doe',
      courseCode: 'CS301',
      courseName: 'Data Structures',
      examType: 'Mid-Semester',
      originalMarks: 65,
      maxMarks: 100,
      originalGrade: 'C+',
      requestDate: '2024-03-10T10:30:00',
      status: 'pending',
      feeAmount: 500,
      feePaid: false,
      reason: 'Discrepancy in marks calculation',
      examiner: 'Dr. Smith',
      assignedTo: null,
      result: null,
      comments: ''
    },
    {
      id: 2,
      studentId: '23EE002',
      studentName: 'Sarah Wilson',
      courseCode: 'EE201',
      courseName: 'Electrical Circuits',
      examType: 'End-Semester',
      originalMarks: 72,
      maxMarks: 100,
      originalGrade: 'B',
      requestDate: '2024-03-08T14:20:00',
      status: 'under_review',
      feeAmount: 500,
      feePaid: true,
      reason: 'Answer script not properly evaluated',
      examiner: 'Prof. Johnson',
      assignedTo: 'Dr. Brown',
      result: null,
      comments: 'Assigned to Dr. Brown for review'
    },
    {
      id: 3,
      studentId: '23ME003',
      studentName: 'Michael Brown',
      courseCode: 'ME301',
      courseName: 'Thermodynamics',
      examType: 'Practical',
      originalMarks: 58,
      maxMarks: 100,
      originalGrade: 'C',
      requestDate: '2024-03-07T09:15:00',
      status: 'completed',
      feeAmount: 500,
      feePaid: true,
      reason: 'Practical marks not awarded correctly',
      examiner: 'Dr. Davis',
      assignedTo: 'Prof. Wilson',
      result: {
        newMarks: 68,
        newGrade: 'B',
        marksChanged: true,
        comments: 'Additional marks awarded for practical work'
      },
      comments: 'Revaluation completed - marks increased'
    }
  ]);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    studentId: '',
    courseCode: '',
    examType: '',
    originalMarks: '',
    reason: '',
    feeAmount: 500
  });

  const [filters, setFilters] = useState({
    status: '',
    course: '',
    examiner: ''
  });

  const [examiners] = useState([
    'Dr. Smith',
    'Prof. Johnson',
    'Dr. Brown',
    'Prof. Wilson',
    'Dr. Davis'
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'under_review': return faEye;
      case 'completed': return faCheckCircle;
      case 'rejected': return faTimes;
      default: return faClock;
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-gray-600';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRequest) {
      setRevaluationRequests(revaluationRequests.map(req => 
        req.id === editingRequest.id ? { ...requestForm, id: req.id, status: 'pending', feePaid: false } : req
      ));
    } else {
      const newRequest = {
        ...requestForm,
        id: Date.now(),
        status: 'pending',
        feePaid: false,
        requestDate: new Date().toISOString(),
        assignedTo: null,
        result: null,
        comments: ''
      };
      setRevaluationRequests([...revaluationRequests, newRequest]);
    }
    setShowRequestForm(false);
    setEditingRequest(null);
    setRequestForm({
      studentId: '',
      courseCode: '',
      examType: '',
      originalMarks: '',
      reason: '',
      feeAmount: 500
    });
  };

  const handleAssign = (requestId, examiner) => {
    setRevaluationRequests(revaluationRequests.map(req => 
      req.id === requestId ? { ...req, assignedTo: examiner, status: 'under_review' } : req
    ));
  };

  const handleComplete = (requestId, result) => {
    setRevaluationRequests(revaluationRequests.map(req => 
      req.id === requestId ? { ...req, result, status: 'completed' } : req
    ));
  };

  const handlePayment = (requestId) => {
    setRevaluationRequests(revaluationRequests.map(req => 
      req.id === requestId ? { ...req, feePaid: true } : req
    ));
  };

  const filteredRequests = revaluationRequests.filter(request => {
    if (filters.status && request.status !== filters.status) return false;
    if (filters.course && !request.courseCode.includes(filters.course)) return false;
    if (filters.examiner && request.examiner !== filters.examiner) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revaluation Portal</h2>
          <p className="text-gray-600">Manage revaluation requests and workflow</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>New Request</span>
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {revaluationRequests.filter(req => req.status === 'pending').length}
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
                {revaluationRequests.filter(req => req.status === 'under_review').length}
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {revaluationRequests.filter(req => req.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{revaluationRequests.reduce((sum, req) => sum + req.feeAmount, 0)}
              </p>
            </div>
          </div>
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
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examiner</label>
            <select
              value={filters.examiner}
              onChange={(e) => setFilters({...filters, examiner: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Examiners</option>
              {examiners.map(examiner => (
                <option key={examiner} value={examiner}>{examiner}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ status: '', course: '', examiner: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Revaluation Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Revaluation Requests</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{request.studentName} ({request.studentId})</h4>
                    <p className="text-sm text-gray-600">{request.courseCode} - {request.courseName}</p>
                    <p className="text-sm text-gray-500">{request.examType}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(request.status)} className="mr-1" />
                      {request.status.replace('_', ' ')}
                    </span>
                    {!request.feePaid && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" />
                        Fee Pending
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{request.originalMarks}</p>
                    <p className="text-sm text-gray-600">Original Marks</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getGradeColor(request.originalGrade)}`}>
                      {request.originalGrade}
                    </p>
                    <p className="text-sm text-gray-600">Original Grade</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">₹{request.feeAmount}</p>
                    <p className="text-sm text-gray-600">Fee Amount</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(request.requestDate)}</p>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faComments} className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reason for Revaluation:</p>
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>
                  </div>
                </div>

                {request.result && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-900">Revaluation Result</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">New Marks</p>
                        <p className="text-lg font-bold text-green-600">{request.result.newMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">New Grade</p>
                        <p className={`text-lg font-bold ${getGradeColor(request.result.newGrade)}`}>
                          {request.result.newGrade}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{request.result.comments}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Examiner: {request.examiner}
                    {request.assignedTo && ` → Assigned to: ${request.assignedTo}`}
                  </div>
                  <div className="flex space-x-2">
                    {!request.feePaid && (
                      <button
                        onClick={() => handlePayment(request.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" />
                        Mark Paid
                      </button>
                    )}
                    {request.status === 'pending' && request.feePaid && (
                      <select
                        onChange={(e) => handleAssign(request.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Assign to...</option>
                        {examiners.map(examiner => (
                          <option key={examiner} value={examiner}>{examiner}</option>
                        ))}
                      </select>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingRequest ? 'Edit Request' : 'New Revaluation Request'}
              </h3>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setEditingRequest(null);
                  setRequestForm({
                    studentId: '',
                    courseCode: '',
                    examType: '',
                    originalMarks: '',
                    reason: '',
                    feeAmount: 500
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={requestForm.studentId}
                    onChange={(e) => setRequestForm({...requestForm, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={requestForm.courseCode}
                    onChange={(e) => setRequestForm({...requestForm, courseCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={requestForm.examType}
                    onChange={(e) => setRequestForm({...requestForm, examType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Exam Type</option>
                    <option value="Mid-Semester">Mid-Semester</option>
                    <option value="End-Semester">End-Semester</option>
                    <option value="Practical">Practical</option>
                    <option value="Viva">Viva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Marks</label>
                  <input
                    type="number"
                    value={requestForm.originalMarks}
                    onChange={(e) => setRequestForm({...requestForm, originalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
                  <input
                    type="number"
                    value={requestForm.feeAmount}
                    onChange={(e) => setRequestForm({...requestForm, feeAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Revaluation</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide detailed reason for revaluation request..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false);
                    setEditingRequest(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingRequest ? 'Update Request' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevaluationPortal;
