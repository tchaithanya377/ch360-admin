import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faSave,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faEdit,
  faTrash,
  faPlus,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import GradesApiService from '../../services/gradesApiService';

const GradeEntryForm = ({ 
  studentId, 
  courseSectionId, 
  semesterId, 
  type = 'midterm',
  gradesService,
  onSave,
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    student: studentId,
    course_section: courseSectionId,
    semester: semesterId,
    marks: '',
    total_marks: type === 'midterm' ? 30 : 100
  });
  
  const [gradeScales, setGradeScales] = useState([]);
  const [calculatedGrade, setCalculatedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Data for dropdowns
  const [students, setStudents] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    loadGradeScales();
    loadDropdownData();
  }, []);

  const loadGradeScales = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      setDataLoading(true);
      
      // Load students data
      const studentsData = await gradesService.getStudents();
      setStudents(studentsData.results || studentsData || []);
      
      // Load course sections data
      const courseSectionsData = await gradesService.getCourseSections();
      setCourseSections(courseSectionsData.results || courseSectionsData || []);
      
      // Load semesters data
      const semestersData = await gradesService.getSemesters();
      setSemesters(semestersData.results || semestersData || []);
      
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      
      // Set fallback data
      setStudents([
        { id: 'student-1', roll_number: '2024001', first_name: 'John', last_name: 'Doe', email: 'john.doe@university.edu' },
        { id: 'student-2', roll_number: '2024002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@university.edu' },
        { id: 'student-3', roll_number: '2024003', first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@university.edu' },
        { id: 'student-4', roll_number: '2024004', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@university.edu' },
        { id: 'student-5', roll_number: '2024005', first_name: 'David', last_name: 'Brown', email: 'david.brown@university.edu' }
      ]);
      
      setCourseSections([
        { id: 'cs-1', course_code: 'CS101', course_name: 'Introduction to Programming', semester: '2024-1', credits: 4 },
        { id: 'cs-2', course_code: 'CS102', course_name: 'Data Structures', semester: '2024-1', credits: 4 },
        { id: 'cs-3', course_code: 'CS201', course_name: 'Algorithms', semester: '2024-1', credits: 3 },
        { id: 'cs-4', course_code: 'CS301', course_name: 'Database Systems', semester: '2024-1', credits: 4 },
        { id: 'cs-5', course_code: 'CS401', course_name: 'Software Engineering', semester: '2024-1', credits: 3 }
      ]);
      
      setSemesters([
        { id: '2024-1', name: '2024-1', academic_year: '2024', is_active: true },
        { id: '2024-2', name: '2024-2', academic_year: '2024', is_active: true },
        { id: '2023-1', name: '2023-1', academic_year: '2023', is_active: false },
        { id: '2023-2', name: '2023-2', academic_year: '2023', is_active: false }
      ]);
    } finally {
      setDataLoading(false);
    }
  };

  const calculateGrade = (marks, totalMarks) => {
    if (!marks || !totalMarks || marks > totalMarks) return null;
    
    const percentage = (marks / totalMarks) * 100;
    const grade = gradeScales.find(scale => 
      percentage >= scale.min_score && percentage <= scale.max_score
    );
    
    if (!grade) return null;
    
    // Determine pass status based on grade
    const isPass = grade.letter !== 'F' && grade.grade_points > 0;
    
    return {
      letter: grade.letter,
      description: grade.description,
      grade_points: grade.grade_points,
      percentage: parseFloat(percentage.toFixed(2)),
      isPass: isPass,
      passStatus: isPass ? 'PASS' : 'FAIL'
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student) {
      newErrors.student = 'Please select a student';
    }
    
    if (!formData.course_section) {
      newErrors.course_section = 'Please select a course section';
    }
    
    if (!formData.semester) {
      newErrors.semester = 'Please select a semester';
    }
    
    if (!formData.marks || formData.marks < 0) {
      newErrors.marks = 'Marks must be a positive number';
    }
    
    if (!formData.total_marks || formData.total_marks <= 0) {
      newErrors.total_marks = 'Total marks must be greater than 0';
    }
    
    if (formData.marks > formData.total_marks) {
      newErrors.marks = 'Marks cannot exceed total marks';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    
    // Calculate grade if both marks and total marks are present
    if (field === 'marks' || field === 'total_marks') {
      const marks = field === 'marks' ? value : newFormData.marks;
      const totalMarks = field === 'total_marks' ? value : newFormData.total_marks;
      
      if (marks && totalMarks) {
        const grade = calculateGrade(parseFloat(marks), parseFloat(totalMarks));
        setCalculatedGrade(grade);
      } else {
        setCalculatedGrade(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Please fix the errors before submitting');
      return;
    }
    
    setSaving(true);
    
    try {
      const gradeData = {
        ...formData,
        [type === 'midterm' ? 'midterm_marks' : 'final_marks']: parseFloat(formData.marks)
      };
      
      let result;
      if (type === 'midterm') {
        result = await gradesService.createMidtermGrade(gradeData);
      } else {
        result = await gradesService.createSemesterGrade(gradeData);
      }
      
      console.log(`${type === 'midterm' ? 'Midterm' : 'Semester'} grade saved successfully!`);
      
      if (onSave) {
        onSave(result);
      }
      
      // Reset form
      setFormData({
        student: studentId,
        course_section: courseSectionId,
        semester: semesterId,
        marks: '',
        total_marks: type === 'midterm' ? 30 : 100
      });
      setCalculatedGrade(null);
      setErrors({});
      
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setSaving(false);
    }
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

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-600 mr-3" />
        <span className="text-gray-600">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Add {type === 'midterm' ? 'Midterm' : 'Semester'} Grade
        </h3>
        <p className="text-gray-600">
          Enter the {type} marks for the student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student & Course Information Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2" />
            Student & Course Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student:
              </label>
              <select
                value={formData.student}
                onChange={(e) => handleInputChange('student', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                  errors.student ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.roll_number} - {student.first_name} {student.last_name}
                  </option>
                ))}
              </select>
              {errors.student && (
                <p className="mt-1 text-sm text-red-600">{errors.student}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course section:
              </label>
              <select
                value={formData.course_section}
                onChange={(e) => handleInputChange('course_section', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                  errors.course_section ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Course Section</option>
                {courseSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.course_code} - {section.course_name}
                  </option>
                ))}
              </select>
              {errors.course_section && (
                <p className="mt-1 text-sm text-red-600">{errors.course_section}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester:
              </label>
              <select
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                  errors.semester ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name} ({semester.academic_year})
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
              )}
            </div>
          </div>
        </div>

        {/* Grade Information Section */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faCalculator} className="text-blue-600 mr-2" />
            Grade Information
          </h4>
          <p className="text-sm text-gray-600 mb-6">
            Enter marks obtained and total marks. Percentage, grade, points{type === 'semester' ? ', and pass status' : ''} will be calculated automatically based on the grade scale.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'midterm' ? 'Midterm marks:' : 'Final marks:'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.total_marks}
                  value={formData.marks}
                  onChange={(e) => handleInputChange('marks', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.marks ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  required
                />
                {errors.marks && (
                  <div className="absolute right-3 top-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Marks obtained by student</p>
              {errors.marks && (
                <p className="mt-1 text-sm text-red-600">{errors.marks}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total marks:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.total_marks}
                  onChange={(e) => handleInputChange('total_marks', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.total_marks ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="100"
                  required
                />
                {errors.total_marks && (
                  <div className="absolute right-3 top-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Total marks for the exam (e.g., 50, 100)</p>
              {errors.total_marks && (
                <p className="mt-1 text-sm text-red-600">{errors.total_marks}</p>
              )}
            </div>
          </div>
        </div>

        {/* Calculated Grade Display */}
        {calculatedGrade && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xl mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">Calculated Grade</h4>
            </div>
            
            <div className={`grid grid-cols-1 gap-6 ${type === 'semester' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="text-center bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Grade</p>
                <p className={`text-4xl font-bold ${getGradeColor(calculatedGrade)}`}>
                  {calculatedGrade.letter}
                </p>
                <p className="text-sm text-gray-500 mt-1">{calculatedGrade.description}</p>
              </div>
              
              <div className="text-center bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Percentage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {calculatedGrade.percentage}%
                </p>
              </div>
              
              <div className="text-center bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Grade Points</p>
                <p className="text-3xl font-bold text-gray-900">
                  {calculatedGrade.grade_points}
                </p>
              </div>
              
              {type === 'semester' && (
                <div className="text-center bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Pass Status</p>
                  <p className={`text-2xl font-bold ${calculatedGrade.isPass ? 'text-green-600' : 'text-red-600'}`}>
                    {calculatedGrade.passStatus}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {calculatedGrade.isPass ? 'Student Passed' : 'Student Failed'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grade Scale Reference */}
        {gradeScales.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-600 mr-2" />
              <h5 className="text-sm font-medium text-gray-700">Grade Scale Reference</h5>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {gradeScales.slice(0, 8).map((scale) => (
                <div key={scale.letter} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-semibold text-gray-900">{scale.letter}</span>
                  <span className="text-gray-500">{scale.min_score}-{scale.max_score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
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
            disabled={saving || !formData.marks || !formData.total_marks}
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
                Save {type === 'midterm' ? 'Midterm' : 'Semester'} Grade
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GradeEntryForm;
