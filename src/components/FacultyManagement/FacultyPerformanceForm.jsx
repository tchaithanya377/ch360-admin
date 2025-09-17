import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarAlt,
  faChartLine,
  faStar,
  faComments,
  faSave,
  faTimes,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faEdit,
  faEye,
  faTrash,
  faPlus,
  faGraduationCap,
  faBookOpen,
  faCog,
  faUsers,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import usePerformanceManagement from '../../hooks/usePerformanceManagement';

const FacultyPerformanceForm = ({ 
  performanceRecord = null, 
  onSave, 
  onCancel, 
  mode = 'create', // 'create', 'edit', 'view'
  facultyList = [],
  loading = false,
  error = null
}) => {
  const { createPerformanceRecord, updatePerformanceRecord } = usePerformanceManagement();
  
  // Debug logging
  useEffect(() => {
    console.log('📝 FacultyPerformanceForm - facultyList:', facultyList);
    console.log('📝 FacultyPerformanceForm - mode:', mode);
    console.log('📝 FacultyPerformanceForm - performanceRecord:', performanceRecord);
  }, [facultyList, mode, performanceRecord]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    faculty_id: '',
    academic_year: '',
    evaluation_period: '',
    
    // Evaluation Scores (out of 10)
    teaching_effectiveness: 0,
    student_satisfaction: 0,
    research_contribution: 0,
    administrative_work: 0,
    professional_development: 0,
    overall_score: 0,
    
    // Assessment Details
    strengths: '',
    areas_for_improvement: '',
    recommendations: '',
    
    // Evaluation Information
    evaluated_by: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    comments: '',
    
    // Status
    status: 'DRAFT'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when performanceRecord prop changes
  useEffect(() => {
    if (performanceRecord) {
      setFormData({
        faculty_id: performanceRecord.faculty_id || '',
        academic_year: performanceRecord.academic_year || '',
        evaluation_period: performanceRecord.evaluation_period || '',
        teaching_effectiveness: performanceRecord.teaching_effectiveness || 0,
        student_satisfaction: performanceRecord.student_satisfaction || 0,
        research_contribution: performanceRecord.research_contribution || 0,
        administrative_work: performanceRecord.administrative_work || 0,
        professional_development: performanceRecord.professional_development || 0,
        overall_score: performanceRecord.overall_score || 0,
        strengths: performanceRecord.strengths || '',
        areas_for_improvement: performanceRecord.areas_for_improvement || '',
        recommendations: performanceRecord.recommendations || '',
        evaluated_by: performanceRecord.evaluated_by || '',
        evaluation_date: performanceRecord.evaluation_date || new Date().toISOString().split('T')[0],
        comments: performanceRecord.comments || '',
        status: performanceRecord.status || 'DRAFT'
      });
    }
  }, [performanceRecord]);

  // Calculate overall score automatically
  useEffect(() => {
    const scores = [
      formData.teaching_effectiveness,
      formData.student_satisfaction,
      formData.research_contribution,
      formData.administrative_work,
      formData.professional_development
    ];
    
    const averageScore = scores.reduce((sum, score) => sum + (parseFloat(score) || 0), 0) / scores.length;
    setFormData(prev => ({ ...prev, overall_score: Math.round(averageScore * 10) / 10 }));
  }, [
    formData.teaching_effectiveness,
    formData.student_satisfaction,
    formData.research_contribution,
    formData.administrative_work,
    formData.professional_development
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.faculty_id) errors.faculty_id = 'Faculty selection is required';
    if (!formData.academic_year) errors.academic_year = 'Academic year is required';
    if (!formData.evaluation_period) errors.evaluation_period = 'Evaluation period is required';
    if (!formData.evaluated_by) errors.evaluated_by = 'Evaluator information is required';
    if (!formData.evaluation_date) errors.evaluation_date = 'Evaluation date is required';
    
    // Score validation (0-10)
    const scoreFields = [
      'teaching_effectiveness',
      'student_satisfaction', 
      'research_contribution',
      'administrative_work',
      'professional_development'
    ];
    
    scoreFields.forEach(field => {
      const score = parseFloat(formData[field]);
      if (isNaN(score) || score < 0 || score > 10) {
        errors[field] = 'Score must be between 0 and 10';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        await createPerformanceRecord(formData);
      } else if (mode === 'edit') {
        await updatePerformanceRecord(performanceRecord.id, formData);
      }
      
      if (onSave) {
        onSave(formData);
      }
    } catch (err) {
      console.error('Error saving performance record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    if (score >= 4) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-3 text-blue-600" />
          Faculty Performance Evaluation
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' ? 'Create new performance evaluation' : 
           mode === 'edit' ? 'Edit performance evaluation' : 
           'View performance evaluation'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty: <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.faculty_id}
                onChange={(e) => handleInputChange('faculty_id', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.faculty_id ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Faculty</option>
                {facultyList.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.first_name} {faculty.last_name} - {faculty.department}
                  </option>
                ))}
              </select>
              {formErrors.faculty_id && (
                <p className="text-red-500 text-sm mt-1">{formErrors.faculty_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder="e.g., 2023-2024"
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.academic_year ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100' : ''}`}
              />
              {formErrors.academic_year && (
                <p className="text-red-500 text-sm mt-1">{formErrors.academic_year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluation Period: <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.evaluation_period}
                onChange={(e) => handleInputChange('evaluation_period', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.evaluation_period ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Period</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
                <option value="Annual">Annual</option>
              </select>
              {formErrors.evaluation_period && (
                <p className="text-red-500 text-sm mt-1">{formErrors.evaluation_period}</p>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Scores */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faStar} className="mr-2 text-blue-600" />
            Evaluation Scores
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'teaching_effectiveness', label: 'Teaching Effectiveness', icon: faGraduationCap },
              { key: 'student_satisfaction', label: 'Student Satisfaction', icon: faUsers },
              { key: 'research_contribution', label: 'Research Contribution', icon: faBookOpen },
              { key: 'administrative_work', label: 'Administrative Work', icon: faCog },
              { key: 'professional_development', label: 'Professional Development', icon: faLightbulb }
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors[key] ? 'border-red-500' : 'border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100' : ''}`}
                  />
                  <FontAwesomeIcon 
                    icon={icon} 
                    className="absolute right-3 top-3 text-gray-400" 
                  />
                </div>
                <div className="mt-1 text-sm text-gray-600">Score out of 10</div>
                {formErrors[key] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors[key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Overall Score Display */}
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Overall Score:</h4>
                <p className="text-sm text-gray-600">Overall performance score</p>
              </div>
              <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreBackground(formData.overall_score)} ${getScoreColor(formData.overall_score)}`}>
                {formData.overall_score.toFixed(1)}/10
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faComments} className="mr-2 text-green-600" />
            Assessment Details
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strengths:
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                disabled={isReadOnly}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isReadOnly ? 'bg-gray-100' : 'border-gray-300'
                }`}
                placeholder="Describe the faculty member's key strengths..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas for Improvement:
              </label>
              <textarea
                value={formData.areas_for_improvement}
                onChange={(e) => handleInputChange('areas_for_improvement', e.target.value)}
                disabled={isReadOnly}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isReadOnly ? 'bg-gray-100' : 'border-gray-300'
                }`}
                placeholder="Identify areas where the faculty member can improve..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations:
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                disabled={isReadOnly}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isReadOnly ? 'bg-gray-100' : 'border-gray-300'
                }`}
                placeholder="Provide specific recommendations for development..."
              />
            </div>
          </div>
        </div>

        {/* Evaluation Information */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-600" />
            Evaluation Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluated by: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.evaluated_by}
                onChange={(e) => handleInputChange('evaluated_by', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.evaluated_by ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100' : ''}`}
                placeholder="Name of the evaluator"
              />
              {formErrors.evaluated_by && (
                <p className="text-red-500 text-sm mt-1">{formErrors.evaluated_by}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluation Date: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.evaluation_date}
                onChange={(e) => handleInputChange('evaluation_date', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.evaluation_date ? 'border-red-500' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100' : ''}`}
              />
              {formErrors.evaluation_date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.evaluation_date}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Note: You are 5.5 hours ahead of server time.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments:
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              disabled={isReadOnly}
              rows="4"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isReadOnly ? 'bg-gray-100' : 'border-gray-300'
              }`}
              placeholder="Additional comments or notes..."
            />
          </div>
        </div>

        {/* Form Actions */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {mode === 'create' ? 'Create Evaluation' : 'Update Evaluation'}
                </>
              )}
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Close
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FacultyPerformanceForm;
