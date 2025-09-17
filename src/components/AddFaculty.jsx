import React, { useState } from "react";
import facultyApiService from '../services/facultyApiService';
import * as XLSX from "xlsx";

const AddFaculty = () => {
  // Department options (aligned with AddCourse)
  const departmentOptions = [
    "Civil Engineering",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Basic Sciences & Humanities",
    "Management Studies",
    "Computer Applications",
    "Computer Science & Engineering",
    "Computer Science & Engineering (Artificial Intelligence)",
    "Computer Science & Engineering (Cyber Security)",
    "Computer Science & Technology",
    "Computer Science & Engineering (Data Science)",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering (Networks)",
  ];

  // Short-form keys (aligned with AddCourse)
  const departmentKeyMap = {
    "Civil Engineering": "CE",
    "Electronics & Communication Engineering": "ECE",
    "Electrical & Electronics Engineering": "EEE",
    "Mechanical Engineering": "ME",
    "Basic Sciences & Humanities": "BSH",
    "Management Studies": "MS",
    "Computer Applications": "CA",
    "Computer Science & Engineering": "CSE",
    "Computer Science & Engineering (Artificial Intelligence)": "CSE_AI",
    "Computer Science & Engineering (Cyber Security)": "CSE_CS",
    "Computer Science & Technology": "CST",
    "Computer Science & Engineering (Data Science)": "CSE_DS",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)": "CSE_AIML",
    "Computer Science and Engineering (Networks)": "CSE_NW",
  };



  const toKey = (value) => {
    return String(value || "")
      .toUpperCase()
      .replace(/&/g, "AND")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const getDepartmentKey = (name) => departmentKeyMap[name] || toKey(name);




  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0
  });




  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please upload a valid Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '',
          header: [
            'apaar_faculty_id',
            'employee_id',
            'first_name',
            'last_name',
            'middle_name',
            'date_of_birth',
            'gender',
            'highest_degree',
            'highest_qualification',
            'university',
            'area_of_specialization',
            'specialization',
            'year_of_completion',
            'date_of_joining_institution',
            'date_of_joining',
            'designation_at_joining',
            'present_designation',
            'designation',
            'date_designated_as_professor',
            'employment_type',
            'status',
            'currently_associated',
            'nature_of_association',
            'contractual_full_time_part_time',
            'date_of_leaving',
            'experience_in_current_institute',
            'experience_years',
            'previous_institution',
            'department',
            'email',
            'phone_number',
            'alternate_phone',
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'postal_code',
            'country',
            'achievements',
            'research_interests',
            'is_head_of_department',
            'is_mentor',
            'mentor_for_grades',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'profile_picture',
            'bio',
            'notes',
            'pan_no'
          ]
        });

        // Remove header row if present and filter valid data
        const processedData = jsonData.filter(row => {
          return Object.values(row).some(value => value !== '');
        });

        if (processedData.length === 0) {
          alert('No valid data found in the Excel file.');
          return;
        }

        console.log('Sample row:', processedData[0]);
        setExcelData(processedData);
        alert(`Excel file processed successfully! Found ${processedData.length} valid entries.`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Failed to process the Excel file. Please check the format.');
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading Excel file:', error);
      alert('Failed to read the Excel file.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!selectedDepartment) {
      alert('Please select a department first.');
      return;
    }

    if (excelData.length === 0) {
      alert('No data to upload.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStats({
      total: excelData.length,
      success: 0,
      failed: 0,
      skipped: 0
    });

    try {
      const deptKey = getDepartmentKey(selectedDepartment);

      for (let i = 0; i < excelData.length; i++) {
        const faculty = excelData[i];
        
        // Skip rows without required fields
        if (!faculty.first_name || !faculty.email || faculty.first_name.trim() === '' || faculty.email.trim() === '') {
          setUploadStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
          continue;
        }

        try {
          // Clean and prepare faculty data for Django API
          const facultyData = {
            apaar_faculty_id: faculty.apaar_faculty_id?.trim() || '',
            employee_id: faculty.employee_id?.trim() || '',
            first_name: faculty.first_name.trim(),
            last_name: faculty.last_name?.trim() || '',
            middle_name: faculty.middle_name?.trim() || '',
            date_of_birth: faculty.date_of_birth?.trim() || '',
            gender: faculty.gender?.trim() || 'M',
            highest_degree: faculty.highest_degree?.trim() || '',
            highest_qualification: faculty.highest_qualification?.trim() || '',
            university: faculty.university?.trim() || '',
            area_of_specialization: faculty.area_of_specialization?.trim() || '',
            specialization: faculty.specialization?.trim() || '',
            year_of_completion: faculty.year_of_completion?.trim() || '',
            date_of_joining_institution: faculty.date_of_joining_institution?.trim() || '',
            date_of_joining: faculty.date_of_joining?.trim() || '',
            designation_at_joining: faculty.designation_at_joining?.trim() || 'LECTURER',
            present_designation: faculty.present_designation?.trim() || 'LECTURER',
            designation: faculty.designation?.trim() || 'LECTURER',
            date_designated_as_professor: faculty.date_designated_as_professor?.trim() || '',
            employment_type: faculty.employment_type?.trim() || 'FULL_TIME',
            status: faculty.status?.trim() || 'ACTIVE',
            currently_associated: faculty.currently_associated?.trim() || 'Y',
            nature_of_association: faculty.nature_of_association?.trim() || 'REGULAR',
            contractual_full_time_part_time: faculty.contractual_full_time_part_time?.trim() || '',
            date_of_leaving: faculty.date_of_leaving?.trim() || '',
            experience_in_current_institute: faculty.experience_in_current_institute?.trim() || '0',
            experience_years: faculty.experience_years?.trim() || '0',
            previous_institution: faculty.previous_institution?.trim() || '',
            department: selectedDepartment,
            email: faculty.email.trim(),
            phone_number: faculty.phone_number?.trim() || '',
            alternate_phone: faculty.alternate_phone?.trim() || '',
            address_line_1: faculty.address_line_1?.trim() || '',
            address_line_2: faculty.address_line_2?.trim() || '',
            city: faculty.city?.trim() || '',
            state: faculty.state?.trim() || '',
            postal_code: faculty.postal_code?.trim() || '',
            country: faculty.country?.trim() || 'India',
            achievements: faculty.achievements?.trim() || '',
            research_interests: faculty.research_interests?.trim() || '',
            is_head_of_department: faculty.is_head_of_department?.trim() || 'N',
            is_mentor: faculty.is_mentor?.trim() || 'N',
            mentor_for_grades: faculty.mentor_for_grades?.trim() || '',
            emergency_contact_name: faculty.emergency_contact_name?.trim() || '',
            emergency_contact_phone: faculty.emergency_contact_phone?.trim() || '',
            emergency_contact_relationship: faculty.emergency_contact_relationship?.trim() || '',
            profile_picture: faculty.profile_picture?.trim() || '',
            bio: faculty.bio?.trim() || '',
            notes: faculty.notes?.trim() || '',
            pan_no: faculty.pan_no?.trim() || ''
          };

          // Create faculty using Django API
          await facultyApiService.createFaculty(facultyData);
          setUploadStats(prev => ({ ...prev, success: prev.success + 1 }));

        } catch (error) {
          console.error(`Error processing faculty ${faculty.name}:`, error);
          setUploadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }

        // Update progress
        setUploadProgress(((i + 1) / excelData.length) * 100);
      }

      alert(`Upload complete!\nSuccessfully added: ${uploadStats.success}\nFailed: ${uploadStats.failed}\nSkipped entries: ${uploadStats.skipped}`);
      setExcelData([]);
    } catch (error) {
      console.error('Error uploading faculty data:', error);
      alert('Failed to upload faculty data. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">Bulk Faculty Upload</h1>
          <p className="text-blue-100 mt-1">Upload faculty data via Excel file using Django API</p>
        </div>

        {/* Department selection */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select Department --</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {!selectedDepartment && (
            <p className="text-sm text-gray-500 mt-2">Please select a department to enable adding or uploading faculty.</p>
          )}
        </div>


        {/* Bulk Upload Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Faculty Upload</h2>
          
          {/* Excel Format Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Excel File Format Requirements:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Required Fields:</strong> apaar_faculty_id, employee_id, first_name, last_name, date_of_birth, gender, email, phone_number, department</p>
              <p><strong>Gender:</strong> M (Male), F (Female), O (Other)</p>
              <p><strong>Status:</strong> ACTIVE, INACTIVE, ON_LEAVE, RETIRED, TERMINATED</p>
              <p><strong>Employment Type:</strong> FULL_TIME, PART_TIME, CONTRACT, VISITING, ADJUNCT</p>
              <p><strong>Designation:</strong> PROFESSOR, ASSOCIATE_PROFESSOR, ASSISTANT_PROFESSOR, LECTURER, INSTRUCTOR, etc.</p>
              <p><strong>Date Format:</strong> YYYY-MM-DD (e.g., 2023-01-15)</p>
            </div>
          </div>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={!selectedDepartment || loading}
            />
            {excelData.length > 0 && (
              <p className="text-sm text-green-600 mt-2">✓ {excelData.length} entries ready for upload</p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Success: {uploadStats.success} | Failed: {uploadStats.failed} | Skipped: {uploadStats.skipped}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={excelData.length === 0 || !selectedDepartment || loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              excelData.length === 0 || !selectedDepartment || loading
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            }`}
          >
            {loading ? "Uploading..." : `Upload ${excelData.length} Faculty Members`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;