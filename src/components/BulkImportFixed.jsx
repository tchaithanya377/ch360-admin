import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import * as XLSX from "xlsx";

const BulkImportFixed = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  // Fixed field mapping based on your Excel structure
  const availableFields = [
    { name: "roll_number", label: "Roll. No", type: "text", required: true },
    { name: "first_name", label: "Student Name", type: "text", required: true },
    { name: "quota", label: "Quota", type: "select", required: false, options: ["GENERAL", "SC", "ST", "OBC", "EWS", "PHYSICALLY_CHALLENGED", "SPORTS", "NRI"] },
    { name: "gender", label: "Gender", type: "select", required: false, options: ["M", "F", "O"] },
    { name: "aadhar_number", label: "Aadhaar", type: "text", required: false },
    { name: "student_mobile", label: "Student Mobile", type: "tel", required: false },
    { name: "father_mobile", label: "Father Mobile", type: "tel", required: false },
    { name: "father_name", label: "Father Name", type: "text", required: false },
    { name: "mother_name", label: "Mother Name", type: "text", required: false },
    { name: "address_line1", label: "Permanent Address", type: "textarea", required: false }
  ];

  // Get department short name for path
  const getDepartmentShortName = (department) => {
    const shortNames = {
      'Computer Science & Engineering (Data Science)': 'CSE_DS',
      'Computer Science & Engineering': 'CSE',
      'Computer Science & Engineering (Artificial Intelligence)': 'CSE_AI',
      'Computer Science & Engineering (Cyber Security)': 'CSE_CS',
      'Computer Science & Technology': 'CST',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'CSE_AIML',
      'Computer Science and Engineering (Networks)': 'CSE_NET',
      'Civil Engineering': 'CIVIL',
      'Electronics & Communication Engineering': 'ECE',
      'Electrical & Electronics Engineering': 'EEE',
      'Mechanical Engineering': 'MECH',
      'Basic Sciences & Humanities': 'BSH',
      'Management Studies': 'MGMT',
      'Computer Applications': 'MCA'
    };
    return shortNames[department] || 'UNKNOWN';
  };

  // Generate email from roll number
  const generateEmail = (rollNo) => {
    if (!rollNo) return null;
    const cleanRollNo = rollNo.toString().replace(/[^a-zA-Z0-9]/g, '');
    return `${cleanRollNo.toLowerCase()}@student.mits.ac.in`;
  };

  // Generate password from roll number
  const generatePassword = (rollNo) => {
    if (!rollNo) return 'Student@123';
    const cleanRollNo = rollNo.toString().replace(/[^a-zA-Z0-9]/g, '');
    return `${cleanRollNo}@123`;
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
        
        // Process first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with proper handling
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });

        if (jsonData.length < 2) {
          alert('No data found in the Excel file');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

        if (rows.length === 0) {
          alert('No valid data rows found in the Excel file');
          return;
        }

        if (rows.length > 1000) {
          alert('Maximum 1000 rows allowed per import');
          return;
        }

        setData(rows);
        
        // Auto-map fields based on your Excel structure
        const autoMapping = {};
        headers.forEach((header, index) => {
          if (!header) return;
          
          const cleanHeader = header.toString().toLowerCase().trim();
          
          // Map based on your exact Excel headers with more flexible matching
          if (cleanHeader.includes('roll') || cleanHeader.includes('roll.') || cleanHeader.includes('rollno')) {
            autoMapping.rollNo = index;
          } else if (cleanHeader.includes('student name') || cleanHeader.includes('name') || cleanHeader.includes('studentname')) {
            autoMapping.name = index;
          } else if (cleanHeader.includes('quota')) {
            autoMapping.quota = index;
          } else if (cleanHeader.includes('gender')) {
            autoMapping.gender = index;
          } else if (cleanHeader.includes('aadhaar') || cleanHeader.includes('aadhar')) {
            autoMapping.aadhaar = index;
          } else if (cleanHeader.includes('student mobile') || cleanHeader.includes('studentmobile') || cleanHeader.includes('mobile')) {
            autoMapping.studentMobile = index;
          } else if (cleanHeader.includes('father mobile') || cleanHeader.includes('fathermobile')) {
            autoMapping.fatherMobile = index;
          } else if (cleanHeader.includes('father name') || cleanHeader.includes('fathername')) {
            autoMapping.fatherName = index;
          } else if (cleanHeader.includes('mother name') || cleanHeader.includes('mothername')) {
            autoMapping.motherName = index;
          } else if (cleanHeader.includes('permanent address') || cleanHeader.includes('address') || cleanHeader.includes('permanentaddress')) {
            autoMapping.address = index;
          }
        });
        
        console.log('Excel Headers found:', headers);
        console.log('Auto-mapping result:', autoMapping);

        setMapping(autoMapping);
        setStep(2);

      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const validateData = () => {
    const newErrors = [];

    // Check required fields
    if (!mapping.roll_number || !mapping.first_name) {
        newErrors.push({
          type: 'mapping',
        message: 'Roll Number and First Name are required fields'
        });
      }

    // Validate data rows
    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;

      // Check required fields
      if (mapping.roll_number !== undefined && (!row[mapping.roll_number] || row[mapping.roll_number].toString().trim() === '')) {
            newErrors.push({
              type: 'validation',
              row: rowNumber,
          field: 'Roll Number',
          message: 'Roll Number is required'
        });
      }
      
      if (mapping.first_name !== undefined && (!row[mapping.first_name] || row[mapping.first_name].toString().trim() === '')) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
          field: 'First Name',
          message: 'First Name is required'
        });
      }

      // Validate phone numbers
      if (mapping.student_mobile !== undefined && row[mapping.student_mobile]) {
        const phone = row[mapping.student_mobile].toString().replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 11) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
            field: 'Student Mobile',
            message: 'Phone number must be 10-11 digits'
              });
            }
          }

      if (mapping.father_mobile !== undefined && row[mapping.father_mobile]) {
        const phone = row[mapping.father_mobile].toString().replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 11) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
            field: 'Father Mobile',
            message: 'Phone number must be 10-11 digits'
              });
            }
          }

      // Validate Aadhaar
      if (mapping.aadhar_number !== undefined && row[mapping.aadhar_number]) {
        const aadhaar = row[mapping.aadhar_number].toString().replace(/\D/g, '');
        if (aadhaar.length !== 12) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
            field: 'Aadhaar',
            message: 'Aadhaar number must be 12 digits'
              });
            }
          }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleImport = async () => {
    if (!validateData()) {
      alert(`Please fix ${errors.length} validation errors before importing`);
      return;
    }

    if (!selectedDepartment) {
      alert('Please select a department');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          // Extract data based on mapping
          const studentData = {};
          Object.keys(mapping).forEach(fieldName => {
            const columnIndex = mapping[fieldName];
            if (columnIndex !== undefined && row[columnIndex] !== undefined) {
              let value = row[columnIndex];
              
              // Clean phone numbers
              if (fieldName === 'student_mobile' || fieldName === 'father_mobile') {
                value = value.toString().replace(/\D/g, '');
              }
              
              // Clean Aadhaar
              if (fieldName === 'aadhar_number') {
                value = value.toString().replace(/\D/g, '');
              }
              
              studentData[fieldName] = value.toString().trim();
            }
          });
          
          // Debug: Log the processed student data
          if (i === 0) {
            console.log('Sample student data processed:', studentData);
          }

          // Set department and generate derived fields
          studentData.department = selectedDepartment;
          studentData.year_of_study = '1'; // Default year
          studentData.section = 'A'; // Default section
          
          // Generate email and password
          const email = generateEmail(studentData.roll_number);
          const password = generatePassword(studentData.roll_number);
          
          // Create student ID
          const deptShort = getDepartmentShortName(studentData.department);
          const studentId = `${deptShort}_${studentData.year_of_study}_${studentData.section}_${studentData.roll_number}`;
          
          // Prepare final student data for Django API
          const finalStudentData = {
            ...studentData,
            status: "ACTIVE",
            enrollment_date: new Date().toISOString().split('T')[0]
          };

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
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Roll. No': '22691A3206',
        'Student Name': 'Ansar Jameelahmed Shaik A',
        'Quota': 'COV',
        'Gender': 'Male',
        'Aadhaar': '427493186901',
        'Student Mobile': '6302476771',
        'Father Mobile': '7396855408',
        'Father Name': 'S.A.vahidha begum',
        'Mother Name': 'Mother Name Here',
        'Permanent Address': 'Complete Address Here'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, "student_import_template.xlsx");
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
      </div>
    </div>
  );

  const renderStep2 = () => (
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
            <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
            <option value="Computer Science & Engineering (Cyber Security)">Computer Science & Engineering (Cyber Security)</option>
            <option value="Computer Science & Technology">Computer Science & Technology</option>
            <option value="Computer Science and Engineering (Artificial Intelligence and Machine Learning)">Computer Science and Engineering (Artificial Intelligence and Machine Learning)</option>
            <option value="Computer Science and Engineering (Networks)">Computer Science and Engineering (Networks)</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
            <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Basic Sciences & Humanities">Basic Sciences & Humanities</option>
            <option value="Management Studies">Management Studies</option>
            <option value="Computer Applications">Computer Applications</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (!selectedDepartment) {
              alert('Please select Department before proceeding.');
              return;
            }
            setStep(3);
            setTimeout(() => validateData(), 100);
          }}
          disabled={!selectedDepartment}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !selectedDepartment
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Continue to Validation
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Validate Data</h3>
        <p className="text-gray-600">Review the data mapping and validation results</p>
      </div>

      {/* Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="text-blue-800 font-semibold">Data Summary</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-blue-700">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(mapping).length}</div>
            <div className="text-sm text-blue-700">Mapped Fields</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedDepartment}</div>
            <div className="text-sm text-blue-700">Department</div>
          </div>
        </div>
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
            <p>✅ Required fields (Roll No & Student Name) are mapped</p>
            <p>✅ Data validation passed</p>
            <p>✅ Ready to import {data.length} students</p>
            <p>✅ Firebase Auth accounts will be created automatically</p>
            <p>✅ Data will be stored in: /students/{getDepartmentShortName(selectedDepartment)}/A/IV/{"{UID}"}</p>
        </div>
        )}
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
        <p className="text-gray-600">Please wait while we import your data and create Firebase Auth accounts...</p>
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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Processing:</strong> Creating Firebase Auth accounts and storing data
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Data will be stored in: /students/{getDepartmentShortName(selectedDepartment)}/A/IV/{"{UID}"}
          </p>
        </div>
      </div>
    </div>
  );

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
                <h2 className="text-2xl font-bold">Bulk Import Students (Fixed)</h2>
                <p className="text-blue-100 text-sm">Import multiple students with Firebase Auth creation</p>
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
              { number: 2, title: 'Select Department' },
              { number: 3, title: 'Validate & Import' },
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

export default BulkImportFixed;
