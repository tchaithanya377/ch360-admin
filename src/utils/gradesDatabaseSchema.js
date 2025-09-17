/**
 * Grades Management System - Firebase Firestore Database Schema
 * 
 * This file documents the complete database structure for the grades management system.
 * All collections follow a consistent naming convention and include proper indexing.
 */

export const GRADES_DATABASE_SCHEMA = {
  // Core Collections
  collections: {
    // Students collection
    students: {
      description: "Student information and academic records",
      fields: {
        id: "string (auto-generated)",
        rollNo: "string (unique)",
        name: "string",
        email: "string",
        phone: "string",
        dateOfBirth: "timestamp",
        gender: "string (male/female/other)",
        bloodGroup: "string",
        address: {
          street: "string",
          city: "string",
          state: "string",
          pincode: "string",
          country: "string"
        },
        academicInfo: {
          programId: "string (reference to programs)",
          batch: "string",
          admissionYear: "number",
          currentSemester: "number",
          section: "string",
          department: "string"
        },
        attendance: "number (percentage)",
        status: "string (active/inactive/graduated/withdrawn)",
        createdAt: "timestamp",
        updatedAt: "timestamp",
        createdBy: "string (user ID)",
        updatedBy: "string (user ID)"
      },
      indexes: [
        "rollNo",
        "email",
        "academicInfo.programId",
        "academicInfo.batch",
        "status"
      ]
    },

    // Programs collection
    programs: {
      description: "Academic programs and curricula",
      fields: {
        id: "string (auto-generated)",
        code: "string (unique)",
        name: "string",
        degreeType: "string (UG/PG/PhD/Diploma)",
        durationYears: "number",
        totalCredits: "number",
        description: "string",
        department: "string",
        coordinator: "string (faculty ID)",
        status: "string (active/inactive/discontinued)",
        effectiveFrom: "timestamp",
        effectiveTo: "timestamp",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "code",
        "department",
        "status"
      ]
    },

    // Courses collection
    courses: {
      description: "Course information and syllabi",
      fields: {
        id: "string (auto-generated)",
        code: "string (unique)",
        title: "string",
        shortDescription: "string",
        longDescription: "string",
        credits: "number",
        ltp: "string (e.g., '3:1:2')",
        level: "string (core/elective/soft)",
        programId: "string (reference to programs)",
        semester: "number",
        prerequisites: ["string (course codes)"],
        coRequisites: ["string (course codes)"],
        learningOutcomes: ["string"],
        assessmentMethods: ["string"],
        textbooks: ["string"],
        references: ["string"],
        status: "string (active/inactive/retired)",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "code",
        "programId",
        "semester",
        "status"
      ]
    },

    // Exams collection
    exams: {
      description: "Examination schedules and configurations",
      fields: {
        id: "string (auto-generated)",
        name: "string",
        type: "string (internal/mid/end/supplementary)",
        semester: "string (e.g., '2024-1')",
        academicYear: "string",
        startDate: "timestamp",
        endDate: "timestamp",
        duration: "number (minutes)",
        maxMarks: "number",
        weightage: "number (percentage)",
        courseId: "string (reference to courses)",
        programId: "string (reference to programs)",
        department: "string",
        venue: "string",
        invigilators: ["string (faculty IDs)"],
        instructions: "string",
        status: "string (scheduled/ongoing/completed/cancelled)",
        createdAt: "timestamp",
        updatedAt: "timestamp",
        createdBy: "string (user ID)"
      },
      indexes: [
        "type",
        "semester",
        "courseId",
        "programId",
        "status",
        "startDate"
      ]
    },

    // Enrollments collection
    enrollments: {
      description: "Student course enrollments",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        courseId: "string (reference to courses)",
        programId: "string (reference to programs)",
        semester: "string",
        academicYear: "string",
        enrollmentDate: "timestamp",
        status: "string (enrolled/dropped/completed)",
        grade: "string",
        gradePoint: "number",
        creditsEarned: "number",
        remarks: "string",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "studentId",
        "courseId",
        "semester",
        "status"
      ]
    },

    // Marks collection
    marks: {
      description: "Individual student marks for examinations",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        courseId: "string (reference to courses)",
        examId: "string (reference to exams)",
        marksObtained: "number",
        maxMarks: "number",
        percentage: "number",
        grade: "string",
        gradePoint: "number",
        status: "string (draft/submitted/under_moderation/approved/published)",
        remarks: "string",
        specialFlags: ["string (AB/MALP/INC/W)"],
        enteredAt: "timestamp",
        enteredBy: "string (user ID)",
        lastUpdated: "timestamp",
        updatedBy: "string (user ID)",
        submittedAt: "timestamp",
        submittedBy: "string (user ID)",
        moderationRequestedAt: "timestamp",
        moderationRequestedBy: "string (user ID)",
        approvedAt: "timestamp",
        approvedBy: "string (user ID)",
        publishedAt: "timestamp",
        publishedBy: "string (user ID)"
      },
      indexes: [
        "studentId",
        "courseId",
        "examId",
        "status",
        "enteredAt"
      ]
    },

    // Grades collection
    grades: {
      description: "Final grades and SGPA/CGPA records",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        courseId: "string (reference to courses)",
        semester: "string",
        academicYear: "string",
        examPeriod: "string",
        gradeLetter: "string",
        gradePoint: "number",
        credits: "number",
        creditsEarned: "number",
        sgpa: "number",
        cgpa: "number",
        totalCreditsEarned: "number",
        gradeStatus: "string (pass/fail/backlog)",
        isBacklog: "boolean",
        backlogAttempt: "number",
        remarks: "string",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "studentId",
        "courseId",
        "semester",
        "gradeStatus"
      ]
    },

    // Grade Schemes collection
    gradeSchemes: {
      description: "Grading schemes and boundaries",
      fields: {
        id: "string (auto-generated)",
        name: "string",
        description: "string",
        type: "string (10-point/4-point/percentage/letter)",
        scaleType: "string",
        gradeBoundaries: {
          "A+": { min: "number", max: "number", points: "number" },
          "A": { min: "number", max: "number", points: "number" },
          "B+": { min: "number", max: "number", points: "number" },
          "B": { min: "number", max: "number", points: "number" },
          "C+": { min: "number", max: "number", points: "number" },
          "C": { min: "number", max: "number", points: "number" },
          "D": { min: "number", max: "number", points: "number" },
          "F": { min: "number", max: "number", points: "number" }
        },
        passingMarks: "number",
        isActive: "boolean",
        applicableFrom: "timestamp",
        applicableTo: "timestamp",
        programId: "string (reference to programs)",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "type",
        "isActive",
        "programId"
      ]
    },

    // SGPA/CGPA Records collection
    sgpaRecords: {
      description: "Semester-wise SGPA and CGPA records",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        semester: "string",
        academicYear: "string",
        sgpa: "number",
        cgpa: "number",
        totalCredits: "number",
        earnedCredits: "number",
        coursesCount: "number",
        passedCourses: "number",
        failedCourses: "number",
        backlogCourses: "number",
        rank: "number",
        totalStudents: "number",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "studentId",
        "semester",
        "academicYear"
      ]
    },

    // Revaluation Requests collection
    revaluationRequests: {
      description: "Student revaluation and rechecking requests",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        courseId: "string (reference to courses)",
        examId: "string (reference to exams)",
        requestType: "string (revaluation/rechecking/scrutiny)",
        reason: "string",
        currentMarks: "number",
        currentGrade: "string",
        expectedMarks: "number",
        expectedGrade: "string",
        feeAmount: "number",
        feePaid: "boolean",
        paymentReference: "string",
        status: "string (pending/approved/rejected/completed)",
        assignedTo: "string (faculty ID)",
        result: {
          newMarks: "number",
          newGrade: "string",
          gradeChanged: "boolean",
          remarks: "string"
        },
        submittedAt: "timestamp",
        submittedBy: "string (user ID)",
        approvedAt: "timestamp",
        approvedBy: "string (user ID)",
        completedAt: "timestamp",
        completedBy: "string (user ID)",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "studentId",
        "courseId",
        "status",
        "submittedAt"
      ]
    },

    // Supplementary Exams collection
    supplementaryExams: {
      description: "Supplementary examination management",
      fields: {
        id: "string (auto-generated)",
        courseId: "string (reference to courses)",
        semester: "string",
        academicYear: "string",
        examDate: "timestamp",
        venue: "string",
        maxMarks: "number",
        eligibleStudents: ["string (student IDs)"],
        enrolledStudents: ["string (student IDs)"],
        schedule: {
          startTime: "timestamp",
          endTime: "timestamp",
          duration: "number (minutes)"
        },
        status: "string (scheduled/ongoing/completed)",
        result: {
          totalStudents: "number",
          passedStudents: "number",
          failedStudents: "number",
          averageMarks: "number",
          passPercentage: "number"
        },
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "courseId",
        "semester",
        "status",
        "examDate"
      ]
    },

    // Transcripts collection
    transcripts: {
      description: "Student transcript and certificate records",
      fields: {
        id: "string (auto-generated)",
        studentId: "string (reference to students)",
        transcriptType: "string (provisional/consolidated/official)",
        version: "string",
        generatedOn: "timestamp",
        generatedBy: "string (user ID)",
        pdfUrl: "string",
        digitalSignature: "string",
        sealSignedBy: "string (user ID)",
        verificationCode: "string",
        qrCode: "string",
        status: "string (generated/verified/expired)",
        downloadCount: "number",
        lastDownloaded: "timestamp",
        expiresAt: "timestamp",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "studentId",
        "transcriptType",
        "status",
        "generatedOn"
      ]
    },

    // Result Publications collection
    resultPublications: {
      description: "Result publication management",
      fields: {
        id: "string (auto-generated)",
        examId: "string (reference to exams)",
        semester: "string",
        academicYear: "string",
        publishDate: "timestamp",
        publishTime: "timestamp",
        visibilityRules: {
          students: "boolean",
          parents: "boolean",
          faculty: "boolean",
          public: "boolean"
        },
        notificationSent: "boolean",
        notificationSentAt: "timestamp",
        status: "string (draft/scheduled/published/archived)",
        publishedBy: "string (user ID)",
        approvedBy: "string (user ID)",
        approvalDate: "timestamp",
        remarks: "string",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "examId",
        "semester",
        "status",
        "publishDate"
      ]
    },

    // Audit Logs collection
    auditLogs: {
      description: "System audit trail for all operations",
      fields: {
        id: "string (auto-generated)",
        entity: "string (collection name)",
        entityId: "string",
        action: "string",
        userId: "string (user ID)",
        userEmail: "string",
        userRole: "string",
        timestamp: "timestamp",
        details: "object",
        ipAddress: "string",
        userAgent: "string",
        sessionId: "string",
        changes: {
          before: "object",
          after: "object"
        },
        metadata: "object"
      },
      indexes: [
        "entity",
        "entityId",
        "userId",
        "timestamp",
        "action"
      ]
    },

    // Users collection (for role-based access)
    users: {
      description: "System users and role management",
      fields: {
        id: "string (auto-generated)",
        email: "string (unique)",
        name: "string",
        role: "string (faculty/hod/controller/registrar/admin/student)",
        department: "string",
        permissions: ["string"],
        isActive: "boolean",
        lastLogin: "timestamp",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      indexes: [
        "email",
        "role",
        "department",
        "isActive"
      ]
    }
  },

  // Business Rules and Validation
  businessRules: {
    gradeWeights: {
      internal: 30,
      midSemester: 20,
      endSemester: 50
    },
    passingCriteria: {
      perCourse: 40,
      aggregate: 50,
      minimumAttendance: 75
    },
    gradingScheme: {
      type: "10-point",
      boundaries: {
        "A+": { min: 90, max: 100, points: 10 },
        "A": { min: 80, max: 89, points: 9 },
        "B+": { min: 70, max: 79, points: 8 },
        "B": { min: 60, max: 69, points: 7 },
        "C+": { min: 50, max: 59, points: 6 },
        "C": { min: 40, max: 49, points: 5 },
        "D": { min: 35, max: 39, points: 4 },
        "F": { min: 0, max: 34, points: 0 }
      }
    },
    specialFlags: {
      "AB": "Absent",
      "MALP": "Malpractice",
      "INC": "Incomplete",
      "W": "Withdrawn"
    }
  },

  // Workflow States
  workflowStates: {
    marksEntry: ["draft", "submitted", "under_moderation", "approved", "published"],
    moderation: ["pending", "in_review", "approved", "rejected"],
    publication: ["draft", "scheduled", "published", "archived"],
    revaluation: ["open", "closed", "under_review", "completed"]
  },

  // Role-based Permissions
  permissions: {
    faculty: {
      canEnterMarks: true,
      canViewOwnCourses: true,
      canSubmitForModeration: true,
      canRequestGradeChange: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    },
    hod: {
      canEnterMarks: true,
      canViewDepartmentCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: false,
      canManageRevaluation: true,
      canGenerateTranscripts: false
    },
    controller: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    registrar: {
      canEnterMarks: false,
      canViewAllCourses: true,
      canModerateResults: false,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: false,
      canGenerateTranscripts: true
    },
    admin: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    student: {
      canEnterMarks: false,
      canViewOwnResults: true,
      canApplyRevaluation: true,
      canDownloadTranscripts: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    }
  }
};

