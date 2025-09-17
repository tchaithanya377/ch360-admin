import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import * as XLSX from "xlsx";

const AddStudent = () => {
  const [studentData, setStudentData] = useState({
    admissionNumber: "",
    name: "",
    quota: "",
    gender: "",
    aadhaar: "",
    studentMobile: "",
    fatherMobile: "",
    fatherName: "",
    motherName: "",
    address: "",
    // Additional fields for comprehensive student management
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyContactRelation: "",
    email: "",
    alternateEmail: "",
    parentEmail: "",
    admissionDate: "",
    program: "",
    department: "",
    academicYear: "",
    semester: "",
    branch: "",
    category: "",
    religion: "",
    nationality: "",
    stateOfOrigin: "",
    district: "",
    pincode: "",
    guardianName: "",
    guardianMobile: "",
    guardianEmail: "",
    guardianAddress: "",
    guardianRelation: "",
    previousInstitution: "",
    previousPercentage: "",
    entranceExam: "",
    entranceRank: "",
    scholarship: "",
    hostelRequired: "",
    transportRequired: "",
    // Fee Management Fields
    feeStructure: "",
    totalFee: "",
    paidAmount: "",
    remainingAmount: "",
    paymentMethod: "",
    paymentStatus: "",
    feeDueDate: "",
    installmentPlan: "",
    discountApplied: "",
    discountReason: "",
    // KYC Verification Fields
    aadhaarVerified: "",
    aadhaarVerificationDate: "",
    panCardVerified: "",
    panCardVerificationDate: "",
    addressProofVerified: "",
    addressProofVerificationDate: "",
    incomeCertificateVerified: "",
    incomeCertificateVerificationDate: "",
    casteCertificateVerified: "",
    casteCertificateVerificationDate: "",
    transferCertificateVerified: "",
    transferCertificateVerificationDate: "",
    tenthMarksheetVerified: "",
    tenthMarksheetVerificationDate: "",
    interMarksheetVerified: "",
    interMarksheetVerificationDate: "",
    photoVerified: "",
    photoVerificationDate: "",
    kycStatus: "Pending",
    kycRemarks: "",
    // Document Upload Fields
    aadhaarDocument: "",
    panCardDocument: "",
    addressProofDocument: "",
    incomeCertificateDocument: "",
    casteCertificateDocument: "",
    transferCertificateDocument: "",
    tenthMarksheetDocument: "",
    interMarksheetDocument: "",
    studentPhoto: "",
    // Additional fields
    photoURL: "",
    documents: [],
    status: "Active",
    remarks: ""
  });

  const [excelData, setExcelData] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formMode, setFormMode] = useState("single"); // "single" or "bulk"
  const [previewData, setPreviewData] = useState(null);



  // Auto-fill branch when department changes
  useEffect(() => {
    if (studentData.department) {
      setStudentData(prev => ({
        ...prev,
        branch: studentData.department
      }));
    }
  }, [studentData.department]);

  // Form steps configuration
  const formSteps = [
    { id: 1, title: "Basic Information", fields: ["admissionNumber", "name", "gender", "dateOfBirth", "bloodGroup", "email", "studentMobile"] },
    { id: 2, title: "Academic Details", fields: ["program", "department", "academicYear", "semester", "branch", "year", "section", "admissionDate", "previousInstitution", "previousPercentage"] },
    { id: 3, title: "Family Information", fields: ["fatherName", "fatherMobile", "motherName", "parentEmail", "guardianName", "guardianMobile", "guardianEmail", "guardianRelation"] },
    { id: 4, title: "Address & Contact", fields: ["address", "stateOfOrigin", "district", "pincode", "emergencyContact", "emergencyContactRelation", "alternateEmail"] },
    { id: 5, title: "Additional Details", fields: ["category", "religion", "nationality", "quota", "entranceExam", "entranceRank", "scholarship"] },
    { id: 6, title: "Preferences", fields: ["hostelRequired", "transportRequired"] },
    { id: 7, title: "Fee Management", fields: ["feeStructure", "totalFee", "paidAmount", "paymentMethod", "paymentStatus", "feeDueDate", "installmentPlan", "discountApplied", "discountReason"] },
    { id: 8, title: "KYC Verification", fields: ["aadhaarVerified", "panCardVerified", "addressProofVerified", "incomeCertificateVerified", "casteCertificateVerified", "transferCertificateVerified", "tenthMarksheetVerified", "interMarksheetVerified", "photoVerified", "kycStatus", "kycRemarks"] },
    { id: 9, title: "Review & Submit", fields: [] }
  ];

  // Validation rules
  const validationRules = {
    admissionNumber: { required: true, pattern: /^[A-Z0-9]+$/, message: "Admission number must contain only letters and numbers" },
    name: { required: true, minLength: 2, message: "Name must be at least 2 characters long" },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
    studentMobile: { required: true, pattern: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number" },
    aadhaar: { pattern: /^[0-9]{12}$/, message: "Aadhaar number must be 12 digits" },
    fatherMobile: { pattern: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number" },
    guardianMobile: { pattern: /^[6-9]\d{9}$/, message: "Please enter a valid 10-digit mobile number" },
    pincode: { pattern: /^[0-9]{6}$/, message: "Pincode must be 6 digits" }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePopup = (message, type = "info") => {
    setPopupMessage(message);
    setIsPopupVisible(true);
    setTimeout(() => setIsPopupVisible(false), 4000);
  };

  // Validate field
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required && !value) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.message;
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.message;
    }

    return "";
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => {
      const newData = { ...prevData, [name]: value };
      
      // Auto-calculate remaining amount
      if (name === 'totalFee' || name === 'paidAmount') {
        const totalFee = parseFloat(newData.totalFee) || 0;
        const paidAmount = parseFloat(newData.paidAmount) || 0;
        const remainingAmount = Math.max(0, totalFee - paidAmount);
        newData.remainingAmount = remainingAmount.toString();
        
        // Auto-update payment status
        if (totalFee > 0) {
          if (paidAmount >= totalFee) {
            newData.paymentStatus = 'Paid';
          } else if (paidAmount > 0) {
            newData.paymentStatus = 'Partial';
          } else {
            newData.paymentStatus = 'Pending';
          }
        }
      }
      
      return newData;
    });
    
    // Validate field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const stepFields = formSteps.find(s => s.id === step)?.fields || [];
    const newErrors = {};
    
    stepFields.forEach(field => {
      const error = validateField(field, studentData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Generate email from admission number
  const generateEmail = (admissionNumber) => {
    return `${admissionNumber.replace(/\s+/g, "")}@mits.ac.in`.toLowerCase();
  };

  // Create student account (without authentication)
  const createStudentAccount = async (student, year, section) => {
    const email = generateEmail(student.admissionNumber);

    try {
      // Check for existing student
      const existingQuery = query(
        collection(db, `students/${year}/${section}`),
        where("admissionNumber", "==", student.admissionNumber)
      );
      const querySnapshot = await getDocs(existingQuery);

      if (!querySnapshot.empty) {
        throw new Error(`Student with admission number ${student.admissionNumber} already exists`);
      }

      // Generate unique ID for the student
      const studentId = `${year}_${section}_${student.admissionNumber}`;

      // Prepare student data with metadata
      const studentRecord = {
        ...student,
        email,
        studentId,
        year,
        section,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "Active",
        academicStatus: "Enrolled",
        profileComplete: true
      };

      // Store in Firestore
      const sectionRef = collection(db, `students/${year}/${section}`);
      await setDoc(doc(sectionRef, studentId), studentRecord);

      // Create audit log
      await addDoc(collection(db, "auditLogs"), {
        action: "STUDENT_CREATED",
        studentId: studentId,
        admissionNumber: student.admissionNumber,
        studentName: student.name,
        year,
        section,
        timestamp: serverTimestamp(),
        adminId: "system"
      });

      return { success: true, studentId, email };
    } catch (error) {
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Final validation
      if (!validateStep(currentStep)) {
        handlePopup("Please fix the errors before submitting.", "error");
        return;
      }

      const studentDataWithMetadata = {
        ...studentData,
        email: generateEmail(studentData.admissionNumber)
      };

      await createStudentAccount(studentDataWithMetadata, studentData.year, studentData.section);
      
      handlePopup("Student added successfully! Admission number and email generated.", "success");
      
      // Reset form
      setStudentData({
        admissionNumber: "", name: "", quota: "", gender: "", aadhaar: "", studentMobile: "",
        fatherMobile: "", fatherName: "", motherName: "", address: "", dateOfBirth: "",
        bloodGroup: "", emergencyContact: "", emergencyContactRelation: "", email: "",
        alternateEmail: "", parentEmail: "", admissionDate: "", program: "", department: "", academicYear: "",
        semester: "", branch: "", category: "", religion: "", nationality: "",
        stateOfOrigin: "", district: "", pincode: "", guardianName: "", guardianMobile: "",
        guardianEmail: "", guardianAddress: "", guardianRelation: "", previousInstitution: "",
        previousPercentage: "", entranceExam: "", entranceRank: "", scholarship: "",
        hostelRequired: "", transportRequired: "", 
        // Fee Management Fields
        feeStructure: "", totalFee: "", paidAmount: "", remainingAmount: "", paymentMethod: "",
        paymentStatus: "", feeDueDate: "", installmentPlan: "", discountApplied: "", discountReason: "",
        // KYC Verification Fields
        aadhaarVerified: "", aadhaarVerificationDate: "", panCardVerified: "", panCardVerificationDate: "",
        addressProofVerified: "", addressProofVerificationDate: "", incomeCertificateVerified: "",
        incomeCertificateVerificationDate: "", casteCertificateVerified: "", casteCertificateVerificationDate: "",
        transferCertificateVerified: "", transferCertificateVerificationDate: "", tenthMarksheetVerified: "",
        tenthMarksheetVerificationDate: "", interMarksheetVerified: "", interMarksheetVerificationDate: "",
        photoVerified: "", photoVerificationDate: "", kycStatus: "Pending", kycRemarks: "",
        // Document Upload Fields
        aadhaarDocument: "", panCardDocument: "", addressProofDocument: "", incomeCertificateDocument: "",
        casteCertificateDocument: "", transferCertificateDocument: "", tenthMarksheetDocument: "",
        interMarksheetDocument: "", studentPhoto: "",
        // Additional fields
        photoURL: "", documents: [], status: "Active", remarks: ""
      });
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      console.error("Error adding student:", error);
      handlePopup(`Failed to add student: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Excel upload with validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      handlePopup("Please upload a valid Excel file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const allData = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const standardizedData = jsonData.map((row) => ({
            admissionNumber: row["Admission Number"] || row["Admission No"] || row["Roll No"] || row["RollNo"] || row["Roll Number"] || "",
            name: row["Student Name"] || row["Name"] || row["Full Name"] || "",
            quota: row["Quota"] || row["Category"] || "",
          gender: row["Gender"] || "",
            aadhaar: row["Aadhaar"] || row["Aadhaar Number"] || "",
            studentMobile: row["Student Mobile"] || row["Mobile"] || row["Phone"] || "",
            fatherMobile: row["Father Mobile"] || row["Father Phone"] || "",
            fatherName: row["Father Name"] || row["Father"] || "",
            motherName: row["Mother Name"] || row["Mother"] || "",
            address: row["Address"] || row["Permanent Address"] || "",
            dateOfBirth: row["Date of Birth"] || row["DOB"] || "",
            bloodGroup: row["Blood Group"] || row["Blood"] || "",
            email: row["Email"] || "",
            program: row["Program"] || row["Course"] || "",
            department: row["Department"] || row["Dept"] || "",
            academicYear: row["Academic Year"] || row["Year"] || "",
            semester: row["Semester"] || "",
            branch: row["Branch"] || row["Department"] || "",
            category: row["Category"] || row["Caste"] || "",
            religion: row["Religion"] || "",
            nationality: row["Nationality"] || "Indian",
            stateOfOrigin: row["State"] || row["State of Origin"] || "",
            district: row["District"] || "",
            pincode: row["Pincode"] || row["PIN"] || "",
            guardianName: row["Guardian Name"] || row["Guardian"] || "",
            guardianMobile: row["Guardian Mobile"] || row["Guardian Phone"] || "",
            guardianEmail: row["Guardian Email"] || "",
            previousInstitution: row["Previous Institution"] || row["School"] || "",
            previousPercentage: row["Previous Percentage"] || row["Percentage"] || "",
            entranceExam: row["Entrance Exam"] || row["Exam"] || "",
            entranceRank: row["Entrance Rank"] || row["Rank"] || "",
            scholarship: row["Scholarship"] || "",
            hostelRequired: row["Hostel Required"] || row["Hostel"] || "",
            transportRequired: row["Transport Required"] || row["Transport"] || "",
            medicalConditions: row["Medical Conditions"] || row["Medical"] || "",
            allergies: row["Allergies"] || "",
            specialNeeds: row["Special Needs"] || "",
            achievements: row["Achievements"] || "",
            hobbies: row["Hobbies"] || "",
            languages: row["Languages"] || "",
            remarks: row["Remarks"] || row["Notes"] || ""
          }));

          // Extract year and section from sheet name
          const matches = sheetName.match(/^([A-Za-z0-9]+)\s*([A-Za-z]+)$/);
        const year = matches && matches[1] ? matches[1].toUpperCase() : "UNKNOWN_YEAR";
        const section = matches && matches[2] ? matches[2].toUpperCase() : "UNKNOWN_SECTION";

        standardizedData.forEach((row) => {
                     if (row.admissionNumber && row.name) {
            allData.push({
              ...row,
              Year: year,
              Section: section,
               admissionNumber: row.admissionNumber.toString().replace(/\s+/g, ""),
               email: row.email || generateEmail(row.admissionNumber),
              password: "Mits@1234",
                status: "Active"
            });
          }
        });
      });

      if (allData.length === 0) {
          handlePopup("No valid data found in the uploaded Excel file.", "error");
        return;
      }

      setExcelData(allData);
        setPreviewData(allData.slice(0, 5)); // Show first 5 records as preview
        handlePopup(`Excel file processed successfully! Found ${allData.length} students.`, "success");
      } catch (error) {
        console.error("Error processing Excel file:", error);
        handlePopup("Failed to process the Excel file. Please check the file format.", "error");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Bulk upload with progress tracking
  const handleBulkUpload = async () => {
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < excelData.length; i++) {
        try {
          const student = excelData[i];
          await createStudentAccount(student, student.year, student.section);
          successCount++;
          handlePopup(`Progress: ${i + 1}/${excelData.length} students processed`, "info");
        } catch (error) {
          errorCount++;
          console.error(`Error processing student ${student.admissionNumber}:`, error);
        }
        await delay(300); // Rate limiting
      }

      handlePopup(`Bulk upload completed! Success: ${successCount}, Errors: ${errorCount}`, "success");
      setExcelData([]);
      setPreviewData(null);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      handlePopup("Failed to complete bulk upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Get current step fields
  const getCurrentStepFields = () => {
    const currentStepData = formSteps.find(step => step.id === currentStep);
    return currentStepData ? currentStepData.fields : [];
  };

  // Render field based on type
  const renderField = (fieldName) => {
    const fieldValue = studentData[fieldName];
    const fieldError = errors[fieldName];

    switch (fieldName) {
      case "gender":
  return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        );

      case "bloodGroup":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        );

      case "dateOfBirth":
      case "admissionDate":
        return (
          <input
            type="date"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "email":
      case "alternateEmail":
      case "parentEmail":
      case "guardianEmail":
        return (
          <input
            type="email"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "studentMobile":
      case "fatherMobile":
      case "guardianMobile":
      case "emergencyContact":
        return (
          <input
            type="tel"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "aadhaar":
        return (
          <input
            type="text"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength="12"
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "admissionNumber":
        return (
          <input
            type="text"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder="Enter admission number"
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "pincode":
        return (
          <input
            type="text"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder="Enter 6-digit pincode"
            maxLength="6"
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "address":
      case "guardianAddress":
      case "medicalConditions":
      case "allergies":
      case "specialNeeds":
      case "achievements":
      case "hobbies":
      case "languages":
      case "remarks":
        return (
          <textarea
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            rows="3"
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "hostelRequired":
      case "transportRequired":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );

      case "feeStructure":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Fee Structure</option>
            <option value="Regular">Regular Fee</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Merit">Merit Based</option>
            <option value="Sports">Sports Quota</option>
            <option value="Management">Management Quota</option>
            <option value="NRI">NRI Quota</option>
          </select>
        );

      case "totalFee":
      case "paidAmount":
      case "remainingAmount":
      case "discountApplied":
        return (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </span>
            <input
              type="number"
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
              className={`mt-1 block w-full pl-8 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
        );

      case "paymentMethod":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online Transfer">Online Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        );

      case "paymentStatus":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Payment Status</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partially Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Overdue">Payment Overdue</option>
          </select>
        );

      case "installmentPlan":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Installment Plan</option>
            <option value="Full Payment">Full Payment</option>
            <option value="2 Installments">2 Installments</option>
            <option value="3 Installments">3 Installments</option>
            <option value="4 Installments">4 Installments</option>
            <option value="6 Installments">6 Installments</option>
            <option value="Monthly">Monthly</option>
          </select>
        );

      case "feeDueDate":
        return (
          <input
            type="date"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "discountReason":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Discount Reason</option>
            <option value="Merit Based">Merit Based</option>
            <option value="Sports Quota">Sports Quota</option>
            <option value="Sibling Discount">Sibling Discount</option>
            <option value="Staff Child">Staff Child</option>
            <option value="Alumni Child">Alumni Child</option>
            <option value="Financial Need">Financial Need</option>
            <option value="Other">Other</option>
          </select>
        );

      // KYC Verification Fields
      case "aadhaarVerified":
      case "panCardVerified":
      case "addressProofVerified":
      case "incomeCertificateVerified":
      case "casteCertificateVerified":
      case "transferCertificateVerified":
      case "tenthMarksheetVerified":
      case "interMarksheetVerified":
      case "photoVerified":
        return (
          <div className="space-y-2">
            <select
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Verification Status</option>
              <option value="Verified">✓ Verified</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Rejected">✗ Rejected</option>
              <option value="Not Required">- Not Required</option>
            </select>
            <input
              type="date"
              name={`${fieldName.replace('Verified', 'VerificationDate')}`}
              value={studentData[`${fieldName.replace('Verified', 'VerificationDate')}`] || ""}
              onChange={handleChange}
              placeholder="Verification Date"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case "kycStatus":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="Pending">⏳ Pending</option>
            <option value="In Progress">🔄 In Progress</option>
            <option value="Completed">✅ Completed</option>
            <option value="Rejected">❌ Rejected</option>
            <option value="On Hold">⏸️ On Hold</option>
          </select>
        );

      case "kycRemarks":
        return (
          <textarea
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            rows="3"
            placeholder="Enter KYC verification remarks or notes..."
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );

      case "program":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Program</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="MBA">MBA</option>
            <option value="MCA">MCA</option>
            <option value="BBA">BBA</option>
            <option value="B.Sc">B.Sc</option>
            <option value="M.Sc">M.Sc</option>
            <option value="Ph.D">Ph.D</option>
          </select>
        );

      case "department":
        return (
          <select
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Department</option>
            {/* Computer Science Specializations */}
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
            <option value="Computer Science & Engineering (Cyber Security)">Computer Science & Engineering (Cyber Security)</option>
            <option value="Computer Science & Technology">Computer Science & Technology</option>
            <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
            <option value="Computer Science and Engineering (Artificial Intelligence and Machine Learning)">Computer Science and Engineering (AI & ML)</option>
            <option value="Computer Science and Engineering (Networks)">Computer Science and Engineering (Networks)</option>
            {/* Other Engineering Departments */}
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
            <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            {/* Management and Applications */}
            <option value="Management Studies">Management Studies</option>
            <option value="Computer Applications">Computer Applications</option>
            <option value="Basic Sciences & Humanities">Basic Sciences & Humanities</option>
          </select>
        );

      case "branch":
        return (
          <input
            type="text"
            name={fieldName}
            value={studentData.department || fieldValue}
            onChange={handleChange}
            placeholder="Branch (auto-filled from Department)"
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
            readOnly
          />
        );

      default:
        return (
          <input
            type="text"
            name={fieldName}
            value={fieldValue}
            onChange={handleChange}
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            className={`mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldError ? "border-red-500" : "border-gray-300"
            }`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Popup Message */}
      {isPopupVisible && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          popupMessage.includes("success") ? "bg-green-500 text-white" :
          popupMessage.includes("error") ? "bg-red-500 text-white" :
          "bg-blue-500 text-white"
        }`}>
          <div className="flex items-center justify-between">
            <span>{popupMessage}</span>
            <button onClick={() => setIsPopupVisible(false)} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Registration</h1>
          <p className="text-gray-600">Comprehensive student management system for university administration</p>
          
          {/* Helpful Tips */}
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                                 <p className="text-sm text-blue-700">
                   <strong>Quick Tips:</strong> Fill out each step completely. Required fields are marked with *. 
                   Fee amounts will be auto-calculated. You can save progress and return later.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFormMode("single")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                formMode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Single Student Registration
            </button>
            <button
              onClick={() => setFormMode("bulk")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                formMode === "bulk"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Bulk Upload (Excel)
            </button>
          </div>
        </div>

        {formMode === "single" ? (
          /* Single Student Registration Form */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-center overflow-x-auto">
                <div className="flex items-center space-x-2 min-w-max">
                  {formSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep >= step.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}>
                        {currentStep > step.id ? "✓" : step.id}
                      </div>
                      <span className={`ml-1 text-xs font-medium ${
                        currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                      }`}>
                        {step.title}
                      </span>
                      {index < formSteps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentStep / formSteps.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Step {currentStep} of {formSteps.length} - {Math.round((currentStep / formSteps.length) * 100)}% Complete
                </p>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 9 ? (
                /* Review Step */
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Review Student Information</h3>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Basic Info</h4>
                      <p className="text-sm text-blue-700">{studentData.name}</p>
                      <p className="text-sm text-blue-600">{studentData.admissionNumber}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Academic</h4>
                      <p className="text-sm text-green-700">{studentData.year} - {studentData.section}</p>
                      <p className="text-sm text-green-600">{studentData.branch}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2">Fee Status</h4>
                      <p className="text-sm text-yellow-700">{studentData.paymentStatus || 'Pending'}</p>
                      <p className="text-sm text-yellow-600">₹{studentData.totalFee || '0'}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">KYC Status</h4>
                      <p className="text-sm text-purple-700">{studentData.kycStatus || 'Pending'}</p>
                      <p className="text-sm text-purple-600">Verification Required</p>
                    </div>
                  </div>

                  {/* Detailed Sections */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['admissionNumber', 'name', 'gender', 'dateOfBirth', 'bloodGroup', 'email', 'studentMobile'].map(field => 
                          studentData[field] && (
                            <div key={field} className="flex justify-between">
                              <span className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-900">{studentData[field]}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Academic Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['program', 'department', 'academicYear', 'semester', 'branch', 'year', 'section', 'admissionDate', 'previousInstitution', 'previousPercentage'].map(field => 
                          studentData[field] && (
                            <div key={field} className="flex justify-between">
                              <span className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-900">{studentData[field]}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Family Information */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Family Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['fatherName', 'fatherMobile', 'motherName', 'parentEmail', 'guardianName', 'guardianMobile', 'guardianEmail', 'guardianRelation'].map(field => 
                          studentData[field] && (
                            <div key={field} className="flex justify-between">
                              <span className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-900">{studentData[field]}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Fee Information */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Fee Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['feeStructure', 'totalFee', 'paidAmount', 'remainingAmount', 'paymentMethod', 'paymentStatus', 'feeDueDate', 'installmentPlan'].map(field => 
                          studentData[field] && (
                            <div key={field} className="flex justify-between">
                              <span className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-900">
                                {field.includes('Fee') || field.includes('Amount') ? `₹${studentData[field]}` : studentData[field]}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* KYC Verification */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        KYC Verification Status
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['aadhaarVerified', 'panCardVerified', 'addressProofVerified', 'incomeCertificateVerified', 'casteCertificateVerified', 'transferCertificateVerified', 'tenthMarksheetVerified', 'interMarksheetVerified', 'photoVerified', 'kycStatus'].map(field => 
                          studentData[field] && (
                            <div key={field} className="flex justify-between">
                              <span className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className={`font-medium ${
                                studentData[field] === 'Verified' ? 'text-green-600' :
                                studentData[field] === 'Pending' ? 'text-yellow-600' :
                                studentData[field] === 'Rejected' ? 'text-red-600' :
                                'text-gray-900'
                              }`}>
                                {studentData[field]}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      {studentData.kycRemarks && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">KYC Remarks:</span>
                          <p className="text-gray-900 mt-1">{studentData.kycRemarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                              ) : (
                /* Form Fields */
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    {formSteps.find(s => s.id === currentStep)?.title}
                  </h3>
                  
                  {/* Helpful Tips for Academic Details */}
                  {currentStep === 2 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                      <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Helpful Tips
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• <strong>Program:</strong> Select the degree program (B.Tech, M.Tech, MBA, etc.)</li>
                        <li>• <strong>Department:</strong> Choose the specific department/specialization</li>
                        <li>• <strong>Branch:</strong> Automatically filled with the selected department</li>
                        <li>• <strong>Computer Science:</strong> Includes CSE, AI, Cyber Security, Data Science, Networks</li>
                        <li>• <strong>Year:</strong> Current academic year (I, II, III, IV)</li>
                        <li>• <strong>Section:</strong> Class section (A, B, C, etc.)</li>
                      </ul>
                    </div>
                  )}
                  
                  {/* KYC Verification Tips */}
                  {currentStep === 8 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        KYC Verification Guide
                      </h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• <strong>10th Marksheet:</strong> Secondary school completion certificate</li>
                        <li>• <strong>Intermediate Marksheet:</strong> Higher secondary (12th) completion certificate</li>
                        <li>• <strong>Verification Status:</strong> Track document verification progress</li>
                        <li>• <strong>Verification Date:</strong> When the document was verified</li>
                        <li>• <strong>KYC Status:</strong> Overall verification completion status</li>
                      </ul>
                    </div>
                  )}

                  {/* KYC Document Upload Section */}
                  {currentStep === 8 && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Document Upload (Optional)
                      </h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Upload scanned copies of required documents. Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'aadhaarDocument', label: 'Aadhaar Card', required: false },
                          { name: 'panCardDocument', label: 'PAN Card', required: false },
                          { name: 'addressProofDocument', label: 'Address Proof', required: false },
                          { name: 'incomeCertificateDocument', label: 'Income Certificate', required: false },
                          { name: 'casteCertificateDocument', label: 'Caste Certificate', required: false },
                          { name: 'transferCertificateDocument', label: 'Transfer Certificate', required: false },
                          { name: 'tenthMarksheetDocument', label: '10th Marksheet', required: false },
                          { name: 'interMarksheetDocument', label: 'Intermediate Marksheet', required: false },
                          { name: 'studentPhoto', label: 'Student Photo', required: false }
                        ].map((doc) => (
                          <div key={doc.name} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {doc.label}
                              {doc.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setStudentData(prev => ({
                                    ...prev,
                                    [doc.name]: file.name
                                  }));
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {studentData[doc.name] && (
                              <p className="text-sm text-green-600">✓ {studentData[doc.name]}</p>
                            )}
            </div>
          ))}
        </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCurrentStepFields().map((fieldName) => (
                      <div key={fieldName} className="space-y-2">
                        <label
                          htmlFor={fieldName}
                          className="block text-sm font-medium text-gray-700 capitalize"
                        >
                          {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                          {validationRules[fieldName]?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderField(fieldName)}
                        {errors[fieldName] && (
                          <p className="text-sm text-red-600">{errors[fieldName]}</p>
                        )}
                      </div>
                    ))}
                  </div>


                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentStep < 9 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
        <button
          type="submit"
                      disabled={isLoading}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Student Registration
                        </>
                      )}
        </button>
                  )}
                </div>
              </div>
      </form>
          </div>
        ) : (
          /* Bulk Upload Section */
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bulk Student Upload</h2>
            
            <div className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Excel File
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        XLSX, XLS files only. Sheet names should be in format: "YEAR SECTION" (e.g., "III A")
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



              {/* Data Preview */}
              {previewData && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Data Preview (First 5 records)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission No
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mobile
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((student, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.admissionNumber}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.studentMobile}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.year}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.section}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Total records found: {excelData.length}
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-center">
        <button
                  onClick={handleBulkUpload}
          disabled={isUploading || excelData.length === 0}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    isUploading || excelData.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isUploading ? "Uploading..." : `Upload ${excelData.length} Students`}
        </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;

