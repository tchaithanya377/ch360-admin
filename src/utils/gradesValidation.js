/**
 * Grades Management System - Validation and Error Handling Utilities
 * 
 * This file contains comprehensive validation functions for the grades management system.
 * It enforces business rules, data integrity, and provides detailed error messages.
 */

import { GRADES_DATABASE_SCHEMA } from './gradesDatabaseSchema.js';

// Validation error types
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_REFERENCE: 'INVALID_REFERENCE',
  WORKFLOW_VIOLATION: 'WORKFLOW_VIOLATION',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
};

// Validation result class
export class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
  }

  addError(field, type, message, details = {}) {
    this.isValid = false;
    this.errors.push({
      field,
      type,
      message,
      details,
      timestamp: new Date()
    });
  }

  addWarning(field, message, details = {}) {
    this.warnings.push({
      field,
      message,
      details,
      timestamp: new Date()
    });
  }

  getErrorsByField(field) {
    return this.errors.filter(error => error.field === field);
  }

  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getFirstError() {
    return this.errors[0] || null;
  }

  getErrorMessages() {
    return this.errors.map(error => error.message);
  }

  getWarningMessages() {
    return this.warnings.map(warning => warning.message);
  }
}

// Student validation
export const validateStudent = (studentData) => {
  const result = new ValidationResult();

  // Required fields
  if (!studentData.rollNo?.trim()) {
    result.addError('rollNo', VALIDATION_ERRORS.REQUIRED_FIELD, 'Roll number is required');
  }

  if (!studentData.name?.trim()) {
    result.addError('name', VALIDATION_ERRORS.REQUIRED_FIELD, 'Student name is required');
  }

  if (!studentData.email?.trim()) {
    result.addError('email', VALIDATION_ERRORS.REQUIRED_FIELD, 'Email is required');
  }

  // Format validation
  if (studentData.email && !isValidEmail(studentData.email)) {
    result.addError('email', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid email format');
  }

  if (studentData.rollNo && !isValidRollNumber(studentData.rollNo)) {
    result.addError('rollNo', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid roll number format');
  }

  // Range validation
  if (studentData.attendance !== undefined) {
    if (studentData.attendance < 0 || studentData.attendance > 100) {
      result.addError('attendance', VALIDATION_ERRORS.OUT_OF_RANGE, 'Attendance must be between 0 and 100');
    }
  }

  if (studentData.academicInfo?.currentSemester) {
    if (studentData.academicInfo.currentSemester < 1 || studentData.academicInfo.currentSemester > 8) {
      result.addError('academicInfo.currentSemester', VALIDATION_ERRORS.OUT_OF_RANGE, 'Semester must be between 1 and 8');
    }
  }

  return result;
};

// Course validation
export const validateCourse = (courseData) => {
  const result = new ValidationResult();

  // Required fields
  if (!courseData.code?.trim()) {
    result.addError('code', VALIDATION_ERRORS.REQUIRED_FIELD, 'Course code is required');
  }

  if (!courseData.title?.trim()) {
    result.addError('title', VALIDATION_ERRORS.REQUIRED_FIELD, 'Course title is required');
  }

  if (!courseData.credits || courseData.credits <= 0) {
    result.addError('credits', VALIDATION_ERRORS.REQUIRED_FIELD, 'Valid credits are required');
  }

  // Format validation
  if (courseData.code && !isValidCourseCode(courseData.code)) {
    result.addError('code', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid course code format');
  }

  // Range validation
  if (courseData.credits) {
    if (courseData.credits < 1 || courseData.credits > 6) {
      result.addError('credits', VALIDATION_ERRORS.OUT_OF_RANGE, 'Credits must be between 1 and 6');
    }
  }

  if (courseData.semester) {
    if (courseData.semester < 1 || courseData.semester > 8) {
      result.addError('semester', VALIDATION_ERRORS.OUT_OF_RANGE, 'Semester must be between 1 and 8');
    }
  }

  return result;
};

// Exam validation
export const validateExam = (examData) => {
  const result = new ValidationResult();

  // Required fields
  if (!examData.name?.trim()) {
    result.addError('name', VALIDATION_ERRORS.REQUIRED_FIELD, 'Exam name is required');
  }

  if (!examData.type) {
    result.addError('type', VALIDATION_ERRORS.REQUIRED_FIELD, 'Exam type is required');
  }

  if (!examData.maxMarks || examData.maxMarks <= 0) {
    result.addError('maxMarks', VALIDATION_ERRORS.REQUIRED_FIELD, 'Valid maximum marks are required');
  }

  // Format validation
  const validExamTypes = ['internal', 'mid', 'end', 'supplementary'];
  if (examData.type && !validExamTypes.includes(examData.type)) {
    result.addError('type', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid exam type');
  }

  // Range validation
  if (examData.maxMarks) {
    if (examData.maxMarks < 1 || examData.maxMarks > 200) {
      result.addError('maxMarks', VALIDATION_ERRORS.OUT_OF_RANGE, 'Maximum marks must be between 1 and 200');
    }
  }

  if (examData.weightage) {
    if (examData.weightage < 0 || examData.weightage > 100) {
      result.addError('weightage', VALIDATION_ERRORS.OUT_OF_RANGE, 'Weightage must be between 0 and 100');
    }
  }

  if (examData.duration) {
    if (examData.duration < 30 || examData.duration > 480) {
      result.addError('duration', VALIDATION_ERRORS.OUT_OF_RANGE, 'Duration must be between 30 and 480 minutes');
    }
  }

  // Date validation
  if (examData.startDate && examData.endDate) {
    if (new Date(examData.startDate) >= new Date(examData.endDate)) {
      result.addError('endDate', VALIDATION_ERRORS.BUSINESS_RULE_VIOLATION, 'End date must be after start date');
    }
  }

  return result;
};

// Marks validation
export const validateMarks = (marksData, businessRules) => {
  const result = new ValidationResult();

  // Required fields
  if (!marksData.studentId) {
    result.addError('studentId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Student ID is required');
  }

  if (!marksData.courseId) {
    result.addError('courseId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Course ID is required');
  }

  if (!marksData.examId) {
    result.addError('examId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Exam ID is required');
  }

  if (marksData.marksObtained === undefined || marksData.marksObtained === null) {
    result.addError('marksObtained', VALIDATION_ERRORS.REQUIRED_FIELD, 'Marks obtained is required');
  }

  if (!marksData.maxMarks || marksData.maxMarks <= 0) {
    result.addError('maxMarks', VALIDATION_ERRORS.REQUIRED_FIELD, 'Valid maximum marks are required');
  }

  // Range validation
  if (marksData.marksObtained !== undefined && marksData.marksObtained !== null) {
    if (marksData.marksObtained < 0) {
      result.addError('marksObtained', VALIDATION_ERRORS.OUT_OF_RANGE, 'Marks cannot be negative');
    }

    if (marksData.maxMarks && marksData.marksObtained > marksData.maxMarks) {
      result.addError('marksObtained', VALIDATION_ERRORS.OUT_OF_RANGE, 
        `Marks cannot exceed maximum marks (${marksData.maxMarks})`);
    }
  }

  // Business rule validation
  if (businessRules) {
    const percentage = marksData.maxMarks > 0 ? (marksData.marksObtained / marksData.maxMarks) * 100 : 0;
    
    if (percentage < businessRules.passingCriteria.perCourse) {
      result.addWarning('marksObtained', 
        `Marks are below passing criteria (${businessRules.passingCriteria.perCourse}%)`);
    }
  }

  return result;
};

// Grade validation
export const validateGrade = (gradeData, gradingScheme) => {
  const result = new ValidationResult();

  // Required fields
  if (!gradeData.gradeLetter) {
    result.addError('gradeLetter', VALIDATION_ERRORS.REQUIRED_FIELD, 'Grade letter is required');
  }

  if (gradeData.gradePoint === undefined || gradeData.gradePoint === null) {
    result.addError('gradePoint', VALIDATION_ERRORS.REQUIRED_FIELD, 'Grade point is required');
  }

  if (!gradeData.credits || gradeData.credits <= 0) {
    result.addError('credits', VALIDATION_ERRORS.REQUIRED_FIELD, 'Valid credits are required');
  }

  // Format validation
  if (gradingScheme && gradeData.gradeLetter) {
    const validGrades = Object.keys(gradingScheme.boundaries);
    if (!validGrades.includes(gradeData.gradeLetter)) {
      result.addError('gradeLetter', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid grade letter');
    }
  }

  // Range validation
  if (gradeData.gradePoint !== undefined && gradeData.gradePoint !== null) {
    if (gradeData.gradePoint < 0 || gradeData.gradePoint > 10) {
      result.addError('gradePoint', VALIDATION_ERRORS.OUT_OF_RANGE, 'Grade point must be between 0 and 10');
    }
  }

  if (gradeData.credits) {
    if (gradeData.credits < 1 || gradeData.credits > 6) {
      result.addError('credits', VALIDATION_ERRORS.OUT_OF_RANGE, 'Credits must be between 1 and 6');
    }
  }

  // Business rule validation
  if (gradingScheme && gradeData.gradeLetter && gradeData.gradePoint !== undefined) {
    const expectedGradePoint = gradingScheme.boundaries[gradeData.gradeLetter]?.points;
    if (expectedGradePoint !== undefined && gradeData.gradePoint !== expectedGradePoint) {
      result.addError('gradePoint', VALIDATION_ERRORS.BUSINESS_RULE_VIOLATION, 
        `Grade point should be ${expectedGradePoint} for grade ${gradeData.gradeLetter}`);
    }
  }

  return result;
};

// Revaluation request validation
export const validateRevaluationRequest = (requestData) => {
  const result = new ValidationResult();

  // Required fields
  if (!requestData.studentId) {
    result.addError('studentId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Student ID is required');
  }

  if (!requestData.courseId) {
    result.addError('courseId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Course ID is required');
  }

  if (!requestData.examId) {
    result.addError('examId', VALIDATION_ERRORS.REQUIRED_FIELD, 'Exam ID is required');
  }

  if (!requestData.requestType) {
    result.addError('requestType', VALIDATION_ERRORS.REQUIRED_FIELD, 'Request type is required');
  }

  if (!requestData.reason?.trim()) {
    result.addError('reason', VALIDATION_ERRORS.REQUIRED_FIELD, 'Reason is required');
  }

  // Format validation
  const validRequestTypes = ['revaluation', 'rechecking', 'scrutiny'];
  if (requestData.requestType && !validRequestTypes.includes(requestData.requestType)) {
    result.addError('requestType', VALIDATION_ERRORS.INVALID_FORMAT, 'Invalid request type');
  }

  // Range validation
  if (requestData.feeAmount) {
    if (requestData.feeAmount < 0) {
      result.addError('feeAmount', VALIDATION_ERRORS.OUT_OF_RANGE, 'Fee amount cannot be negative');
    }
  }

  if (requestData.currentMarks !== undefined) {
    if (requestData.currentMarks < 0) {
      result.addError('currentMarks', VALIDATION_ERRORS.OUT_OF_RANGE, 'Current marks cannot be negative');
    }
  }

  if (requestData.expectedMarks !== undefined) {
    if (requestData.expectedMarks < 0) {
      result.addError('expectedMarks', VALIDATION_ERRORS.OUT_OF_RANGE, 'Expected marks cannot be negative');
    }
  }

  return result;
};

// Workflow validation
export const validateWorkflowTransition = (currentState, newState, userRole, permissions) => {
  const result = new ValidationResult();

  // Check if user has permission for the transition
  if (!permissions || !permissions[userRole]) {
    result.addError('workflow', VALIDATION_ERRORS.PERMISSION_DENIED, 'User does not have required permissions');
    return result;
  }

  const userPermissions = permissions[userRole];

  // Validate state transitions based on user role
  switch (currentState) {
    case 'draft':
      if (newState === 'submitted' && !userPermissions.canSubmitForModeration) {
        result.addError('workflow', VALIDATION_ERRORS.PERMISSION_DENIED, 
          'User cannot submit for moderation');
      }
      break;

    case 'submitted':
      if (newState === 'under_moderation' && !userPermissions.canModerateResults) {
        result.addError('workflow', VALIDATION_ERRORS.PERMISSION_DENIED, 
          'User cannot moderate results');
      }
      break;

    case 'under_moderation':
      if (newState === 'approved' && !userPermissions.canModerateResults) {
        result.addError('workflow', VALIDATION_ERRORS.PERMISSION_DENIED, 
          'User cannot approve results');
      }
      break;

    case 'approved':
      if (newState === 'published' && !userPermissions.canPublishResults) {
        result.addError('workflow', VALIDATION_ERRORS.PERMISSION_DENIED, 
          'User cannot publish results');
      }
      break;

    default:
      result.addError('workflow', VALIDATION_ERRORS.WORKFLOW_VIOLATION, 
        `Invalid state transition from ${currentState} to ${newState}`);
  }

  return result;
};

// Business rule validation
export const validateBusinessRules = (data, ruleType) => {
  const result = new ValidationResult();
  const businessRules = GRADES_DATABASE_SCHEMA.businessRules;

  switch (ruleType) {
    case 'gradeWeights':
      const totalWeightage = Object.values(data).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeightage - 100) > 0.01) {
        result.addError('gradeWeights', VALIDATION_ERRORS.BUSINESS_RULE_VIOLATION, 
          `Total weightage must equal 100% (current: ${totalWeightage}%)`);
      }
      break;

    case 'passingCriteria':
      if (data.perCourse < 0 || data.perCourse > 100) {
        result.addError('perCourse', VALIDATION_ERRORS.OUT_OF_RANGE, 
          'Per course passing criteria must be between 0 and 100');
      }
      if (data.aggregate < 0 || data.aggregate > 100) {
        result.addError('aggregate', VALIDATION_ERRORS.OUT_OF_RANGE, 
          'Aggregate passing criteria must be between 0 and 100');
      }
      if (data.minimumAttendance < 0 || data.minimumAttendance > 100) {
        result.addError('minimumAttendance', VALIDATION_ERRORS.OUT_OF_RANGE, 
          'Minimum attendance must be between 0 and 100');
      }
      break;

    case 'gradingScheme':
      if (!data.boundaries || Object.keys(data.boundaries).length === 0) {
        result.addError('boundaries', VALIDATION_ERRORS.REQUIRED_FIELD, 
          'Grade boundaries are required');
      }
      break;

    default:
      result.addError('businessRules', VALIDATION_ERRORS.INVALID_FORMAT, 
        `Unknown business rule type: ${ruleType}`);
  }

  return result;
};

// Utility functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidRollNumber = (rollNo) => {
  const rollNoRegex = /^[0-9]{2}[A-Z]{2}[0-9]{3}$/;
  return rollNoRegex.test(rollNo);
};

export const isValidCourseCode = (code) => {
  const courseCodeRegex = /^[A-Z]{2}[0-9]{3}$/;
  return courseCodeRegex.test(code);
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Data sanitization
export const sanitizeStudentData = (data) => {
  return {
    ...data,
    name: data.name?.trim(),
    email: data.email?.trim().toLowerCase(),
    rollNo: data.rollNo?.trim().toUpperCase(),
    phone: data.phone?.trim(),
    address: {
      street: data.address?.street?.trim(),
      city: data.address?.city?.trim(),
      state: data.address?.state?.trim(),
      pincode: data.address?.pincode?.trim(),
      country: data.address?.country?.trim()
    }
  };
};

export const sanitizeCourseData = (data) => {
  return {
    ...data,
    code: data.code?.trim().toUpperCase(),
    title: data.title?.trim(),
    shortDescription: data.shortDescription?.trim(),
    longDescription: data.longDescription?.trim()
  };
};

export const sanitizeExamData = (data) => {
  return {
    ...data,
    name: data.name?.trim(),
    venue: data.venue?.trim(),
    instructions: data.instructions?.trim()
  };
};

// Error message formatting
export const formatValidationErrors = (validationResult) => {
  if (!validationResult.hasErrors()) {
    return { success: true, message: 'Validation passed' };
  }

  const errorMessages = validationResult.getErrorMessages();
  const warningMessages = validationResult.getWarningMessages();

  return {
    success: false,
    errors: errorMessages,
    warnings: warningMessages,
    message: `Validation failed with ${errorMessages.length} error(s) and ${warningMessages.length} warning(s)`
  };
};

// Export all validation functions
export default {
  ValidationResult,
  VALIDATION_ERRORS,
  validateStudent,
  validateCourse,
  validateExam,
  validateMarks,
  validateGrade,
  validateRevaluationRequest,
  validateWorkflowTransition,
  validateBusinessRules,
  isValidEmail,
  isValidRollNumber,
  isValidCourseCode,
  isValidPhoneNumber,
  isValidDate,
  isFutureDate,
  isPastDate,
  sanitizeStudentData,
  sanitizeCourseData,
  sanitizeExamData,
  formatValidationErrors
};