// Helper functions for database operations
export const databaseHelpers = {
  // Calculate SGPA
  calculateSGPA: (courses) => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = courses.reduce((sum, course) => sum + (course.gradePoint * course.credits), 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  },

  // Calculate CGPA
  calculateCGPA: (semesterResults) => {
    const totalCredits = semesterResults.reduce((sum, semester) => sum + semester.totalCredits, 0);
    const totalPoints = semesterResults.reduce((sum, semester) => sum + (semester.sgpa * semester.totalCredits), 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  },

  // Calculate grade from marks
  calculateGrade: (marksObtained, maxMarks, gradingScheme) => {
    if (marksObtained === 0 && maxMarks === 0) {
      return { grade: 'AB', gradePoint: 0, percentage: 0 };
    }

    const percentage = (marksObtained / maxMarks) * 100;
    const { boundaries } = gradingScheme;
    
    for (const [grade, range] of Object.entries(boundaries)) {
      if (percentage >= range.min && percentage <= range.max) {
        return {
          grade,
          gradePoint: range.points,
          percentage: parseFloat(percentage.toFixed(2))
        };
      }
    }
    
    return { grade: 'F', gradePoint: 0, percentage: parseFloat(percentage.toFixed(2)) };
  },

  // Validate marks entry
  validateMarks: (marksObtained, maxMarks, studentAttendance, minimumAttendance) => {
    const errors = [];
    
    if (marksObtained < 0) {
      errors.push('Marks cannot be negative');
    }
    
    if (marksObtained > maxMarks) {
      errors.push(`Marks cannot exceed maximum marks (${maxMarks})`);
    }
    
    if (studentAttendance < minimumAttendance) {
      errors.push(`Student attendance (${studentAttendance}%) is below minimum requirement (${minimumAttendance}%)`);
    }
    
    return errors;
  },

  // Generate audit log entry
  generateAuditEntry: (entity, entityId, action, userId, userEmail, details = {}) => {
    return {
      entity,
      entityId,
      action,
      userId,
      userEmail,
      timestamp: new Date(),
      details,
      ipAddress: 'client-side', // In real app, get from request
      userAgent: navigator.userAgent,
      sessionId: `session_${Date.now()}`
    };
  }
};

export default GRADES_DATABASE_SCHEMA;
