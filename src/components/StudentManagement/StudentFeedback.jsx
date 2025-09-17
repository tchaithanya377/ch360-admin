import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faStar,
  faUserPlus, faCopy, faArrowsRotate, faThumbsUp, faThumbsDown,
  faTimes, faSpinner, faChartBar, faChartLine, faChartPie
} from "@fortawesome/free-solid-svg-icons";
const StudentFeedback = ({ students }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState([]);

  // Feedback types
  const feedbackTypes = [
    { id: "academic", name: "Academic", description: "Course and teaching feedback" },
    { id: "facility", name: "Facility", description: "Infrastructure and facilities" },
    { id: "service", name: "Service", description: "Administrative services" },
    { id: "general", name: "General", description: "General feedback and suggestions" }
  ];

  // Question types
  const questionTypes = [
    { id: "rating", name: "Rating", description: "1-5 star rating" },
    { id: "multiple_choice", name: "Multiple Choice", description: "Single selection from options" },
    { id: "checkbox", name: "Checkbox", description: "Multiple selections allowed" },
    { id: "text", name: "Text", description: "Open-ended text response" },
    { id: "yes_no", name: "Yes/No", description: "Simple yes or no question" }
  ];

  // Sample surveys
  const sampleSurveys = [
    {
      id: 1,
      title: "End of Semester Feedback",
      description: "Collect feedback on courses and teaching quality",
      type: "academic",
      status: "active",
      questions: [
        { id: 1, type: "rating", question: "How would you rate the overall teaching quality?", required: true },
        { id: 2, type: "multiple_choice", question: "Which subject did you find most challenging?", options: ["Mathematics", "Physics", "Chemistry", "Computer Science"], required: false },
        { id: 3, type: "text", question: "What suggestions do you have for improving the course?", required: false }
      ],
      responses: 45,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: "Campus Facilities Survey",
      description: "Feedback on library, labs, and other facilities",
      type: "facility",
      status: "draft",
      questions: [
        { id: 1, type: "rating", question: "Rate the library facilities", required: true },
        { id: 2, type: "rating", question: "Rate the computer lab facilities", required: true },
        { id: 3, type: "yes_no", question: "Are the facilities accessible during your preferred hours?", required: true }
      ],
      responses: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  // Sample feedback data
  const sampleFeedback = [
    {
      id: 1,
      studentId: students[0]?.id,
      studentName: students[0]?.name || `${students[0]?.firstName || ''} ${students[0]?.lastName || ''}`.trim(),
      type: "academic",
      rating: 4,
      title: "Great teaching methods",
      feedback: "The professors use innovative teaching methods that make complex topics easy to understand.",
      status: "submitted",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      studentId: students[1]?.id,
      studentName: students[1]?.name || `${students[1]?.firstName || ''} ${students[1]?.lastName || ''}`.trim(),
      type: "facility",
      rating: 3,
      title: "Library needs improvement",
      feedback: "The library could use more study spaces and updated books.",
      status: "reviewed",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    setSurveys(sampleSurveys);
    setFeedbackData(sampleFeedback);
  }, [students]);

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Create new survey
  const createSurvey = async () => {
    if (!currentSurvey?.title || surveyQuestions.length === 0) {
      alert("Please provide a survey title and at least one question.");
      return;
    }

    setIsCreating(true);

    try {
      const newSurvey = {
        id: Date.now(),
        title: currentSurvey.title,
        description: currentSurvey.description || "",
        type: currentSurvey.type || "general",
        status: "draft",
        questions: surveyQuestions,
        responses: 0,
        createdAt: new Date()
      };

      // Save to database
      await addDoc(collection(db, "surveys"), {
        ...newSurvey,
        createdAt: serverTimestamp()
      });

      setSurveys(prev => [...prev, newSurvey]);
      setCurrentSurvey(null);
      setSurveyQuestions([]);
      setShowSurveyModal(false);
      alert("Survey created successfully!");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Error creating survey. Please try again.");
      setIsCreating(false);
    }
  };

  // Add question to survey
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: "rating",
      question: "",
      required: false,
      options: []
    };
    setSurveyQuestions(prev => [...prev, newQuestion]);
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...surveyQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setSurveyQuestions(updatedQuestions);
  };

  // Remove question
  const removeQuestion = (index) => {
    setSurveyQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Export feedback data
  const exportFeedbackData = () => {
    const csvContent = [
      "Student Name,Roll Number,Type,Rating,Title,Feedback,Status,Created Date",
      ...feedbackData.map(feedback => 
        `"${feedback.studentName}","${students.find(s => s.id === feedback.studentId)?.rollNo || ''}","${feedback.type}","${feedback.rating}","${feedback.title}","${feedback.feedback}","${feedback.status}","${feedback.createdAt.toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete feedback
  const deleteFeedback = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        setFeedbackData(prev => prev.filter(feedback => feedback.id !== feedbackId));
        alert("Feedback deleted successfully!");
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Error deleting feedback. Please try again.");
      }
    }
  };

  // Filter feedback
  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesType = filterType === "all" || feedback.type === filterType;
    const matchesSearch = feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const calculateStats = () => {
    const total = feedbackData.length;
    const byType = {};
    const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byStatus = {};

    feedbackData.forEach(feedback => {
      byType[feedback.type] = (byType[feedback.type] || 0) + 1;
      byRating[feedback.rating] = (byRating[feedback.rating] || 0) + 1;
      byStatus[feedback.status] = (byStatus[feedback.status] || 0) + 1;
    });

    const averageRating = total > 0 ? 
      (feedbackData.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : 0;

    return {
      total,
      byType,
      byRating,
      byStatus,
      averageRating
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faComments} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Feedback</h2>
            <p className="text-gray-600">Manage student feedback and surveys</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowSurveyModal(true)}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faPlus} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Survey</p>
                <p className="text-sm text-gray-600">Design new feedback survey</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View feedback insights</p>
              </div>
            </div>
          </button>

          <button
            onClick={exportFeedbackData}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faDownload} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download feedback data</p>
              </div>
            </div>
          </button>

          <button
            onClick={selectAllStudents}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faUserPlus} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Select Students</p>
                <p className="text-sm text-gray-600">Choose students for survey</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Feedback</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.averageRating}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{surveys.length}</p>
            <p className="text-sm text-gray-600">Active Surveys</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {surveys.reduce((sum, survey) => sum + survey.responses, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Responses</p>
          </div>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-8">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.byRating[rating] / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{stats.byRating[rating] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback by Type */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Feedback by Type</h4>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surveys */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Surveys ({surveys.length})</h3>
          <button
            onClick={() => setShowSurveyModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Survey</span>
          </button>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faComments} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No surveys created yet.</p>
            <button
              onClick={() => setShowSurveyModal(true)}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Create First Survey</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map(survey => (
              <div key={survey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{survey.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{survey.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{survey.questions.length} questions</span>
                  <span>{survey.responses} responses</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {feedbackTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search feedback..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Feedback ({filteredFeedback.length})
          </h3>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faComments} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No feedback found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                    <p className="text-sm text-gray-500">
                      {feedback.studentName} • {feedback.type} • {feedback.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FontAwesomeIcon 
                          key={star}
                          icon={faStar} 
                          className={`text-sm ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => deleteFeedback(feedback.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Feedback"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{feedback.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Survey Creation Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Survey</h3>
                <button
                  onClick={() => setShowSurveyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Survey Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title</label>
                    <input
                      type="text"
                      value={currentSurvey?.title || ""}
                      onChange={(e) => setCurrentSurvey(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter survey title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Survey Type</label>
                    <select
                      value={currentSurvey?.type || "general"}
                      onChange={(e) => setCurrentSurvey(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {feedbackTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={currentSurvey?.description || ""}
                    onChange={(e) => setCurrentSurvey(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter survey description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Survey Questions</h4>
                    <button
                      onClick={addQuestion}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {surveyQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {questionTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label className="text-sm text-gray-700">Required</label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="Enter your question..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optionIndex] = e.target.value;
                                      updateQuestion(index, 'options', newOptions);
                                    }}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => {
                                      const newOptions = question.options.filter((_, i) => i !== optionIndex);
                                      updateQuestion(index, 'options', newOptions);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [...question.options, ''];
                                  updateQuestion(index, 'options', newOptions);
                                }}
                                className="text-purple-600 hover:text-purple-700 text-sm"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={createSurvey}
                    disabled={isCreating}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Survey'}
                  </button>
                  <button
                    onClick={() => setShowSurveyModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeedback;
