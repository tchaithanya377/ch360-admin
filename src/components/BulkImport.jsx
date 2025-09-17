import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import * as XLSX from "xlsx";
import { handleError, logError } from "../utils/djangoErrorHandler";

const BulkImport = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(false);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [sheetInfo, setSheetInfo] = useState([]);
  
  // New state for year, section, department selection
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  const availableFields = [
    // Basic Information
    { name: "roll_number", label: "Roll Number", type: "text", required: true },
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "last_name", label: "Last Name", type: "text", required: true },
    { name: "middle_name", label: "Middle Name", type: "text", required: false },
    { name: "date_of_birth", label: "Date of Birth", type: "date", required: false },
    { name: "gender", label: "Gender", type: "select", required: false, options: ["M", "F", "O"] },
    
    // Academic Information
    { name: "section", label: "Section", type: "select", required: false, options: ["A", "B", "C", "D", "E"] },
    { name: "academic_year", label: "Academic Year", type: "text", required: false },
    { name: "year_of_study", label: "Year of Study", type: "select", required: false, options: ["1", "2", "3", "4", "5"] },
    { name: "semester", label: "Semester", type: "select", required: false, options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
    { name: "quota", label: "Quota", type: "select", required: false, options: ["GENERAL", "SC", "ST", "OBC", "EWS", "PHYSICALLY_CHALLENGED", "SPORTS", "NRI"] },
    { name: "rank", label: "Rank", type: "text", required: false },
    { name: "department", label: "Department", type: "select", required: false, options: ["CSE", "ECE", "EEE", "ME", "CE", "IT"] },
    { name: "academic_program", label: "Academic Program", type: "text", required: false },
    
    // Contact Information
    { name: "email", label: "Email", type: "email", required: false },
    { name: "student_mobile", label: "Student Mobile", type: "tel", required: false },
    
    // Address Information
    { name: "village", label: "Village", type: "text", required: false },
    { name: "address_line1", label: "Address Line 1", type: "text", required: false },
    { name: "address_line2", label: "Address Line 2", type: "text", required: false },
    { name: "city", label: "City", type: "text", required: false },
    { name: "state", label: "State", type: "text", required: false },
    { name: "postal_code", label: "Postal Code", type: "text", required: false },
    { name: "country", label: "Country", type: "text", required: false },
    
    // Identity Information
    { name: "aadhar_number", label: "Aadhar Number", type: "text", required: false },
    
    // Religious and Caste Information
    { name: "religion", label: "Religion", type: "select", required: false, options: ["HINDU", "MUSLIM", "CHRISTIAN", "SIKH", "BUDDHIST", "JAIN", "OTHER"] },
    { name: "caste", label: "Caste", type: "text", required: false },
    { name: "subcaste", label: "Subcaste", type: "text", required: false },
    
    // Parent Information
    { name: "father_name", label: "Father's Name", type: "text", required: false },
    { name: "mother_name", label: "Mother's Name", type: "text", required: false },
    { name: "father_mobile", label: "Father's Mobile", type: "tel", required: false },
    { name: "mother_mobile", label: "Mother's Mobile", type: "tel", required: false },
    
    // Academic Status
    { name: "enrollment_date", label: "Enrollment Date", type: "date", required: false },
    { name: "expected_graduation_date", label: "Expected Graduation Date", type: "date", required: false },
    { name: "status", label: "Status", type: "select", required: false, options: ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED", "DROPPED"] },
    
    // Guardian Information (Legacy)
    { name: "guardian_name", label: "Guardian Name", type: "text", required: false },
    { name: "guardian_phone", label: "Guardian Phone", type: "tel", required: false },
    { name: "guardian_email", label: "Guardian Email", type: "email", required: false },
    { name: "guardian_relationship", label: "Guardian Relationship", type: "text", required: false },
    
    // Emergency Contact
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: false },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "tel", required: false },
    { name: "emergency_contact_relationship", label: "Emergency Contact Relationship", type: "text", required: false },
    
    // Medical Information
    { name: "medical_conditions", label: "Medical Conditions", type: "textarea", required: false },
    { name: "medications", label: "Medications", type: "textarea", required: false },
    
    // Additional Information
    { name: "notes", label: "Notes", type: "textarea", required: false },
    { name: "profile_picture", label: "Profile Picture URL", type: "url", required: false },
    { name: "paidAmount", label: "Paid Amount", type: "number", required: false },
    { name: "remainingAmount", label: "Remaining Amount", type: "number", required: false },
    { name: "paymentMethod", label: "Payment Method", type: "text", required: false },
    { name: "feeDueDate", label: "Fee Due Date", type: "date", required: false },
    { name: "installmentPlan", label: "Installment Plan", type: "text", required: false },
    { name: "discountApplied", label: "Discount Applied", type: "number", required: false },
    { name: "discountReason", label: "Discount Reason", type: "text", required: false },
    { name: "remarks", label: "Remarks", type: "textarea", required: false }
  ];

  // Convert Excel serial number to date
  const excelSerialToDate = (serial) => {
    if (!serial || isNaN(serial)) return null;
    
    // Excel dates are number of days since 1900-01-01
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    
    // Format as YYYY-MM-DD
    const year = dateInfo.getUTCFullYear();
    const month = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateInfo.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Get short department name for student ID
  const getDepartmentShortName = (department) => {
    const shortNames = {
      'Civil Engineering': 'CIVIL',
      'Electronics & Communication Engineering': 'ECE',
      'Electrical & Electronics Engineering': 'EEE',
      'Mechanical Engineering': 'MECH',
      'Basic Sciences & Humanities': 'BSH',
      'Management Studies': 'MGMT',
      'Computer Applications': 'MCA',
      'Computer Science & Engineering': 'CSE',
      'Computer Science & Engineering (Artificial Intelligence)': 'CSE_AI',
      'Computer Science & Engineering (Cyber Security)': 'CSE_CS',
      'Computer Science & Technology': 'CST',
      'Computer Science & Engineering (Data Science)': 'CSE_DS',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'CSE_AIML',
      'Computer Science and Engineering (Networks)': 'CSE_NET'
    };
    return shortNames[department] || 'UNKNOWN';
  };

  // Sanitize department name for Firestore collection paths
  // This function converts department names with spaces and special characters
  // into valid Firestore collection names that don't break the path structure
  const sanitizeDepartmentForPath = (department) => {
    const shortNames = {
      'Civil Engineering': 'CivilEngineering',
      'Electronics & Communication Engineering': 'ElectronicsCommunicationEngineering',
      'Electrical & Electronics Engineering': 'ElectricalElectronicsEngineering',
      'Mechanical Engineering': 'MechanicalEngineering',
      'Basic Sciences & Humanities': 'BasicSciencesHumanities',
      'Management Studies': 'ManagementStudies',
      'Computer Applications': 'ComputerApplications',
      'Computer Science & Engineering': 'ComputerScienceEngineering',
      'Computer Science & Engineering (Artificial Intelligence)': 'ComputerScienceEngineeringAI',
      'Computer Science & Engineering (Cyber Security)': 'ComputerScienceEngineeringCS',
      'Computer Science & Technology': 'ComputerScienceTechnology',
      'Computer Science & Engineering (Data Science)': 'ComputerScienceEngineeringDS',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'ComputerScienceEngineeringAIML',
      'Computer Science and Engineering (Networks)': 'ComputerScienceEngineeringNetworks'
    };
    return shortNames[department] || 'Unknown';
  };

  // Convert any date format to YYYY-MM-DD
  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number' && !isNaN(dateValue)) {
      return excelSerialToDate(dateValue);
    }
    
    // If it's a Date object
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return null;
  };

  // Parse year and section from combined field (e.g., "III A" -> year: "III", section: "A")
  const parseYearAndSection = (value) => {
    if (!value) return { year: '', section: '' };
    
    const str = value.toString().trim();
    
    // Handle patterns like "III A", "II-B", "I C", or "IIB" (Roman numerals + single letter)
    const flexibleMatch = str.match(/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)[\s-]*([A-Z])$/i);
    if (flexibleMatch) {
      return {
        year: flexibleMatch[1].toUpperCase(),
        section: flexibleMatch[2].toUpperCase()
      };
    }

    // Handle Section-Year format like "A-II", "B-III", "C-IV"
    const sectionFirstRoman = str.match(/^([A-Z])[\s-]*(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)$/i);
    if (sectionFirstRoman) {
      return {
        year: sectionFirstRoman[2].toUpperCase(),
        section: sectionFirstRoman[1].toUpperCase()
      };
    }
    // Handle Section-Year numeric like "A-2", "B 3"
    const sectionFirstNumeric = str.match(/^([A-Z])[\s-]*(\d{1,2})$/i);
    if (sectionFirstNumeric) {
      return {
        year: sectionFirstNumeric[2],
        section: sectionFirstNumeric[1].toUpperCase()
      };
    }
    
    // Handle patterns like "1st Year A", "2nd Year B", etc.
    const numericYearMatch = str.match(/^(\d+(?:st|nd|rd|th)\s+Year)\s+([A-Z])$/i);
    if (numericYearMatch) {
      return {
        year: numericYearMatch[1],
        section: numericYearMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "First Year A", "Second Year B", etc.
    const writtenYearMatch = str.match(/^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s+Year\s+([A-Z])$/i);
    if (writtenYearMatch) {
      return {
        year: writtenYearMatch[1] + ' Year',
        section: writtenYearMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "Year I A", "Year II B", etc.
    const yearFirstMatch = str.match(/^Year\s+(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)\s+([A-Z])$/i);
    if (yearFirstMatch) {
      return {
        year: yearFirstMatch[1].toUpperCase(),
        section: yearFirstMatch[2].toUpperCase()
      };
    }
    
    // If it's just a year (Roman numerals)
    if (/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)$/i.test(str)) {
      return { year: str.toUpperCase(), section: '' };
    }
    
    // If it's just a year (numeric)
    if (/^\d+(?:st|nd|rd|th)\s+Year$/i.test(str)) {
      return { year: str, section: '' };
    }
    
    // If it's just a year (written)
    if (/^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s+Year$/i.test(str)) {
      return { year: str, section: '' };
    }
    
    // If it's just a section (single letter)
    if (/^[A-Z]$/i.test(str)) {
      return { year: '', section: str.toUpperCase() };
    }
    
    // If it's just a section (Greek letter)
    const greekLetters = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
    if (greekLetters.includes(str)) {
      return { year: '', section: str };
    }
    
    return { year: '', section: '' };
  };

  // Convert any common year representation to a canonical Roman form (I, II, III, IV, ...)
  const toRomanYear = (value) => {
    if (!value) return '';
    const token = value.toString().trim().toUpperCase();
    // Already roman
    if (/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)$/.test(token)) return token;
    // Plain numeric
    const plainNumericMap = {
      '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI',
      '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X', '11': 'XI', '12': 'XII'
    };
    if (plainNumericMap[token]) return plainNumericMap[token];
    const numericMap = {
      '1ST YEAR': 'I', '2ND YEAR': 'II', '3RD YEAR': 'III', '4TH YEAR': 'IV', '5TH YEAR': 'V', '6TH YEAR': 'VI',
      '7TH YEAR': 'VII', '8TH YEAR': 'VIII', '9TH YEAR': 'IX', '10TH YEAR': 'X', '11TH YEAR': 'XI', '12TH YEAR': 'XII'
    };
    if (numericMap[token]) return numericMap[token];
    const writtenMap = {
      'FIRST YEAR': 'I', 'SECOND YEAR': 'II', 'THIRD YEAR': 'III', 'FOURTH YEAR': 'IV', 'FIFTH YEAR': 'V', 'SIXTH YEAR': 'VI',
      'SEVENTH YEAR': 'VII', 'EIGHTH YEAR': 'VIII', 'NINTH YEAR': 'IX', 'TENTH YEAR': 'X', 'ELEVENTH YEAR': 'XI', 'TWELFTH YEAR': 'XII'
    };
    if (writtenMap[token]) return writtenMap[token];
    return token; // fallback unchanged
  };

  // Detect year and section column indices with smart heuristics
  const detectYearAndSectionIndices = (rows, headers) => {
    if (!Array.isArray(headers) || headers.length === 0) {
      return { yearIndex: -1, sectionIndex: -1 };
    }

    // Normalize headers once
    const lowered = headers.map(h => (h ? h.toString().toLowerCase().trim() : ''));

    // 1) Exact matches take priority
    let yearIndex = lowered.findIndex(h => h === 'year');
    let sectionIndex = lowered.findIndex(h => h === 'section');

    // 2) Heuristic for 'class' column: often holds section letters (A/B/C)
    const classIdx = lowered.findIndex(h => h === 'class');
    if (classIdx !== -1 && sectionIndex === -1) {
      // Sample values from this column
      const samples = (rows || []).slice(0, 25).map(r => (Array.isArray(r) ? r[classIdx] : undefined)).filter(Boolean);
      const singleLetters = samples.filter(v => /^[A-Za-z]$/.test(v?.toString().trim()))
      .length;
      const romanLike = samples.filter(v => /^(I{1,3}|IV|V{1,3}|VI{0,3}|VII{0,2}|VIII|IX|X{1,3}|XI|XII)$/i.test(v?.toString().trim()))
      .length;
      if (singleLetters > romanLike) {
        sectionIndex = classIdx;
      } else if (yearIndex === -1) {
        yearIndex = classIdx;
      }
    }

    // 3) Fallbacks using includes if still not found
    if (yearIndex === -1) {
      yearIndex = lowered.findIndex(h => h.includes('year'));
    }
    if (sectionIndex === -1) {
      sectionIndex = lowered.findIndex(h => h.includes('section') || h === 'div' || h.includes('division'));
    }

    // 4) If yearIndex accidentally points to a section-like column, fix it
    if (yearIndex !== -1 && sectionIndex === -1) {
      const samples = (rows || []).slice(0, 25).map(r => (Array.isArray(r) ? r[yearIndex] : undefined)).filter(Boolean);
      const mostlyLetters = samples.filter(v => /^[A-Za-z]$/.test(v?.toString().trim())).length;
      const mostlyRoman = samples.filter(v => /^(I{1,3}|IV|V{1,3}|VI{0,3}|VII{0,2}|VIII|IX|X{1,3}|XI|XII)$/i.test(v?.toString().trim())).length;
      if (mostlyLetters > mostlyRoman) {
        sectionIndex = yearIndex; // treat it as section
        // Try to locate a separate year column again with stronger priority to exact 'year'
        const exactYearIdx = lowered.findIndex(h => h === 'year');
        if (exactYearIdx !== -1) {
          yearIndex = exactYearIdx;
        }
      }
    }

    return { yearIndex, sectionIndex };
  };

  // Sort data by year and section for better organization
  const sortDataByYearAndSection = (rows, headers) => {
    // Find year and section column indices with heuristics
    const { yearIndex, sectionIndex } = detectYearAndSectionIndices(rows, headers);

    if (yearIndex === -1 && sectionIndex === -1) {
      return rows; // No sorting if columns not found
    }

    return rows.filter(row => Array.isArray(row)).sort((a, b) => {
      // Sort by year first
      if (yearIndex !== -1) {
        let yearA = a[yearIndex] || '';
        let yearB = b[yearIndex] || '';
        
        // Parse year and section if they're combined
        if (yearIndex === sectionIndex) {
          const parsedA = parseYearAndSection(yearA);
          const parsedB = parseYearAndSection(yearB);
          yearA = parsedA.year;
          yearB = parsedB.year;
        }
        
        // Convert year to number for proper sorting
        const yearOrder = { 
          'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
          '1ST YEAR': 1, '2ND YEAR': 2, '3RD YEAR': 3, '4TH YEAR': 4, '5TH YEAR': 5, '6TH YEAR': 6, '7TH YEAR': 7, '8TH YEAR': 8, '9TH YEAR': 9, '10TH YEAR': 10, '11TH YEAR': 11, '12TH YEAR': 12,
          'FIRST YEAR': 1, 'SECOND YEAR': 2, 'THIRD YEAR': 3, 'FOURTH YEAR': 4, 'FIFTH YEAR': 5, 'SIXTH YEAR': 6, 'SEVENTH YEAR': 7, 'EIGHTH YEAR': 8, 'NINTH YEAR': 9, 'TENTH YEAR': 10, 'ELEVENTH YEAR': 11, 'TWELFTH YEAR': 12
        };
        const yearAOrder = yearOrder[yearA.toString().toUpperCase()] || 0;
        const yearBOrder = yearOrder[yearB.toString().toUpperCase()] || 0;
        
        if (yearAOrder !== yearBOrder) {
          return yearAOrder - yearBOrder;
        }
      }

      // Then sort by section
      if (sectionIndex !== -1) {
        let sectionA = a[sectionIndex] || '';
        let sectionB = b[sectionIndex] || '';
        
        // Parse year and section if they're combined
        if (yearIndex === sectionIndex) {
          const parsedA = parseYearAndSection(sectionA);
          const parsedB = parseYearAndSection(sectionB);
          sectionA = parsedA.section;
          sectionB = parsedB.section;
        }
        
        if (sectionA !== sectionB) {
          // Handle Greek letters for proper sorting
          const sectionOrder = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26,
            'ALPHA': 27, 'BETA': 28, 'GAMMA': 29, 'DELTA': 30, 'EPSILON': 31, 'ZETA': 32, 'ETA': 33, 'THETA': 34, 'IOTA': 35, 'KAPPA': 36, 'LAMBDA': 37, 'MU': 38, 'NU': 39, 'XI': 40, 'OMICRON': 41, 'PI': 42, 'RHO': 43, 'SIGMA': 44, 'TAU': 45, 'UPSILON': 46, 'PHI': 47, 'CHI': 48, 'PSI': 49, 'OMEGA': 50
          };
          const sectionAOrder = sectionOrder[sectionA.toString().toUpperCase()] || 999;
          const sectionBOrder = sectionOrder[sectionB.toString().toUpperCase()] || 999;
          return sectionAOrder - sectionBOrder;
        }
      }

      // Finally sort by admission number or name for consistency
      const admissionIndex = headers.findIndex(header => 
        header && (header.toLowerCase().includes('admission') || header.toLowerCase().includes('roll'))
      );
      const nameIndex = headers.findIndex(header => 
        header && (header.toLowerCase().includes('name') || header.toLowerCase().includes('student'))
      );

      if (admissionIndex !== -1) {
        const admissionA = a[admissionIndex] || '';
        const admissionB = b[admissionIndex] || '';
        return admissionA.localeCompare(admissionB);
      }

      if (nameIndex !== -1) {
        const nameA = a[nameIndex] || '';
        const nameB = b[nameIndex] || '';
        return nameA.localeCompare(nameB);
      }

      return 0;
    });
  };

  // Group data by year and section for better organization
  const groupDataByYearAndSection = (rows, headers) => {
    const { yearIndex, sectionIndex } = detectYearAndSectionIndices(rows, headers);

    if (yearIndex === -1 && sectionIndex === -1) {
      return { 'All Students': rows };
    }

    const groups = {};
    
    rows.forEach((row, index) => {
      // Ensure row is an array
      if (!Array.isArray(row)) {
        console.warn('Invalid row data at index', index, row);
        return;
      }

      let year = yearIndex !== -1 ? (row[yearIndex] || 'Unknown') : 'All';
      let section = sectionIndex !== -1 ? (row[sectionIndex] || 'Unknown') : 'All';
      
      // Parse year and section if they're combined
      if (yearIndex === sectionIndex && yearIndex !== -1) {
        const parsed = parseYearAndSection(row[yearIndex]);
        year = parsed.year || 'Unknown';
        section = parsed.section || 'Unknown';
      }
      
      // Normalize to consistent YEAR-SECTION label (e.g., II-A)
      const normalizedYear = toRomanYear(year || '');
      const normalizedSection = (section || '').toString().trim().toUpperCase();
      const groupKey = `${normalizedYear || year}-${normalizedSection || section}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      // Keep rows as arrays; avoid spreading into objects which breaks consumers
      groups[groupKey].push(row);
    });

    return groups;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
    processFile(uploadedFile);
  };

  const processFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false });
        
        // Process all sheets
        let allData = [];
        let allHeaders = null;
        let sheetInfo = [];

        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with proper date handling
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });

          if (jsonData.length >= 2) {
            const baseHeaders = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

            if (rows.length > 0) {
              // Parse year and section from sheet name (e.g., "II A", "III B")
              const parsed = parseYearAndSection(sheetName);
              const year = toRomanYear(parsed.year || 'Unknown') || 'Unknown';
              const section = parsed.section || 'Unknown';
              
              // Build sheet headers exactly once, then append values per row
              const sheetHeaders = [...baseHeaders];
              // Detect indices for existing Year/Section columns (case-insensitive)
              const existingYearIdx = sheetHeaders.findIndex(h => h && h.toString().toLowerCase() === 'year');
              const existingSectionIdx = sheetHeaders.findIndex(h => h && h.toString().toLowerCase() === 'section');
              const needYear = existingYearIdx === -1;
              const needSection = existingSectionIdx === -1;
              if (needYear) sheetHeaders.push('Year');
              if (needSection) sheetHeaders.push('Section');
              // Always add hidden columns to preserve sheet-derived values
              sheetHeaders.push('SheetYear');
              sheetHeaders.push('SheetSection');

              // Add year and section info to each row consistently
              const isPlaceholderEmpty = (val) => {
                if (val === undefined || val === null) return true;
                const s = val.toString().trim();
                if (s === '') return true;
                const upper = s.toUpperCase();
                return upper === '-' || upper === '—' || upper === 'NA' || upper === 'N/A' || upper === 'UNKNOWN';
              };

              const enrichedRows = rows.map(row => {
                const newRow = [...row];
                // If Year/Section columns are missing, append parsed values
                if (needYear) {
                  newRow.push(year);
                } else {
                  // Backfill empty cells in existing Year column from sheet name
                  const yrIdx = existingYearIdx;
                  const current = newRow[yrIdx];
                  if (isPlaceholderEmpty(current)) {
                    newRow[yrIdx] = year;
                  }
                }
                if (needSection) {
                  newRow.push(section);
                } else {
                  // Backfill empty cells in existing Section column from sheet name
                  const secIdx = existingSectionIdx;
                  const current = newRow[secIdx];
                  if (isPlaceholderEmpty(current)) {
                    newRow[secIdx] = section;
                  }
                }
                // Append hidden sheet-derived values
                newRow.push(year);
                newRow.push(section);
                return newRow;
              });
              
              // Store sheet information
              sheetInfo.push({
                name: sheetName,
                year: year,
                section: section,
                rowCount: enrichedRows.length,
                startIndex: allData.length
              });
              
              // Merge headers (use the longest header array)
              if (!allHeaders || sheetHeaders.length > allHeaders.length) {
                allHeaders = sheetHeaders;
              }
              
              // Add rows to all data
              allData.push(...enrichedRows);
            }
          }
        });

        if (allData.length === 0) {
          alert('No data found in any sheet of the Excel file');
          return;
        }

        if (allData.length > 1000) {
          alert('Maximum 1000 rows allowed per import');
          return;
        }

        // Normalize row lengths to match header length
        const normalizedData = allData.map(row => {
          const normalizedRow = [...row];
          // Ensure row has same length as headers
          while (normalizedRow.length < allHeaders.length) {
            normalizedRow.push('');
          }
          return normalizedRow;
        });

        // Process dates in the data
        let processedRows = normalizedData.map(row => {
          return row.map((cell, index) => {
            // Check if this column might be a date (based on header)
            const header = allHeaders[index];
            if (header && (header.toLowerCase().includes('date') || header.toLowerCase().includes('dob'))) {
              return normalizeDate(cell);
            }
            return cell;
          });
        });

        // Note: We avoid global backfill of Year to prevent wrong groups like IA/IB/IC.

        // Sort and group; department-only selection now
        const sortedRows = sortDataByYearAndSection(processedRows, allHeaders);
        const grouped = groupDataByYearAndSection(sortedRows, allHeaders);

        // Ensure data is properly formatted
        const finalData = sortedRows.filter(row => Array.isArray(row) && row.length > 0);
        const finalGrouped = {};
        
        Object.entries(grouped).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            finalGrouped[key] = value.filter(row => Array.isArray(row));
          }
        });

        setData(finalData);
        setGroupedData(finalGrouped);
        setSheetInfo(sheetInfo);
        setHeaders(allHeaders || []);
        
        console.log('Processed sheets:', sheetInfo);
        console.log('Total rows:', allData.length);

        // Enhanced auto-mapping with better matching logic
        const autoMapping = {};
        allHeaders.forEach((header, index) => {
          if (!header) return;
          
          const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
          const originalHeader = header.toString().toLowerCase();
          const spaceCleanedHeader = originalHeader.replace(/\s+/g, '');
          
          // Enhanced variations mapping with priority
          const variations = {
            // Roll No variations
            'rollno': 'rollNo',
            'roll number': 'rollNo',
            'roll no': 'rollNo',
            'roll': 'rollNo',
            'roll.': 'rollNo',
            'rollno.': 'rollNo',
            'roll.number': 'rollNo',
            'regno': 'rollNo',
            'registration': 'rollNo',
            'studentid': 'rollNo',
            'id': 'rollNo',
            'student_id': 'rollNo',
            
            // Name variations
            'fullname': 'name',
            'studentname': 'name',
            'student_name': 'name',
            'name': 'name',
            'student': 'name',
            'candidate': 'name',
            'student name': 'name',
            
            // Date of Birth variations
            'dob': 'dateOfBirth',
            'birthdate': 'dateOfBirth',
            'dateofbirth': 'dateOfBirth',
            'birth': 'dateOfBirth',
            'date_of_birth': 'dateOfBirth',
            
            // Mobile variations
            'mobilenumber': 'studentMobile',
            'mobile': 'studentMobile',
            'phone': 'studentMobile',
            'contact': 'studentMobile',
            'phonenumber': 'studentMobile',
            'cell': 'studentMobile',
            'student mobile': 'studentMobile',
            'studentmobile': 'studentMobile',
            
            // Gender variations
            'gender': 'gender',
            'sex': 'gender',
            
            // Email variations
            'email': 'email',
            'emailid': 'email',
            'mail': 'email',
            
            // Father's name variations
            'fathername': 'fatherName',
            'father_name': 'fatherName',
            'father': 'fatherName',
            'fathersname': 'fatherName',
            'father name': 'fatherName',
            
            // Father's mobile variations
            'fathermobile': 'fatherMobile',
            'father_mobile': 'fatherMobile',
            'fatherphone': 'fatherMobile',
            'father_phone': 'fatherMobile',
            'father mobile': 'fatherMobile',
            
            // Mother's name variations
            'mothername': 'motherName',
            'mother_name': 'motherName',
            'mother': 'motherName',
            'mothersname': 'motherName',
            'mother name': 'motherName',
            
            // Address variations
            'address': 'address',
            'addr': 'address',
            'location': 'address',
            'permanentaddress': 'address',
            'permanent_address': 'address',
            'permanent address': 'address',
            
            // Aadhaar variations
            'aadhaar': 'aadhaar',
            'aadhar': 'aadhaar',
            'aadhaarnumber': 'aadhaar',
            'aadharno': 'aadhaar',
            
            // Quota variations
            'quota': 'quota',
            'category': 'quota',
            'reservation': 'quota',
            
            // Year variations
            'year': 'year',
            'class': 'year',
            'grade': 'year',
            'standard': 'year',
            
            // Section variations
            'section': 'section',
            'div': 'section',
            'division': 'section',
            'group': 'section',
            
            // Department variations
            'department': 'department',
            'dept': 'department',
            'branch': 'department',
            'stream': 'department',
            
            // Program variations
            'program': 'program',
            'course': 'program',
            'degree': 'program',
            'qualification': 'program'
          };
          
          // Try exact match first
          if (variations[cleanHeader]) {
            autoMapping[variations[cleanHeader]] = index;
            console.log(`✅ Mapped "${header}" to "${variations[cleanHeader]}" (exact match)`);
            return;
          }
          
          // Try space-cleaned match
          if (variations[spaceCleanedHeader]) {
            autoMapping[variations[spaceCleanedHeader]] = index;
            console.log(`✅ Mapped "${header}" to "${variations[spaceCleanedHeader]}" (space-cleaned match)`);
            return;
          }
          
          // Try partial match
          for (const [key, fieldName] of Object.entries(variations)) {
            if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
              autoMapping[fieldName] = index;
              console.log(`✅ Mapped "${header}" to "${fieldName}" (partial match with "${key}")`);
              break;
            }
          }
        });
        
        // Apply auto-mapping
        setMapping(autoMapping);
        setStep(2);

        // Log the mapping results for debugging
        console.log('📋 Auto-mapping results:', autoMapping);
        
        // Auto-detect Year and Section from data if not mapped
        const enhancedMapping = { ...autoMapping };
        
        // Check if we have unmapped columns that might be Year/Section
        allHeaders.forEach((header, index) => {
          const headerLower = header.toString().toLowerCase();
          
          // If we have a column with single letters (A, B, C) and no year mapping, map it to section
          if (!enhancedMapping.section && (headerLower.includes('section') || headerLower.includes('div') || headerLower.includes('group'))) {
            enhancedMapping.section = index;
            console.log(`🔧 Auto-mapped "${header}" to section`);
          }
          
          // If we have a column that might be year but contains letters, it's likely section
          if (!enhancedMapping.section && !enhancedMapping.year) {
            // Check if this column contains mostly single letters
            const sampleValues = allData.slice(0, 10).map(row => row[index]).filter(val => val);
            const letterValues = sampleValues.filter(val => /^[A-Z]$/.test(val.toString().trim()));
            
            if (letterValues.length > sampleValues.length * 0.5) {
              enhancedMapping.section = index;
              console.log(`🔧 Auto-mapped "${header}" to section (contains letters: ${letterValues.join(', ')})`);
            }
          }
        });
        
        if (enhancedMapping.section !== autoMapping.section) {
          console.log('🔧 Applying enhanced mapping with section detection:', enhancedMapping);
          setMapping(enhancedMapping);
        }
        
        // Year auto-detection disabled (no Year selection in UI)

        // Check if required fields are mapped
        const requiredFields = ['rollNo', 'name'];
        const missingRequired = requiredFields.filter(field => !autoMapping[field]);
        
        if (missingRequired.length > 0) {
          console.warn('⚠️ Missing required fields:', missingRequired);
          console.log('Available headers:', allHeaders);
          
          // Try to manually map missing required fields
          const manualMapping = { ...autoMapping };
          
          // Manual override for common cases
          allHeaders.forEach((header, index) => {
            const headerLower = header.toString().toLowerCase();
            
            // Manual mapping for "Roll. No" → rollNo
            if (headerLower.includes('roll') && !manualMapping.rollNo) {
              manualMapping.rollNo = index;
              console.log(`🔧 Manual override: "${header}" → rollNo`);
            }
            
            // Manual mapping for "Student Name" → name
            if (headerLower.includes('student') && headerLower.includes('name') && !manualMapping.name) {
              manualMapping.name = index;
              console.log(`🔧 Manual override: "${header}" → name`);
            }
          });
          
          if (manualMapping.rollNo !== undefined || manualMapping.name !== undefined) {
            console.log('🔧 Applying manual mapping overrides:', manualMapping);
            setMapping(manualMapping);
          }
        } else {
          console.log('✅ All required fields mapped successfully!');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleYearSectionDepartment = () => {
    if (!selectedDepartment) {
      alert('Please select Department before proceeding.');
      return;
    }
    setStep(3);
    // Run validation after a short delay to ensure state is updated
    setTimeout(() => {
      validateData();
    }, 100);
  };

  // Data cleaning function to fix common Excel import issues
  const cleanData = (rawData) => {
    return rawData.map((row, rowIndex) => {
      const cleanedRow = [...row];
      
      // Clean each cell in the row
      Object.keys(mapping).forEach(fieldName => {
        const columnIndex = mapping[fieldName];
        if (columnIndex !== undefined && cleanedRow[columnIndex] !== undefined) {
          let value = cleanedRow[columnIndex];
          
          // Clean phone numbers - allow 9-11 digits, only trim if more than 11
          if (fieldName === 'studentMobile' || fieldName === 'fatherMobile') {
            const cleanPhone = value.toString().replace(/\D/g, '');
            if (cleanPhone.length > 11) {
              // Take only the first 11 digits if more than 11
              cleanedRow[columnIndex] = cleanPhone.substring(0, 11);
              console.log(`🔧 Fixed phone number in row ${rowIndex + 2}: ${value} → ${cleanedRow[columnIndex]}`);
            } else if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
              // Keep as is if 9-11 digits (valid range)
              cleanedRow[columnIndex] = cleanPhone;
              console.log(`✅ Phone number accepted in row ${rowIndex + 2}: ${cleanPhone} (${cleanPhone.length} digits)`);
            } else if (cleanPhone.length > 0) {
              // Log warning for very short numbers but don't clear them
              console.log(`⚠️ Phone number may be too short in row ${rowIndex + 2}: ${value} (${cleanPhone.length} digits)`);
            }
          }
          
          // Normalize placeholders for year/section
          if (fieldName === 'year' || fieldName === 'section') {
            const token = value?.toString().trim();
            if (token && ['-', '—', 'NA', 'N/A', 'Unknown', 'unknown'].includes(token)) {
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared placeholder in ${fieldName} at row ${rowIndex + 2}: "${token}"`);
            }
          }

          // Clean year values - if it's a single letter (A, B, C), it's likely a section, not year
          if (fieldName === 'year') {
            const yearValue = value.toString().trim();
            if (yearValue.length === 1 && /^[A-Z]$/.test(yearValue)) {
              // This is likely a section, not a year - clear it
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared year value in row ${rowIndex + 2}: "${value}" (likely a section)`);
            }
          }
          
          // Clean gender values - remove header-like values
          if (fieldName === 'gender') {
            const genderValue = value.toString().trim();
            if (genderValue.toLowerCase() === 'gender') {
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared gender value in row ${rowIndex + 2}: "${value}" (header)`);
            }
          }
        }
      });
      
      return cleanedRow;
    });
  };

  const validateData = () => {
    const newErrors = [];
    
    // Clean the data first
    const cleanedData = cleanData(data);
    
    console.log('🔍 Validation Debug Info:');
    console.log('Current mapping:', mapping);
    console.log('Available fields:', availableFields.map(f => ({ name: f.name, required: f.required })));
    console.log('Data sample (cleaned):', cleanedData.slice(0, 2));

    // First, check for unmapped required fields (roll_number, first_name, last_name)
    availableFields.forEach(field => {
      if (field.required && mapping[field.name] === undefined) {
        console.log(`❌ Required field "${field.name}" (${field.label}) is not mapped!`);
        newErrors.push({
          type: 'mapping',
          field: field.label,
          message: `${field.label} is required but not mapped`,
          value: 'Not mapped'
        });
      } else if (field.required) {
        console.log(`✅ Required field "${field.name}" (${field.label}) is mapped to index ${mapping[field.name]}`);
      }
    });

    // Then validate only required fields and mapped optional fields with cleaned data
    cleanedData.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;

      availableFields.forEach(field => {
        if (mapping[field.name] !== undefined) {
          const value = row[mapping[field.name]];
          
          // Required field validation (only for admission number and name)
          if (field.required && (!value || value.toString().trim() === '')) {
            newErrors.push({
              type: 'validation',
              row: rowNumber,
              field: field.label,
              message: `${field.label} is required`,
              value: value
            });
            return;
          }

          // Skip validation for empty optional fields
          if (!value || value.toString().trim() === '') {
            return;
          }

          const stringValue = value.toString().trim();

          // Only validate email if it's not empty and looks like an email
          if (field.type === 'email' && stringValue.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid email address`,
                value: value
              });
            }
          }

          // Enhanced phone validation with flexible length (9-11 digits)
          if (field.type === 'tel' && /\d/.test(stringValue)) {
            const cleanPhone = stringValue.replace(/\D/g, '');
            
            // Allow 9-11 digits for flexibility
            if (cleanPhone.length < 9 || cleanPhone.length > 11) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be 9-11 digits (found ${cleanPhone.length} digits)`,
                value: value
              });
            }
            // Only check prefix if it's 10 digits (standard mobile format)
            else if (cleanPhone.length === 10 && !/^[6-9]/.test(cleanPhone)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must start with 6, 7, 8, or 9`,
                value: value
              });
            }
          }

          // Aadhar number validation (12 digits)
          if (field.name === 'aadhar_number' && stringValue) {
            const digitsOnly = stringValue.replace(/\D/g, '');
            if (digitsOnly.length !== 12) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be exactly 12 digits`,
                value: value
              });
            }
          }

          // Enhanced select validation with better error handling
          if (field.type === 'select' && field.options && stringValue) {
            // Skip validation if the value looks like a header (case-insensitive match with field label)
            const fieldLabelLower = field.label.toLowerCase();
            const valueLower = stringValue.toLowerCase();
            
            if (fieldLabelLower === valueLower || 
                valueLower === 'gender' || 
                valueLower === 'year' || 
                valueLower === 'section' ||
                valueLower === 'department') {
              // This is likely a header row, skip validation
              console.log(`⚠️ Skipping validation for header-like value: "${stringValue}" in field "${field.label}"`);
              return;
            }
            
            if (!field.options.includes(stringValue)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be one of: ${field.options.join(', ')}`,
                value: value
              });
            }
          }

          // Only validate number fields if the value looks like a number
          if (field.type === 'number' && !isNaN(parseFloat(stringValue))) {
            if (parseFloat(stringValue) < 0) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid positive number`,
                value: value
              });
            }
          }

          // Only validate date fields if the value looks like a date
          if (field.type === 'date' && stringValue) {
            const normalizedDate = normalizeDate(value);
            if (!normalizedDate) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid date`,
                value: value
              });
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleImport = async () => {
    if (!validateData()) {
      alert(`Please fix ${errors.length} validation errors before importing`);
      return;
    }

    // Check for duplicate roll numbers with more flexible handling
    const rollNumbers = new Set();
    const duplicates = [];
    
    if (!skipDuplicateCheck) {
      data.forEach((row, index) => {
        const rollIndex = mapping.roll_number;
        if (rollIndex !== undefined && row[rollIndex]) {
          const rollNo = row[rollIndex].toString().trim();
          if (rollNumbers.has(rollNo)) {
            duplicates.push({ row: index + 2, rollNo });
          } else {
            rollNumbers.add(rollNo);
          }
        }
      });

      if (duplicates.length > 0) {
        const duplicateList = duplicates.map(d => `Row ${d.row}: ${d.rollNo}`).join('\n');
        const shouldContinue = confirm(
          `Found ${duplicates.length} duplicate roll numbers:\n${duplicateList}\n\n` +
          `⚠️ WARNING: Duplicates may cause data conflicts.\n\n` +
          `Do you want to continue with the import anyway?\n` +
          `(Click OK to continue, Cancel to fix duplicates first)`
        );
        
        if (!shouldContinue) {
          return;
        }
        
        console.log(`⚠️ Proceeding with import despite ${duplicates.length} duplicate roll numbers`);
      }
    } else {
      console.log(`⚠️ Skipping duplicate roll number check as requested`);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
        let successCount = 0;
        let errorCount = 0;

             // Use sorted data for import
       const sortedData = [...data];
       
       // Restrict allowed years to those actually present in sheet tabs
       const allowedYearsSet = new Set(
         (sheetInfo || [])
           .map(s => (s.year || '').toString().trim().toUpperCase())
           .filter(y => y && y !== 'UNKNOWN' && y !== 'U')
       );
       // Map of allowed sections by year based on sheet tabs
       const allowedSectionsByYear = new Map();
       (sheetInfo || []).forEach(s => {
         const yr = (s.year || '').toString().trim().toUpperCase() || 'U';
         const sec = (s.section || '').toString().trim().toUpperCase() || 'U';
         if (!allowedSectionsByYear.has(yr)) allowedSectionsByYear.set(yr, new Set());
         allowedSectionsByYear.get(yr).add(sec);
       });
       
       for (let i = 0; i < sortedData.length; i++) {
         const row = sortedData[i];

        try {
          const studentData = {};
          Object.keys(mapping).forEach(fieldName => {
            const columnIndex = mapping[fieldName];
            if (columnIndex !== undefined && row[columnIndex] !== undefined) {
              let value = row[columnIndex];
              
              const field = availableFields.find(f => f.name === fieldName);
              if (field) {
                switch (field.type) {
                  case 'number':
                    value = parseFloat(value) || 0;
                    break;
                  case 'date':
                    value = normalizeDate(value);
                    break;
                  case 'tel':
                    // Clean phone numbers - remove non-digits
                    value = value.toString().replace(/\D/g, '');
                    break;
                  default:
                    value = value.toString().trim();
                }
              }
              
              // Use the correct Django model field name
              studentData[fieldName] = value;
            }
          });

                     // Override with selected department, year, section if not mapped in Excel
           if (selectedDepartment) studentData.department = selectedDepartment;
           
           // Handle year and section parsing (infer from data)
           // Try to parse from Excel data if available
           const yearIndex = headers.findIndex(header => 
             header && (header.toLowerCase().includes('year') || header.toLowerCase().includes('class'))
           );
           const sectionIndex = headers.findIndex(header => 
             header && (header.toLowerCase().includes('section') || header.toLowerCase().includes('div'))
           );
           // Highest priority: hidden SheetYear/SheetSection
           const sheetYearIdx = headers.findIndex(h => h && h.toString().toLowerCase() === 'sheetyear');
           const sheetSectionIdx = headers.findIndex(h => h && h.toString().toLowerCase() === 'sheetsection');
           // Use sheet-derived first if available
           if (sheetYearIdx !== -1) {
             studentData.year_of_study = row[sheetYearIdx];
           }
           if (sheetSectionIdx !== -1) {
             studentData.section = row[sheetSectionIdx];
           }
           // Use explicit year/section if not available
           if (!studentData.year_of_study) {
             if (yearIndex !== -1) {
               studentData.year_of_study = row[yearIndex];
             }
           }
           if (!studentData.section) {
             if (sectionIndex !== -1) {
               studentData.section = row[sectionIndex];
             }
           }

           const normalizeToken = (val) => {
             if (!val) return 'U';
             const str = val.toString().trim();
             if (!str || str.toLowerCase() === 'unknown') return 'U';
             return str.toUpperCase();
           };
           studentData.year_of_study = normalizeToken(studentData.year_of_study);
           studentData.section = normalizeToken(studentData.section);

           // If year appears as a single letter and section unknown, swap
           if (/^[A-Z]$/.test(studentData.year_of_study) && (studentData.section === 'U' || studentData.section === '' || studentData.section === 'UNKNOWN')) {
             const letter = studentData.year_of_study;
             studentData.year_of_study = 'U';
             studentData.section = letter;
           }

           // Last-resort: scan entire row for a combined pattern like "III A" and fill missing parts
           if (studentData.year_of_study === 'U' || studentData.section === 'U') {
             for (let scanIdx = 0; scanIdx < row.length; scanIdx++) {
               const cell = row[scanIdx];
               if (!cell) continue;
               const parsed = parseYearAndSection(cell.toString());
               if (studentData.year_of_study === 'U' && parsed.year) studentData.year_of_study = normalizeToken(parsed.year);
               if (studentData.section === 'U' && parsed.section) studentData.section = normalizeToken(parsed.section);
               if (studentData.year_of_study !== 'U' && studentData.section !== 'U') break;
             }
           }

           // Enforce that year/section belong to the sets parsed from sheet tabs
           try {
             // Build allowed sets/maps from sheetInfo
             const allowedYearsSetLocal = new Set(
               (sheetInfo || [])
                 .map(s => (s.year || '').toString().trim().toUpperCase())
                 .filter(y => y && y !== 'UNKNOWN' && y !== 'U')
             );
             const allowedSectionsByYearLocal = new Map();
             const yearFrequencyLocal = new Map();
             (sheetInfo || []).forEach(s => {
               const yr = (s.year || '').toString().trim().toUpperCase() || 'U';
               const sec = (s.section || '').toString().trim().toUpperCase() || 'U';
               if (!allowedSectionsByYearLocal.has(yr)) allowedSectionsByYearLocal.set(yr, new Set());
               allowedSectionsByYearLocal.get(yr).add(sec);
               yearFrequencyLocal.set(yr, (yearFrequencyLocal.get(yr) || 0) + 1);
             });
             const pickMostFrequentYearLocal = () => {
               let bestYear = null;
               let bestCount = -1;
               for (const [yr, cnt] of yearFrequencyLocal.entries()) {
                 if (cnt > bestCount) { bestYear = yr; bestCount = cnt; }
               }
               return bestYear || 'U';
             };

             const isRomanYear = (y) => /^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)$/.test((y || '').toString().toUpperCase());

             // Only coerce the year if it's unknown/invalid, never override a valid Roman year like IV
             if (!isRomanYear(studentData.year_of_study)) {
               if (studentData.year_of_study === 'U' || studentData.year_of_study === '' || studentData.year_of_study === 'UNKNOWN') {
                 if (allowedYearsSetLocal.size > 0) {
                   studentData.year_of_study = pickMostFrequentYearLocal();
                 }
               }
             }

             // For section, only coerce if unknown or not allowed for the chosen year AND we know allowed set for that year
             const allowedForYear = allowedSectionsByYearLocal.get(studentData.year_of_study);
             const isUnknownSection = (s) => !s || s === 'U' || s === 'UNKNOWN' || s === '';
             if (allowedForYear && (isUnknownSection(studentData.section) || !allowedForYear.has(studentData.section))) {
               const firstAllowed = Array.from(allowedForYear).sort()[0];
               if (firstAllowed) studentData.section = firstAllowed;
             }
           } catch (e) {
             // If anything goes wrong, keep existing values
           }

           // Final fallback if any is still missing (use compact tokens)
           if (!studentData.year_of_study) studentData.year_of_study = 'U';
           if (!studentData.section) studentData.section = 'U';

           // Extra recovery from explicit 'Year'/'Section' columns if present
           const explicitYearIdx = headers.findIndex(h => h && h.toString().toLowerCase() === 'year');
           const explicitSectionIdx = headers.findIndex(h => h && h.toString().toLowerCase() === 'section');
           if ((studentData.year_of_study === 'U' || studentData.year_of_study === 'Unknown') && explicitYearIdx !== -1) {
             const yr = row[explicitYearIdx];
             if (yr) studentData.year_of_study = yr;
           }
           if ((studentData.section === 'U' || studentData.section === 'Unknown') && explicitSectionIdx !== -1) {
             const sec = row[explicitSectionIdx];
             if (sec) studentData.section = sec;
           }

                               // Create a shorter, more manageable student ID with duplicate handling
          const deptShort = getDepartmentShortName(studentData.department);
          // Use provided roll number or auto-generate if missing
          let baseRollNo = studentData.roll_number || `AUTO_${Date.now()}_${i}`;
          
          // Handle duplicate admission numbers by adding a suffix
          let studentId = `${deptShort}_${studentData.year_of_study || 'U'}_${studentData.section || 'U'}_${baseRollNo}`;
          
          // If duplicate is detected, keep original roll number (no suffix) but make studentId unique by adding a counter only to ID
          if (rollNumbers && rollNumbers.has(`${deptShort}|${studentData.year_of_study}|${studentData.section}|${baseRollNo}`)) {
            let counter = 1;
            while (rollNumbers.has(`${deptShort}|${studentData.year_of_study}|${studentData.section}|${baseRollNo}_${counter}`)) {
              counter++;
            }
            // Keep roll number field unchanged; only the doc id will vary if conflict
            baseRollNo = `${baseRollNo}_${counter}`;
            studentId = `${deptShort}_${studentData.year_of_study || 'U'}_${studentData.section || 'U'}_${baseRollNo}`;
            console.log(`🔄 Duplicate roll detected in same group. Using unique doc id: ${baseRollNo}`);
          }
          
          // Add the roll number to the set to track for future duplicates
          if (rollNumbers) {
            rollNumbers.add(`${deptShort}|${studentData.year_of_study}|${studentData.section}|${baseRollNo}`);
          }
          
            const finalStudentData = {
              ...studentData,
              status: "ACTIVE",
              enrollment_date: new Date().toISOString().split('T')[0]
            };

          // Validate required fields before saving
          if (!finalStudentData.roll_number || !finalStudentData.first_name) {
            console.error(`Row ${i + 1}: Missing required fields - Roll Number: ${finalStudentData.roll_number}, First Name: ${finalStudentData.first_name}`);
            errorCount++;
            continue;
          }

          // Create student using Django API
          try {
            await studentApiService.createStudent(finalStudentData);
            successCount++;
            console.log(`✅ Successfully created student: ${finalStudentData.roll_number}`);
          } catch (apiError) {
            console.error(`❌ Failed to create student ${finalStudentData.roll_number}:`, apiError);
            errorCount++;
          }
                 } catch (error) {
           console.error(`Error processing row ${i + 1}:`, error);
           console.error(`Row data:`, row);
           
           // Handle errors with better user feedback
           const errorInfo = handleError(error, `BulkImport-Row${i + 1}`);
           logError(errorInfo);
           
           if (errorInfo.type === 'NETWORK') {
             // Stop the import process for connectivity issues
             setIsUploading(false);
             setUploadProgress(0);
             return;
           }
           
           // Log specific error details for debugging
           if (error.message?.includes('collection reference') || error.message?.includes('document reference')) {
             console.error(`Path reference error for row ${i + 1}`);
           }
           
           errorCount++;
         }

        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);
      }

        // Import completed

      const message = `Import completed!\n\n✅ Successfully imported: ${successCount} students\n❌ Failed: ${errorCount} students`;
      alert(message);
      
      if (onSuccess) {
        onSuccess(successCount);
      }

      setStep(4);
         } catch (error) {
       console.error('Import error:', error);
       
       // Handle import errors with better user feedback
       const errorInfo = handleError(error, 'BulkImport-Main');
       logError(errorInfo);
     } finally {
       setIsUploading(false);
       setUploadProgress(0);
     }
  };

  const downloadTemplate = () => {
    const templateData = availableFields.map(field => ({
      [field.label]: field.required ? `Required: ${field.type}` : `Optional: ${field.type}`
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

     const testBulkImport = () => {
            const testData = [
         ['Admission Number', 'Full Name', 'Gender', 'Date of Birth', 'Email', 'Mobile Number', 'Program', 'Department', 'Year', 'Section', 'Father\'s Name', 'Father\'s Mobile', 'Mother\'s Name', 'Address', 'State', 'District', 'Pincode', 'Fee Structure', 'Total Fee', 'Payment Status'],
         ['TEST001', 'Test Student 1', 'Male', '2000-01-01', 'test1@example.com', '9876543210', 'B.Tech', 'Computer Science & Engineering', 'I', 'A', 'Test Father 1', '9876543211', 'Test Mother 1', 'Test Address 1', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['', 'Test Student 2', 'Female', '2000-02-01', 'test2@example.com', '9876543212', 'B.Tech', 'Computer Science & Engineering', 'I', 'A', 'Test Father 2', '9876543213', 'Test Mother 2', 'Test Address 2', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['TEST003', 'Test Student 3', 'Male', '2000-03-01', 'test3@example.com', '9876543214', 'B.Tech', 'Computer Science & Engineering', 'I', 'B', 'Test Father 3', '9876543215', 'Test Mother 3', 'Test Address 3', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['', 'Test Student 4', 'Female', '2000-04-01', 'test4@example.com', '9876543216', 'B.Tech', 'Computer Science & Engineering', 'II', 'A', 'Test Father 4', '9876543217', 'Test Mother 4', 'Test Address 4', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['TEST005', 'Test Student 5', 'Male', '2000-05-01', 'test5@example.com', '9876543218', 'B.Tech', 'Computer Science & Engineering', 'II', 'B', 'Test Father 5', '9876543219', 'Test Mother 5', 'Test Address 5', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending']
       ];
     
     const headers = testData[0];
     const rows = testData.slice(1);
     
     // Sort and group the test data
     const sortedRows = sortDataByYearAndSection(rows, headers);
     const grouped = groupDataByYearAndSection(sortedRows, headers);
     
     setData(sortedRows);
     setGroupedData(grouped);
     setMapping({
       rollNo: 0, name: 1, gender: 2, dateOfBirth: 3, email: 4, studentMobile: 5,
       program: 6, department: 7, year: 8, section: 9, fatherName: 10, fatherMobile: 11,
       motherName: 12, address: 13, stateOfOrigin: 14, district: 15, pincode: 16,
       feeStructure: 17, totalFee: 18, paymentStatus: 19
     });
     setStep(2);
   };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Excel File</h3>
        <p className="text-gray-600 text-lg">Select an Excel file (.xlsx, .xls) or CSV file containing student data</p>
      </div>

      <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-3">Click to upload or drag and drop</p>
          <p className="text-gray-500 mb-4">Excel files (.xlsx, .xls) or CSV files only (Max 10MB)</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose File
          </div>
        </label>
      </div>

      <div className="flex justify-center space-x-6">
        <button
          onClick={downloadTemplate}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold">Download Template</span>
        </button>
        <button
          onClick={testBulkImport}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-semibold">Test Import</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Department</h3>
          <p className="text-gray-600">Choose the department for all students in this import</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Department *</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Department</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
              <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Basic Sciences & Humanities">Basic Sciences & Humanities</option>
              <option value="Management Studies">Management Studies</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
              <option value="Computer Science & Engineering (Cyber Security)">Computer Science & Engineering (Cyber Security)</option>
              <option value="Computer Science & Technology">Computer Science & Technology</option>
              <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
              <option value="Computer Science and Engineering (Artificial Intelligence and Machine Learning)">Computer Science and Engineering (Artificial Intelligence and Machine Learning)</option>
              <option value="Computer Science and Engineering (Networks)">Computer Science and Engineering (Networks)</option>
            </select>
          </div>
        </div>

        {/* Removed additional import information and year/section selection per request */}

        <div className="flex justify-between">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleYearSectionDepartment}
            disabled={!selectedDepartment}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedDepartment
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Continue to Mapping
          </button>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Map Columns & Validate Data</h3>
        <p className="text-gray-600">Match your Excel columns to the student data fields and review validation</p>
      </div>

             {/* Data Summary */}
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
         <div className="flex items-center mb-3">
           <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
           </svg>
           <h4 className="text-blue-800 font-semibold">Data Summary</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{data.length}</div>
             <div className="text-sm text-blue-700">Total Students</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{Object.keys(groupedData).length}</div>
             <div className="text-sm text-blue-700">Year-Section Groups</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{Array.isArray(data[0]) ? data[0].length : 0}</div>
             <div className="text-sm text-blue-700">Data Columns</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{sheetInfo.length}</div>
             <div className="text-sm text-blue-700">Excel Sheets</div>
           </div>
         </div>
         {Object.keys(groupedData).length > 0 && (
           <div className="mt-3 pt-3 border-t border-blue-200">
             <p className="text-sm text-blue-700 mb-2">Distribution by Year & Section:</p>
             <div className="flex flex-wrap gap-2">
               {Object.entries(groupedData).map(([groupKey, groupRows]) => (
                 <span key={groupKey} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                   {groupKey}: {groupRows.length}
                 </span>
               ))}
             </div>
           </div>
         )}
       </div>

       {/* Validation Status */}
       <div className={`border rounded-lg p-4 ${
         errors.length > 0 
           ? 'bg-red-50 border-red-200' 
           : 'bg-green-50 border-green-200'
       }`}>
         <div className="flex items-center mb-3">
           {errors.length > 0 ? (
             <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           ) : (
             <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           )}
           <h4 className={`font-semibold ${
             errors.length > 0 ? 'text-red-800' : 'text-green-800'
           }`}>
             {errors.length > 0 
               ? `${errors.length} Validation Error${errors.length !== 1 ? 's' : ''} Found` 
               : 'All Data Validated Successfully!'
             }
           </h4>
         </div>
         
         {errors.length > 0 && (
           <div className="max-h-40 overflow-y-auto space-y-2">
             {errors.slice(0, 10).map((error, index) => (
               <div key={index} className="text-sm text-red-700 bg-white p-2 rounded border">
                 {error.type === 'mapping' ? (
                   <div>
                     <span className="font-medium text-red-800">🔗 Mapping Error:</span> 
                     <span className="ml-1">{error.message}</span>
                   </div>
                 ) : (
                   <div>
                     <span className="font-medium text-red-800">📋 Row {error.row}:</span> 
                     <span className="ml-1">{error.message}</span>
                   </div>
                 )}
                 {error.value && (
                   <div className="text-red-600 text-xs mt-1">
                     Value: <code className="bg-red-100 px-1 rounded">{error.value}</code>
                   </div>
                 )}
               </div>
             ))}
             {errors.length > 10 && (
               <div className="text-sm text-red-600 font-medium bg-white p-2 rounded border">
                 ... and {errors.length - 10} more errors
               </div>
             )}
           </div>
         )}
         
         {errors.length === 0 && (
           <div className="text-sm text-green-700">
             <p>✅ Required fields (Admission Number & Full Name) are mapped</p>
             <p>✅ Data validation passed</p>
             <p>✅ Ready to import {data.length} students</p>
           </div>
         )}
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Available Fields</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setMapping({})}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                title="Clear all mappings"
              >
                🗑️ Clear All
              </button>
              <button
                onClick={() => validateData()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                title="Run validation"
              >
                🔄 Validate Now
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => (
              <div key={field.name} className={`p-3 border rounded-lg ${
                field.required && mapping[field.name] === undefined 
                  ? 'border-red-300 bg-red-50' 
                  : mapping[field.name] !== undefined
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{field.label}</p>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                      {mapping[field.name] !== undefined && (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{field.type} {field.required && '(Required)'}</p>
                    {mapping[field.name] !== undefined && (
                      <p className="text-xs text-green-600 mt-1">
                        Mapped to: {data[0]?.[mapping[field.name]] || `Column ${mapping[field.name] + 1}`}
                      </p>
                    )}
                  </div>
                  <select
                    value={mapping[field.name] || ''}
                    onChange={(e) => {
                      const newMapping = {
                        ...mapping,
                        [field.name]: e.target.value ? parseInt(e.target.value) : undefined
                      };
                      setMapping(newMapping);
                      // Run validation after mapping change
                      setTimeout(() => {
                        validateData();
                      }, 100);
                    }}
                    className={`px-3 py-1 border rounded text-sm ${
                      field.required && mapping[field.name] === undefined 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Not mapped</option>
                    {Array.isArray(headers) && headers.length > 0 ? headers.map((header, index) => (
                      <option key={index} value={index}>
                        {header || `Column ${index + 1}`}
                      </option>
                    )) : (
                      <option value="">No data available</option>
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Preview Data (Grouped by Year & Section)</h4>
            <div className="text-sm text-gray-600">
              {Object.keys(mapping).length} of {availableFields.length} fields mapped
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([groupKey, groupRows]) => (
                <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="font-medium text-blue-900">{groupKey}</h5>
                    <p className="text-sm text-blue-700">{groupRows.length} student{groupRows.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {Array.isArray(headers) && headers.length > 0 ? headers.map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              {header || `Column ${index + 1}`}
                            </th>
                          )) : (
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              No headers available
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupRows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {Array.isArray(row) ? row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 border-b">
                                {cell || '-'}
                              </td>
                            )) : (
                              <td className="px-3 py-2 text-sm text-gray-900 border-b text-red-500">
                                Invalid row data
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {groupRows.length > 3 && (
                      <p className="text-sm text-gray-500 p-2 text-center bg-gray-50">
                        Showing first 3 rows of {groupRows.length} students in {groupKey}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No data to preview</p>
              </div>
            )}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700">
                Data has been automatically sorted by Year → Section → Admission Number for better organization
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Skip duplicate check option */}
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input
            type="checkbox"
            id="skipDuplicateCheck"
            checked={skipDuplicateCheck}
            onChange={(e) => setSkipDuplicateCheck(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="skipDuplicateCheck" className="text-sm text-yellow-800">
            Skip duplicate admission number check (⚠️ May cause data conflicts)
          </label>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setStep(2)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleImport}
            disabled={errors.length > 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              errors.length > 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {errors.length > 0 ? `Fix ${errors.length} Errors First` : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Import Complete!</h3>
      <p className="text-gray-600">The bulk import has been completed successfully.</p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setStep(1);
            setFile(null);
            setData([]);
            setMapping({});
            setErrors([]);
            setSelectedYear("");
            setSelectedSection("");
            setSelectedDepartment("");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Import Another File
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

     const renderProgress = () => (
     <div className="space-y-4">
       <div className="text-center">
         <h3 className="text-xl font-semibold text-gray-900 mb-2">Importing Students</h3>
         <p className="text-gray-600">Please wait while we import your data...</p>
       </div>
       
       <div className="w-full bg-gray-200 rounded-full h-2">
         <div 
           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
           style={{ width: `${uploadProgress}%` }}
         ></div>
       </div>
       
       <div className="text-center space-y-2">
         <p className="text-sm text-gray-600">
           {Math.round(uploadProgress)}% complete
         </p>
         
         {/* Show current group being processed */}
         {Object.keys(groupedData).length > 0 && (
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
             <p className="text-sm text-blue-700">
               <strong>Processing:</strong> Students are being imported in order by Year → Section
             </p>
             <p className="text-xs text-blue-600 mt-1">
               Data is organized for optimal storage structure
             </p>
           </div>
         )}
       </div>
     </div>
   );

  // Debug function to test mapping - can be called from browser console
  const debugMapping = () => {
    console.log('🔍 Debug Mapping Function');
    console.log('Current mapping state:', mapping);
    console.log('Current data state:', data);
    console.log('Current step:', step);
    
    // Test with the exact headers from your Excel file
    const testHeaders = [
      'Roll. No',
      'Student Name', 
      'Quota',
      'Gender',
      'Aadhaar',
      'Student Mobile',
      'Father Mobile',
      'Father Name',
      'Mother Name',
      'Permanent Address'
    ];
    
    console.log('Testing with your exact headers:', testHeaders);
    
    // Import and use the enhanced mapping function
    import('../utils/testBulkImport.js').then(({ enhancedMapping }) => {
      const testMapping = enhancedMapping(testHeaders);
      console.log('Enhanced mapping result:', testMapping);
      
      // Check if required fields are mapped
      const requiredFields = ['rollNo', 'name'];
      const missingFields = requiredFields.filter(field => !testMapping[field]);
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields);
      } else {
        console.log('✅ All required fields mapped successfully!');
      }
    });
  };

  // Expose debug function to window for console access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugBulkImportMapping = debugMapping;
    }
  }, [mapping, data, step]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Import Students</h2>
                <p className="text-blue-100 text-sm">Import multiple students from Excel/CSV file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-blue-100 transition-colors rounded-xl hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center mt-8">
            {[
              { number: 1, title: 'Upload File' },
              { number: 2, title: 'Preview Data' },
              { number: 3, title: 'Map Fields' },
              { number: 4, title: 'Complete' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepInfo.number 
                      ? 'bg-white text-blue-600 shadow-lg scale-110' 
                      : 'bg-white bg-opacity-20 text-white'
                  }`}>
                    {stepInfo.number}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    step >= stepInfo.number ? 'text-white' : 'text-blue-100'
                  }`}>
                    {stepInfo.title}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step > stepInfo.number ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isUploading ? renderProgress() : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
