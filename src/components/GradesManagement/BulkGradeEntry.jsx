import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faDownload,
  faSave,
  faTrash,
  faEdit,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faFileExcel,
  faFileCsv,
  faUsers,
  faCalculator,
  faEye,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import GradesApiService from '../../services/gradesApiService';

const BulkGradeEntry = ({ 
  courseSectionId, 
  semesterId, 
  type = 'midterm',
  gradesService,
  onSave,
  onCancel 
}) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [gradeScales, setGradeScales] = useState([]);

  useEffect(() => {
    loadGradeScales();
    // In a real app, you would load students from an API
    loadMockStudents();
  }, []);

  const loadGradeScales = async () => {
    try {
      const scales = await gradesService.getGradeScales();
      setGradeScales(scales.results || scales);
    } catch (error) {
      console.error('Error loading grade scales:', error);
      // Set default grade scales for Indian 10-point system as fallback
      const defaultGradeScales = [
        { letter: 'O', description: 'Outstanding', min_score: 90, max_score: 100, grade_points: 10, is_active: true },
        { letter: 'A+', description: 'Excellent', min_score: 80, max_score: 89, grade_points: 9, is_active: true },
        { letter: 'A', description: 'Very Good', min_score: 70, max_score: 79, grade_points: 8, is_active: true },
        { letter: 'B+', description: 'Good', min_score: 60, max_score: 69, grade_points: 7, is_active: true },
        { letter: 'B', description: 'Above Average', min_score: 50, max_score: 59, grade_points: 6, is_active: true },
        { letter: 'C', description: 'Average', min_score: 40, max_score: 49, grade_points: 5, is_active: true },
        { letter: 'P', description: 'Pass', min_score: 35, max_score: 39, grade_points: 4, is_active: true },
        { letter: 'F', description: 'Fail', min_score: 0, max_score: 34, grade_points: 0, is_active: true }
      ];
      setGradeScales(defaultGradeScales);
    }
  };

  const loadMockStudents = () => {
    // Mock data - replace with actual API call
    const mockStudents = [
      { id: '1', roll_number: 'CS2024001', name: 'John Doe', email: 'john@example.com' },
      { id: '2', roll_number: 'CS2024002', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', roll_number: 'CS2024003', name: 'Bob Johnson', email: 'bob@example.com' },
      { id: '4', roll_number: 'CS2024004', name: 'Alice Brown', email: 'alice@example.com' },
      { id: '5', roll_number: 'CS2024005', name: 'Charlie Wilson', email: 'charlie@example.com' }
    ];
    setStudents(mockStudents);
  };

  const calculateGrade = (marks, totalMarks) => {
    if (!marks || !totalMarks || marks > totalMarks) return null;
    
    const percentage = (marks / totalMarks) * 100;
    const grade = gradeScales.find(scale => 
      percentage >= scale.min_score && percentage <= scale.max_score
    );
    
    return grade ? {
      letter: grade.letter,
      description: grade.description,
      grade_points: grade.grade_points,
      percentage: parseFloat(percentage.toFixed(2))
    } : null;
  };

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => {
      const existing = prev.find(g => g.student === studentId);
      if (existing) {
        return prev.map(g => 
          g.student === studentId ? { ...g, [field]: value } : g
        );
      } else {
        return [...prev, {
          student: studentId,
          course_section: courseSectionId,
          semester: semesterId,
          [field]: value
        }];
      }
    });

    // Clear error for this field
    const errorKey = `${studentId}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: null });
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const validateGrades = () => {
    const newErrors = {};
    const validGrades = grades.filter(g => 
      g.student && (g.midterm_marks !== undefined || g.final_marks !== undefined)
    );

    validGrades.forEach(grade => {
      const marks = type === 'midterm' ? grade.midterm_marks : grade.final_marks;
      const totalMarks = grade.total_marks || (type === 'midterm' ? 30 : 100);
      
      if (!marks || marks < 0) {
        newErrors[`${grade.student}_marks`] = 'Marks must be a positive number';
      }
      
      if (marks > totalMarks) {
        newErrors[`${grade.student}_marks`] = 'Marks cannot exceed total marks';
      }
      
      if (!totalMarks || totalMarks <= 0) {
        newErrors[`${grade.student}_total_marks`] = 'Total marks must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateGrades()) {
      console.error('Please fix the errors before submitting');
      return;
    }
    
    const validGrades = grades.filter(g => 
      g.student && (g.midterm_marks !== undefined || g.final_marks !== undefined)
    );
    
    if (validGrades.length === 0) {
      console.error('Please enter at least one grade');
      return;
    }
    
    setSaving(true);
    
    try {
      let result;
      if (type === 'midterm') {
        result = await gradesService.bulkUpsertMidtermGrades(validGrades);
      } else {
        result = await gradesService.bulkUpsertSemesterGrades(validGrades);
      }
      
      console.log(`Successfully saved ${validGrades.length} ${type} grades!`);
      
      if (onSave) {
        onSave(result);
      }
      
      // Reset form
      setGrades([]);
      setSelectedStudents(new Set());
      setErrors({});
      
    } catch (error) {
      console.error('Error saving grades:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportTemplate = () => {
    const headers = ['Roll Number', 'Student Name', 'Marks Obtained', 'Total Marks'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.roll_number,
        student.name,
        '',
        type === 'midterm' ? '30' : '100'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_grades_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    
    const colors = {
      'A+': 'text-green-600',
      'A': 'text-green-500',
      'B+': 'text-blue-500',
      'B': 'text-blue-400',
      'C+': 'text-yellow-500',
      'C': 'text-yellow-400',
      'D': 'text-orange-500',
      'F': 'text-red-500'
    };
    
    return colors[grade.letter] || 'text-gray-500';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Bulk {type === 'midterm' ? 'Midterm' : 'Semester'} Grade Entry
            </h3>
            <p className="text-gray-600">
              Enter grades for multiple students at once
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportTemplate}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Template
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedStudents.size === students.length}
              onChange={handleSelectAll}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({selectedStudents.size}/{students.length} selected)
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {grades.filter(g => g.student).length} grades entered
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {students.map((student) => {
            const studentGrade = grades.find(g => g.student === student.id);
            const marks = type === 'midterm' ? studentGrade?.midterm_marks : studentGrade?.final_marks;
            const totalMarks = studentGrade?.total_marks || (type === 'midterm' ? 30 : 100);
            const calculatedGrade = calculateGrade(marks, totalMarks);
            
            return (
              <div
                key={student.id}
                className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                  selectedStudents.has(student.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.roll_number}</div>
                    </div>
                  </div>
                  
                  {calculatedGrade && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(calculatedGrade)}`}>
                        {calculatedGrade.letter}
                      </div>
                      <div className="text-sm text-gray-500">
                        {calculatedGrade.percentage}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={totalMarks}
                      value={marks || ''}
                      onChange={(e) => handleGradeChange(
                        student.id, 
                        type === 'midterm' ? 'midterm_marks' : 'final_marks', 
                        parseFloat(e.target.value) || 0
                      )}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`${student.id}_marks`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter marks"
                    />
                    {errors[`${student.id}_marks`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${student.id}_marks`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={totalMarks}
                      onChange={(e) => handleGradeChange(student.id, 'total_marks', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`${student.id}_total_marks`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`${student.id}_total_marks`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`${student.id}_total_marks`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calculated Grade
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {calculatedGrade ? (
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${getGradeColor(calculatedGrade)}`}>
                            {calculatedGrade.letter}
                          </span>
                          <span className="text-sm text-gray-500">
                            {calculatedGrade.grade_points} pts
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Enter marks to calculate</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {grades.filter(g => g.student).map((grade) => {
                const student = students.find(s => s.id === grade.student);
                const marks = type === 'midterm' ? grade.midterm_marks : grade.final_marks;
                const calculatedGrade = calculateGrade(marks, grade.total_marks);
                
                return (
                  <div key={grade.student} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{student?.name}</span>
                    <span className="text-sm text-gray-600">
                      {marks}/{grade.total_marks} - {calculatedGrade?.letter || 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={saving || grades.filter(g => g.student).length === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save {grades.filter(g => g.student).length} Grades
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkGradeEntry;
