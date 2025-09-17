// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faDownload,
  faSpinner,
  faEye,
  faEyeSlash,
  faPhone,
  faEnvelope,
  faUser,
  faIdCard,
  faMapMarkerAlt,
  faGraduationCap,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import StudentAccessCard from './StudentManagement/StudentAccessCard';

const EnhancedBulkImport = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [detectedYears, setDetectedYears] = useState([]);
  const [detectedSections, setDetectedSections] = useState([]);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    authCreated: 0,
    authFailed: 0
  });
  const [showAccessCard, setShowAccessCard] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Excel column mapping based on your format - only map columns that exist
  const excelMapping = {
    'S. NO': 'serialNo',
    'Roll. No': 'rollNo',
    'Student Name': 'studentName',
    'Quota': 'quota',
    'Gender': 'gender',
    'Student Mobile': 'studentMobile',
    'Father Mobile': 'fatherMobile',
    'Father Name': 'fatherName',
    'Mother Name': 'motherName',
    'Permanent Address': 'permanentAddress',
    'Year': 'year',
    'Section': 'section'
  };

  // Department options
  const departments = [
    { value: 'CSE', label: 'Computer Science & Engineering', short: 'CSE' },
    { value: 'CSE_AI', label: 'Computer Science & Engineering (Artificial Intelligence)', short: 'CSE-AI' },
    { value: 'CSE_CS', label: 'Computer Science & Engineering (Cyber Security)', short: 'CSE-CS' },
    { value: 'CSE_DS', label: 'Computer Science & Engineering (Data Science)', short: 'CSE-DS' },
    { value: 'CSE_AI_ML', label: 'Computer Science & Engineering (AI & ML)', short: 'CSE-AI-ML' },
    { value: 'CSE_NETWORKS', label: 'Computer Science & Engineering (Networks)', short: 'CSE-NET' },
    { value: 'CST', label: 'Computer Science & Technology', short: 'CST' },
    { value: 'ECE', label: 'Electronics & Communication Engineering', short: 'ECE' },
    { value: 'EEE', label: 'Electrical & Electronics Engineering', short: 'EEE' },
    { value: 'MECH', label: 'Mechanical Engineering', short: 'MECH' },
    { value: 'CIVIL', label: 'Civil Engineering', short: 'CIVIL' },
    { value: 'IT', label: 'Information Technology', short: 'IT' },
    { value: 'BSH', label: 'Basic Sciences & Humanities', short: 'BSH' },
    { value: 'MS', label: 'Management Studies', short: 'MS' },
    { value: 'MCA', label: 'Computer Applications', short: 'MCA' }
  ];

  // Year options based on your Excel sheet (III and IV)
  const years = [
    { value: 'III', label: 'Third Year' },
    { value: 'IV', label: 'Fourth Year' }
  ];

  // Section options based on your Excel sheet (A, B, C, D, E)
  const sections = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' },
    { value: 'E', label: 'Section E' }
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls)');
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
        const workbook = XLSX.read(data, { 
          type: 'array', 
          cellDates: true, 
          cellNF: false, 
          cellText: false 
        });
        
        console.log('Available sheets:', workbook.SheetNames);
        
        // Process first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          header: 1 
        });

        if (jsonData.length < 2) {
          alert('Excel file must have at least a header row and one data row');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        console.log('Headers:', headers);
        console.log('First few rows:', rows.slice(0, 3));

        // Map headers to our field names
        const headerMapping = {};
        headers.forEach((header, index) => {
          if (excelMapping[header]) {
            headerMapping[index] = excelMapping[header];
          }
        });

        console.log('Header mapping:', headerMapping);

        // Process rows
        const processedData = rows
          .filter(row => row.some(cell => cell !== '')) // Remove empty rows
          .map((row, index) => {
            const studentData = {};
            
            // Map data based on header mapping
            Object.entries(headerMapping).forEach(([colIndex, fieldName]) => {
              const value = row[parseInt(colIndex)] || '';
              studentData[fieldName] = value.toString().trim();
            });

            // Add metadata
            studentData.rowIndex = index + 2; // +2 because we skipped header and arrays are 0-indexed
            studentData.originalRow = row;

            return studentData;
          })
          .filter(student => student.rollNo && student.studentName); // Only include students with roll number and name

        console.log('Processed data:', processedData.slice(0, 3));

        if (processedData.length === 0) {
          alert('No valid student data found in the Excel file');
          return;
        }

        setData(processedData);
        setPreviewData(processedData.slice(0, 5));
        
        // Detect years and sections from the data
        detectYearsAndSections(processedData);
        
        setStep(2);
        
        // Auto-validate the data
        validateData(processedData);
        
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Failed to process the Excel file. Please check the file format.');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const validateData = (studentData) => {
    const validation = {};
    
    studentData.forEach((student, index) => {
      const errors = [];
      
      // Only required fields: Roll number and Student name
      if (!student.rollNo) errors.push('Roll number is required');
      if (!student.studentName) errors.push('Student name is required');
      
      // Roll number format validation (only if provided)
      if (student.rollNo && !/^[0-9A-Za-z]+$/.test(student.rollNo)) {
        errors.push('Roll number should contain only letters and numbers');
      }
      
      // Optional field validations (only if data is provided)
      
      // Mobile number validation (only if provided)
      if (student.studentMobile && student.studentMobile.trim() !== '' && !/^[0-9]{10}$/.test(student.studentMobile.replace(/\D/g, ''))) {
        errors.push('Student mobile should be 10 digits');
      }
      
      if (student.fatherMobile && student.fatherMobile.trim() !== '' && !/^[0-9]{10}$/.test(student.fatherMobile.replace(/\D/g, ''))) {
        errors.push('Father mobile should be 10 digits');
      }
      
      // Aadhaar validation removed - not present in your Excel format
      
      // Gender validation (only if provided)
      if (student.gender && student.gender.trim() !== '' && !['Male', 'Female', 'Other'].includes(student.gender)) {
        errors.push('Gender should be Male, Female, or Other');
      }
      
      // Quota validation (only if provided) - Updated to match your Excel format (CC, MG)
      if (student.quota && student.quota.trim() !== '' && !['CC', 'MG', 'COV', 'MGMT'].includes(student.quota)) {
        errors.push('Quota should be CC, MG, COV, or MGMT');
      }
      
      validation[index] = errors;
    });
    
    setValidationResults(validation);
    
    const totalErrors = Object.values(validation).flat().length;
    if (totalErrors > 0) {
      setErrors([`Found ${totalErrors} validation errors. Please review the data.`]);
    } else {
      setErrors([]);
    }
  };

  const generateEmail = (rollNo) => {
    // Clean roll number and convert to lowercase
    const cleanRollNo = rollNo.toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${cleanRollNo}@mits.ac.in`;
  };

  const generatePassword = (rollNo) => {
    // Default password for easy access
    return '123456';
  };

  const detectYearsAndSections = (studentData) => {
    // Extract unique years and sections from the data
    const years = [...new Set(studentData.map(student => student.year).filter(Boolean))];
    const sections = [...new Set(studentData.map(student => student.section).filter(Boolean))];
    
    // Sort years and sections
    years.sort();
    sections.sort();
    
    setDetectedYears(years);
    setDetectedSections(sections);
    
    // Auto-select first year and section if available
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0]);
    }
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0]);
    }
  };

  const createFirebaseAuth = async (studentData) => {
    try {
      const email = generateEmail(studentData.rollNo);
      const password = generatePassword(studentData.rollNo);
      
      // Check if user already exists
      const signInMethods = await fetchSignInMethodsForEmail(workerAuth, email);
      if (signInMethods.length > 0) {
        return { success: false, error: 'User already exists', uid: null };
      }
      
      // Create user with worker auth to avoid session switching
      const userCredential = await createUserWithEmailAndPassword(workerAuth, email, password);
      
      return { 
        success: true, 
        uid: userCredential.user.uid, 
        email, 
        password 
      };
    } catch (error) {
      console.error('Auth creation error:', error);
      return { 
        success: false, 
        error: error.message, 
        uid: null 
      };
    }
  };

  const handleImport = async () => {
    if (!selectedDepartment || !selectedYear || !selectedSection) {
      alert('Please select Department, Year, and Section');
      return;
    }

    if (data.length === 0) {
      alert('No data to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const stats = {
      total: data.length,
      success: 0,
      failed: 0,
      skipped: 0,
      authCreated: 0,
      authFailed: 0
    };

    try {
      let currentBatch = writeBatch(db);
      let batchCount = 0;

      for (let i = 0; i < data.length; i++) {
        const student = data[i];
        
        try {
          // Create Firebase Auth account
          const authResult = await createFirebaseAuth(student);
          
          if (authResult.success) {
            stats.authCreated++;
          } else {
            stats.authFailed++;
            console.warn(`Auth creation failed for ${student.rollNo}:`, authResult.error);
          }

                                // Prepare student document data
            const studentDoc = {
              // Basic Information
              rollNo: student.rollNo,
              studentName: student.studentName,
              quota: student.quota || '',
              gender: student.gender || '',
             
              // Contact Information
              studentMobile: student.studentMobile || '',
              fatherMobile: student.fatherMobile || '',
              fatherName: student.fatherName || '',
              motherName: student.motherName || '',
              permanentAddress: student.permanentAddress || '',
             
              // Academic Information
              department: selectedDepartment,
              year: selectedYear,
              section: selectedSection,
             
              // Authentication Information
              authUid: authResult.uid,
              email: authResult.email,
              password: authResult.password, // Note: This should be removed in production
             
              // Easy Access Information
              loginEmail: authResult.email,
              loginPassword: authResult.password,
              studentId: student.rollNo,
              fullName: student.studentName,
             
              // Profile Access
              profileUrl: `/student/profile/${authResult.uid}`,
              dashboardUrl: `/student/dashboard/${authResult.uid}`,
             
              // Metadata
              status: 'Active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              importedAt: serverTimestamp(),
              importSource: 'bulk_import',
              
              // Search and Filter Fields
              searchableName: student.studentName.toLowerCase(),
              searchableRollNo: student.rollNo.toLowerCase(),
              departmentCode: departments.find(d => d.value === selectedDepartment)?.short || 'UNK',
              yearSection: `${selectedYear}-${selectedSection}`,
              
              // Quick Access Fields
              displayName: student.studentName,
              shortName: student.studentName.split(' ').slice(0, 2).join(' '),
              initials: student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()
            };

          // Create document path
          const deptShort = departments.find(d => d.value === selectedDepartment)?.short || 'UNK';
          const sanitizedDept = deptShort.replace(/[^A-Z0-9_]/gi, '');
          const sanitizedYear = selectedYear.replace(/[^A-Z0-9]/gi, '');
          const sanitizedSection = selectedSection.replace(/[^A-Z0-9]/gi, '');
          const groupKey = `${sanitizedYear}-${sanitizedSection}`;
          
          // Use auth UID if available, otherwise use roll number
          const documentId = authResult.uid || student.rollNo;
          
          const studentRef = doc(db, `students/${sanitizedDept}/${groupKey}`, documentId);
          currentBatch.set(studentRef, studentDoc);

                     // Create reference in studentsByUid collection for easy lookup
           if (authResult.uid) {
             const byUidRef = doc(db, 'studentsByUid', authResult.uid);
             currentBatch.set(byUidRef, {
               authUid: authResult.uid,
               authEmail: authResult.email,
               loginEmail: authResult.email,
               loginPassword: authResult.password,
               department: selectedDepartment,
               year: selectedYear,
               section: selectedSection,
               rollNo: student.rollNo,
               studentName: student.studentName,
               fullName: student.studentName,
               primaryDocPath: `students/${sanitizedDept}/${groupKey}/${documentId}`,
               profileUrl: `/student/profile/${authResult.uid}`,
               dashboardUrl: `/student/dashboard/${authResult.uid}`,
               status: 'Active',
               updatedAt: serverTimestamp()
             }, { merge: true });
           }

          stats.success++;
          batchCount++;

          // Commit batch every 50 operations
          if (batchCount >= 50) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            batchCount = 0;
          }

        } catch (error) {
          console.error(`Error processing student ${student.rollNo}:`, error);
          stats.failed++;
        }

        // Update progress
        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);
        setImportStats(stats);
      }

      // Commit final batch
      if (batchCount > 0) {
        await currentBatch.commit();
      }

      setStep(4);
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
         const templateData = [
              {
          'S. NO': 1,
          'Roll. No': '23691A3201',
          'Student Name': 'MULLA ABDULKALAM',
          'Year': 'III',
          'Section': 'B',
          'Quota': 'CC',
          'Gender': 'Male',
          'Student Mobile': '',
          'Father Mobile': '',
          'Father Name': '',
          'Mother Name': '',
          'Permanent Address': ''
        },
              {
          'S. NO': 2,
          'Roll. No': '23691A3202',
          'Student Name': 'SHAIK ABUBAKAR SIDDIQ',
          'Year': 'IV',
          'Section': 'A',
          'Quota': 'MG',
          'Gender': 'Male',
          'Student Mobile': '',
          'Father Mobile': '',
          'Father Name': '',
          'Mother Name': '',
          'Permanent Address': ''
        }
     ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
         // Auto-size columns
     const colWidths = [
       { wch: 5 },   // S. NO
       { wch: 12 },  // Roll. No
       { wch: 25 },  // Student Name
       { wch: 8 },   // Year
       { wch: 8 },   // Section
       { wch: 8 },   // Quota
       { wch: 8 },   // Gender
       { wch: 12 },  // Student Mobile
       { wch: 12 },  // Father Mobile
       { wch: 25 },  // Father Name
       { wch: 25 },  // Mother Name
       { wch: 40 }   // Permanent Address
     ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faUpload} className="text-4xl text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Import Students</h2>
              <p className="text-gray-600">Upload your Excel file to import multiple students at once</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-6xl text-gray-400" />
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload Excel File
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      XLSX, XLS files only. Maximum 10MB
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download Template
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Configure Import Settings</h2>
              <span className="text-sm text-gray-500">{data.length} students found</span>
            </div>

                         {/* Department, Year, Section Selection */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Department *
                 </label>
                 <select
                   value={selectedDepartment}
                   onChange={(e) => setSelectedDepartment(e.target.value)}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="">Select Department</option>
                   {departments.map(dept => (
                     <option key={dept.value} value={dept.value}>
                       {dept.label}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Year * {detectedYears.length > 0 && <span className="text-green-600 text-xs">(Detected from Excel)</span>}
                 </label>
                 <select
                   value={selectedYear}
                   onChange={(e) => setSelectedYear(e.target.value)}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="">Select Year</option>
                   {detectedYears.length > 0 ? (
                     detectedYears.map(year => (
                       <option key={year} value={year}>
                         {year}
                       </option>
                     ))
                   ) : (
                     years.map(year => (
                       <option key={year.value} value={year.value}>
                         {year.label}
                       </option>
                     ))
                   )}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Section * {detectedSections.length > 0 && <span className="text-green-600 text-xs">(Detected from Excel)</span>}
                 </label>
                 <select
                   value={selectedSection}
                   onChange={(e) => setSelectedSection(e.target.value)}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="">Select Section</option>
                   {detectedSections.length > 0 ? (
                     detectedSections.map(section => (
                       <option key={section} value={section}>
                         {section}
                       </option>
                     ))
                   ) : (
                     sections.map(section => (
                       <option key={section.value} value={section.value}>
                         {section.label}
                       </option>
                     ))
                   )}
                 </select>
               </div>
                          </div>

             {/* Detected Year-Section Combinations */}
             {detectedYears.length > 0 && detectedSections.length > 0 && (
               <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                 <div className="flex items-center mb-3">
                   <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 mr-2" />
                   <h3 className="text-sm font-medium text-blue-800">Detected Year-Section Combinations</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {detectedYears.map(year => 
                     detectedSections.map(section => (
                       <span 
                         key={`${year}-${section}`}
                         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                           selectedYear === year && selectedSection === section
                             ? 'bg-blue-500 text-white'
                             : 'bg-blue-100 text-blue-800'
                         }`}
                       >
                         {year}-{section}
                       </span>
                     ))
                   )}
                 </div>
                 <p className="text-xs text-blue-600 mt-2">
                   The system detected these year-section combinations from your Excel file. 
                   Select the appropriate combination above.
                 </p>
               </div>
             )}

             {/* Data Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview (First 5 records)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Roll No
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Name
                       </th>
                       {detectedYears.length > 0 && (
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Year
                         </th>
                       )}
                       {detectedSections.length > 0 && (
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Section
                         </th>
                       )}
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Quota
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Gender
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Mobile
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Status
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((student, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentName}
                        </td>
                        {detectedYears.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.year}
                          </td>
                        )}
                        {detectedSections.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.section}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.quota}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentMobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {validationResults[index]?.length > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                              {validationResults[index].length} errors
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mt-1" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDepartment || !selectedYear || !selectedSection || errors.length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Import
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Import</h2>
              <p className="text-gray-600">Review the import settings before proceeding</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Import Settings</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="text-sm text-gray-900">{departments.find(d => d.value === selectedDepartment)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Year</dt>
                      <dd className="text-sm text-gray-900">{years.find(y => y.value === selectedYear)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Section</dt>
                      <dd className="text-sm text-gray-900">{sections.find(s => s.value === selectedSection)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                      <dd className="text-sm text-gray-900">{data.length}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What will be created</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faUser} className="text-green-500 mr-2" />
                      Firebase Authentication accounts
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2" />
                      Student email addresses
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faIdCard} className="text-purple-500 mr-2" />
                      Student documents in Firestore
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="text-orange-500 mr-2" />
                      Department/Year/Section structure
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                                     <div className="mt-2 text-sm text-yellow-700">
                     <ul className="list-disc pl-5 space-y-1">
                       <li>This will create Firebase Authentication accounts for all students</li>
                       <li>Student emails will be generated as: rollno@mits.ac.in</li>
                       <li>Default password for all students: 123456</li>
                       <li>Students can easily access their profile using roll number</li>
                       <li>Students can reset their passwords using their email</li>
                       <li>This action cannot be undone</li>
                     </ul>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  'Start Import'
                )}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Completed</h2>
              <p className="text-gray-600">The bulk import process has finished</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importStats.total}</div>
                  <div className="text-sm text-gray-500">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importStats.success}</div>
                  <div className="text-sm text-gray-500">Successfully Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importStats.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{importStats.authCreated}</div>
                  <div className="text-sm text-gray-500">Auth Accounts Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{importStats.authFailed}</div>
                  <div className="text-sm text-gray-500">Auth Creation Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{importStats.skipped}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                                     <div className="mt-2 text-sm text-blue-700">
                     <ul className="list-disc pl-5 space-y-1">
                       <li>Students can now log in using their email and default password</li>
                       <li>Email format: rollno@mits.ac.in</li>
                       <li>Default password: 123456</li>
                       <li>Students can access their profile easily using roll number</li>
                       <li>Students should change their password on first login</li>
                       <li>You can send password reset emails if needed</li>
                     </ul>
                   </div>
                </div>
              </div>
            </div>

                         <div className="flex justify-center space-x-3">
               <button
                 onClick={() => {
                   // Show first student's access card as example
                   const firstStudent = data[0];
                   if (firstStudent) {
                     setSelectedStudent({
                       ...firstStudent,
                       email: generateEmail(firstStudent.rollNo),
                       password: generatePassword(firstStudent.rollNo),
                       authUid: `example-${firstStudent.rollNo}`,
                       department: selectedDepartment,
                       year: selectedYear,
                       section: selectedSection
                     });
                     setShowAccessCard(true);
                   }
                 }}
                 className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
               >
                 View Student Access Card
               </button>
               <button
                 onClick={onClose}
                 className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
               >
                 Close
               </button>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Import Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {renderStep()}
          </div>
        </div>
      </div>

      {/* Student Access Card Modal */}
      {showAccessCard && selectedStudent && (
        <StudentAccessCard
          student={selectedStudent}
          onClose={() => {
            setShowAccessCard(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default EnhancedBulkImport;
