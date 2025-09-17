import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';

const StudentRegistration = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [studentData, setStudentData] = useState({
    admissionNumber: "",
    name: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    email: "",
    studentMobile: "",
    aadhaar: "",
    program: "",
    department: "",
    year: "",
    section: "",
    admissionDate: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    parentEmail: "",
    guardianName: "",
    guardianMobile: "",
    address: "",
    stateOfOrigin: "",
    district: "",
    pincode: "",
    category: "",
    religion: "",
    nationality: "",
    quota: "",
    previousInstitution: "",
    previousPercentage: "",
    entranceExam: "",
    entranceRank: "",
    scholarship: "",
    hostelRequired: "",
    transportRequired: "",
    feeStructure: "",
    totalFee: "",
    paidAmount: "",
    remainingAmount: "",
    paymentMethod: "",
    paymentStatus: "Pending",
    feeDueDate: "",
    installmentPlan: "",
    discountApplied: "",
    discountReason: "",
    aadhaarVerified: "",
    panCardVerified: "",
    addressProofVerified: "",
    incomeCertificateVerified: "",
    casteCertificateVerified: "",
    transferCertificateVerified: "",
    tenthMarksheetVerified: "",
    interMarksheetVerified: "",
    photoVerified: "",
    kycStatus: "Pending",
    kycRemarks: "",
    aadhaarDocument: "",
    panCardDocument: "",
    addressProofDocument: "",
    incomeCertificateDocument: "",
    casteCertificateDocument: "",
    transferCertificateDocument: "",
    tenthMarksheetDocument: "",
    interMarksheetDocument: "",
    studentPhoto: "",
    photoURL: "",
    documents: [],
    status: "Active",
    remarks: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [customFieldConfig, setCustomFieldConfig] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  // If this page is opened after creating an Auth user, we expect a UID to be provided.
  // We will keep the Firestore document id the same as the Auth UID.
  const [linkedAuthUid, setLinkedAuthUid] = useState("");

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "👤" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "address", label: "Address", icon: "🏠" },
    { id: "additional", label: "Additional", icon: "📋" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "fees", label: "Fees", icon: "💰" },
    { id: "kyc", label: "KYC", icon: "✅" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "review", label: "Review", icon: "👁️" }
  ];

  // Load custom field configuration
  useEffect(() => {
    loadCustomFieldConfig();
  }, []);

  // Read a pre-linked Auth UID from URL or localStorage so that
  // the Firestore student document uses the same identifier.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("uid") || "";
      const fromStorage = localStorage.getItem("prelinkedAuthUid") || "";
      const resolved = fromQuery || fromStorage || "";
      if (resolved) {
        setLinkedAuthUid(resolved);
      }
    } catch (_) {
      // no-op; best-effort only
    }
  }, []);

  // Update studentData state when custom field config changes
  useEffect(() => {
    if (Object.keys(customFieldConfig).length > 0) {
      const customFields = {};
      
      Object.keys(customFieldConfig).forEach(tabId => {
        const fields = customFieldConfig[tabId] || [];
        fields.forEach(field => {
          // Add all fields from custom config to state, not just custom ones
          if (!studentData.hasOwnProperty(field.name)) {
            customFields[field.name] = "";
          }
        });
      });

      if (Object.keys(customFields).length > 0) {
        setStudentData(prev => ({
          ...prev,
          ...customFields
        }));
      }
    }
  }, [customFieldConfig]);

  // Auto-calculate remaining amount
  useEffect(() => {
    if (studentData.totalFee || studentData.paidAmount) {
      const totalFee = parseFloat(studentData.totalFee) || 0;
      const paidAmount = parseFloat(studentData.paidAmount) || 0;
      const remainingAmount = Math.max(0, totalFee - paidAmount);
      
      setStudentData(prev => ({
        ...prev,
        remainingAmount: remainingAmount.toString()
      }));
      
      // Auto-update payment status
      if (totalFee > 0) {
        let paymentStatus = "Pending";
        if (paidAmount >= totalFee) {
          paymentStatus = "Paid";
        } else if (paidAmount > 0) {
          paymentStatus = "Partial";
        }
        
        setStudentData(prev => ({
          ...prev,
          paymentStatus
        }));
      }
    }
  }, [studentData.totalFee, studentData.paidAmount]);

  const loadCustomFieldConfig = async () => {
    setConfigLoading(true);
    try {
      console.log("Loading custom field configuration...");
      // TODO: Implement custom field configuration loading from Django API
      setCustomFieldConfig({});
      handlePopup("Using default field configuration", "info");
    } catch (error) {
      console.error("Error loading custom field config:", error);
      handlePopup("Error loading custom configuration", "error");
    } finally {
      setConfigLoading(false);
    }
  };

  const refreshCustomConfig = async () => {
    setIsLoading(true);
    try {
      await loadCustomFieldConfig();
      // Force a re-render by updating the state
      setStudentData(prev => ({ ...prev }));
    } catch (error) {
      console.error("Error refreshing config:", error);
      handlePopup("Error refreshing configuration", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to log current state
  const debugCustomConfig = () => {
    console.log("Custom Field Config:", customFieldConfig);
    console.log("Student Data Keys:", Object.keys(studentData));
    console.log("Active Tab:", activeTab);
  };

  // Test function to create sample custom configuration
  const createTestConfig = async () => {
    try {
      const testConfig = {
        tabs: {
          basic: [
            { name: "admissionNumber", label: "Admission Number", type: "text", required: true, placeholder: "Enter admission number" },
            { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter full name" },
            { name: "custom_test_field", label: "Test Custom Field", type: "text", required: false, placeholder: "Enter test value", isCustom: true }
          ],
          academic: [
            { name: "program", label: "Program", type: "select", required: true, options: ["B.Tech", "M.Tech", "MBA"] },
            { name: "custom_academic_field", label: "Custom Academic Field", type: "textarea", required: false, placeholder: "Enter academic details", isCustom: true }
          ]
        }
      };

      // TODO: Implement test configuration creation in Django API
      console.log("Test configuration would be created:", testConfig);

      await loadCustomFieldConfig();
      handlePopup("Test configuration created and loaded!", "success");
    } catch (error) {
      console.error("Error creating test config:", error);
      handlePopup("Error creating test configuration", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields based on custom configuration
      const validationErrors = {};
      
      // Check all tabs for required fields
      Object.keys(customFieldConfig).forEach(tabId => {
        const fields = customFieldConfig[tabId] || [];
        fields.forEach(field => {
          if (field.required && (!studentData[field.name] || studentData[field.name].trim() === '')) {
            validationErrors[field.name] = `${field.label} is required`;
          }
        });
      });

      // Also check default required fields if no custom config
      if (Object.keys(customFieldConfig).length === 0) {
        const defaultRequiredFields = [
          'admissionNumber', 'name', 'gender', 'dateOfBirth', 'email', 'studentMobile',
          'program', 'department', 'year', 'section', 'admissionDate',
          'fatherName', 'fatherMobile', 'motherName',
          'address', 'stateOfOrigin', 'district', 'pincode',
          'feeStructure', 'totalFee'
        ];
        
        defaultRequiredFields.forEach(fieldName => {
          if (!studentData[fieldName] || studentData[fieldName].trim() === '') {
            validationErrors[fieldName] = `${fieldName.replace(/([A-Z])/g, ' $1').trim()} is required`;
          }
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        handlePopup("Please fill in all required fields", "error");
        setIsLoading(false);
        return;
      }

      // Determine the Firestore document id. Prefer the linked Auth UID so that
      // Authentication user UID and student document id are identical.
      const documentId = linkedAuthUid || `${studentData.year}_${studentData.section}_${studentData.admissionNumber}`;
      
      // Prepare student record with all custom fields
      const studentRecord = {
        ...studentData,
        authUid: documentId,
        studentId: documentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "Active",
        formConfig: customFieldConfig, // Store the form configuration used
        customFields: Object.keys(customFieldConfig).reduce((acc, tabId) => {
          const fields = customFieldConfig[tabId] || [];
          fields.forEach(field => {
            if (field.isCustom) {
              acc[field.name] = studentData[field.name] || '';
            }
          });
          return acc;
        }, {})
      };

      // Store in Django API
      await studentApiService.createStudent(studentRecord);

      handlePopup("Student added successfully!", "success");
      
      // Reset form with all possible fields
      const resetData = {
        admissionNumber: "", name: "", gender: "", dateOfBirth: "", bloodGroup: "",
        email: "", studentMobile: "", aadhaar: "", program: "", department: "", year: "",
        section: "", admissionDate: "", fatherName: "", fatherMobile: "", motherName: "",
        parentEmail: "", guardianName: "", guardianMobile: "", address: "", stateOfOrigin: "",
        district: "", pincode: "", category: "", religion: "", nationality: "", quota: "",
        previousInstitution: "", previousPercentage: "", entranceExam: "", entranceRank: "",
        scholarship: "", hostelRequired: "", transportRequired: "", feeStructure: "",
        totalFee: "", paidAmount: "", remainingAmount: "", paymentMethod: "", paymentStatus: "Pending",
        feeDueDate: "", installmentPlan: "", discountApplied: "", discountReason: "",
        aadhaarVerified: "", panCardVerified: "", addressProofVerified: "", incomeCertificateVerified: "",
        casteCertificateVerified: "", transferCertificateVerified: "", tenthMarksheetVerified: "",
        interMarksheetVerified: "", photoVerified: "", kycStatus: "Pending", kycRemarks: "",
        aadhaarDocument: "", panCardDocument: "", addressProofDocument: "", incomeCertificateDocument: "",
        casteCertificateDocument: "", transferCertificateDocument: "", tenthMarksheetDocument: "",
        interMarksheetDocument: "", studentPhoto: "", photoURL: "", documents: [], status: "Active", remarks: ""
      };

      // Reset custom fields as well
      Object.keys(customFieldConfig).forEach(tabId => {
        const fields = customFieldConfig[tabId] || [];
        fields.forEach(field => {
          if (field.isCustom) {
            resetData[field.name] = "";
          }
        });
      });

      setStudentData(resetData);
      setErrors({});
      setActiveTab("basic");
    } catch (error) {
      console.error("Error adding student:", error);
      handlePopup(`Failed to add student: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopup = (message, type = "info") => {
    setPopupMessage(message);
    setIsPopupVisible(true);
    setTimeout(() => setIsPopupVisible(false), 4000);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
          <input
            type="text"
            name="admissionNumber"
            value={studentData.admissionNumber}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="name"
            value={studentData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender *</label>
          <select
            name="gender"
            value={studentData.gender}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={studentData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Group</label>
          <select
            name="bloodGroup"
            value={studentData.bloodGroup}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={studentData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input
            type="tel"
            name="studentMobile"
            value={studentData.studentMobile}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
          <input
            type="text"
            name="aadhaar"
            value={studentData.aadhaar}
            onChange={handleChange}
            maxLength="12"
            placeholder="Enter 12-digit Aadhaar number"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Academic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Program *</label>
          <select
            name="program"
            value={studentData.program}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Program</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="MBA">MBA</option>
            <option value="MCA">MCA</option>
            <option value="BBA">BBA</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department *</label>
          <select
            name="department"
            value={studentData.department}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Management Studies">Management Studies</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year *</label>
          <select
            name="year"
            value={studentData.year}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Year</option>
            <option value="I">1st Year</option>
            <option value="II">2nd Year</option>
            <option value="III">3rd Year</option>
            <option value="IV">4th Year</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Section *</label>
          <select
            name="section"
            value={studentData.section}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Section</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission Date *</label>
          <input
            type="date"
            name="admissionDate"
            value={studentData.admissionDate}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderFamilyInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Family Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Father's Name *</label>
          <input
            type="text"
            name="fatherName"
            value={studentData.fatherName}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Father's Mobile *</label>
          <input
            type="tel"
            name="fatherMobile"
            value={studentData.fatherMobile}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mother's Name *</label>
          <input
            type="text"
            name="motherName"
            value={studentData.motherName}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Email</label>
          <input
            type="email"
            name="parentEmail"
            value={studentData.parentEmail}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
          <input
            type="text"
            name="guardianName"
            value={studentData.guardianName}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guardian Mobile</label>
          <input
            type="tel"
            name="guardianMobile"
            value={studentData.guardianMobile}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Address Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address *</label>
          <textarea
            name="address"
            value={studentData.address}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State *</label>
          <input
            type="text"
            name="stateOfOrigin"
            value={studentData.stateOfOrigin}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">District *</label>
          <input
            type="text"
            name="district"
            value={studentData.district}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={studentData.pincode}
            onChange={handleChange}
            maxLength="6"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Additional Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={studentData.category}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Religion</label>
          <input
            type="text"
            name="religion"
            value={studentData.religion}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nationality</label>
          <input
            type="text"
            name="nationality"
            value={studentData.nationality}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quota</label>
          <select
            name="quota"
            value={studentData.quota}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Quota</option>
            <option value="None">None</option>
            <option value="Sports">Sports</option>
            <option value="NCC">NCC</option>
            <option value="NSS">NSS</option>
            <option value="PH">Physically Handicapped</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Previous Institution</label>
          <input
            type="text"
            name="previousInstitution"
            value={studentData.previousInstitution}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Previous Percentage</label>
          <input
            type="number"
            name="previousPercentage"
            value={studentData.previousPercentage}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Entrance Exam</label>
          <input
            type="text"
            name="entranceExam"
            value={studentData.entranceExam}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Entrance Rank</label>
          <input
            type="text"
            name="entranceRank"
            value={studentData.entranceRank}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Scholarship</label>
          <input
            type="text"
            name="scholarship"
            value={studentData.scholarship}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Preferences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hostel Required</label>
          <select
            name="hostelRequired"
            value={studentData.hostelRequired}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Transport Required</label>
          <select
            name="transportRequired"
            value={studentData.transportRequired}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFeeInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Fee Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fee Structure *</label>
          <select
            name="feeStructure"
            value={studentData.feeStructure}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Fee Structure</option>
            <option value="Regular">Regular Fee</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Merit">Merit Based</option>
            <option value="Management">Management Quota</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Fee *</label>
          <input
            type="number"
            name="totalFee"
            value={studentData.totalFee}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
          <input
            type="number"
            name="paidAmount"
            value={studentData.paidAmount}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Remaining Amount</label>
          <input
            type="number"
            name="remainingAmount"
            value={studentData.remainingAmount}
            readOnly
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            name="paymentMethod"
            value={studentData.paymentMethod}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online Transfer">Online Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select
            name="paymentStatus"
            value={studentData.paymentStatus}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fee Due Date</label>
          <input
            type="date"
            name="feeDueDate"
            value={studentData.feeDueDate}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Installment Plan</label>
          <select
            name="installmentPlan"
            value={studentData.installmentPlan}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Installment Plan</option>
            <option value="Full Payment">Full Payment</option>
            <option value="2 Installments">2 Installments</option>
            <option value="3 Installments">3 Installments</option>
            <option value="4 Installments">4 Installments</option>
            <option value="6 Installments">6 Installments</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount Applied</label>
          <input
            type="number"
            name="discountApplied"
            value={studentData.discountApplied}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount Reason</label>
          <select
            name="discountReason"
            value={studentData.discountReason}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        </div>
      </div>
    </div>
  );

  const renderKYCInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">KYC Verification</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Aadhaar Verified</label>
          <select
            name="aadhaarVerified"
            value={studentData.aadhaarVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PAN Card Verified</label>
          <select
            name="panCardVerified"
            value={studentData.panCardVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Proof Verified</label>
          <select
            name="addressProofVerified"
            value={studentData.addressProofVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Income Certificate Verified</label>
          <select
            name="incomeCertificateVerified"
            value={studentData.incomeCertificateVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Caste Certificate Verified</label>
          <select
            name="casteCertificateVerified"
            value={studentData.casteCertificateVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Transfer Certificate Verified</label>
          <select
            name="transferCertificateVerified"
            value={studentData.transferCertificateVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">10th Marksheet Verified</label>
          <select
            name="tenthMarksheetVerified"
            value={studentData.tenthMarksheetVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Intermediate Marksheet Verified</label>
          <select
            name="interMarksheetVerified"
            value={studentData.interMarksheetVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo Verified</label>
          <select
            name="photoVerified"
            value={studentData.photoVerified}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Verification Status</option>
            <option value="Verified">✓ Verified</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Rejected">✗ Rejected</option>
            <option value="Not Required">- Not Required</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">KYC Status</label>
          <select
            name="kycStatus"
            value={studentData.kycStatus}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pending">⏳ Pending</option>
            <option value="In Progress">🔄 In Progress</option>
            <option value="Completed">✅ Completed</option>
            <option value="Rejected">❌ Rejected</option>
            <option value="On Hold">⏸️ On Hold</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">KYC Remarks</label>
          <textarea
            name="kycRemarks"
            value={studentData.kycRemarks}
            onChange={handleChange}
            rows="3"
            placeholder="Enter KYC verification remarks or notes..."
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderDocumentsInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Document Upload</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'aadhaarDocument', label: 'Aadhaar Card' },
          { name: 'panCardDocument', label: 'PAN Card' },
          { name: 'addressProofDocument', label: 'Address Proof' },
          { name: 'incomeCertificateDocument', label: 'Income Certificate' },
          { name: 'casteCertificateDocument', label: 'Caste Certificate' },
          { name: 'transferCertificateDocument', label: 'Transfer Certificate' },
          { name: 'tenthMarksheetDocument', label: '10th Marksheet' },
          { name: 'interMarksheetDocument', label: 'Intermediate Marksheet' },
          { name: 'studentPhoto', label: 'Student Photo' }
        ].map((doc) => (
          <div key={doc.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {doc.label}
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
  );

  const renderReview = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Review & Submit</h3>
      
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
          <p className="text-sm text-green-600">{studentData.department}</p>
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
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Information Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(studentData).map(([key, value]) => {
            // Skip empty values and internal fields
            if (!value || ['studentId', 'createdAt', 'updatedAt', 'formConfig', 'customFields'].includes(key)) {
              return null;
            }

            // Get field label from custom config if available
            let fieldLabel = key.replace(/([A-Z])/g, ' $1').trim();
            let isCustomField = false;

            Object.keys(customFieldConfig).forEach(tabId => {
              const fields = customFieldConfig[tabId] || [];
              const field = fields.find(f => f.name === key);
              if (field) {
                fieldLabel = field.label;
                isCustomField = field.isCustom;
              }
            });

            return (
              <div key={key} className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {fieldLabel}
                  {isCustomField && <span className="text-blue-500 text-xs ml-1">(Custom)</span>}
                </span>
                <span className="text-gray-900">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCustomFields = (tabId) => {
    const fields = customFieldConfig[tabId] || [];
    
    // If no custom config exists, use default rendering
    if (Object.keys(customFieldConfig).length === 0) {
      switch (tabId) {
        case "basic": return renderBasicInfo();
        case "academic": return renderAcademicInfo();
        case "family": return renderFamilyInfo();
        case "address": return renderAddressInfo();
        case "additional": return renderAdditionalInfo();
        case "preferences": return renderPreferencesInfo();
        case "fees": return renderFeeInfo();
        case "kyc": return renderKYCInfo();
        case "documents": return renderDocumentsInfo();
        default: return renderBasicInfo();
      }
    }

    // If custom config exists but no fields for this tab, show empty state
    if (fields.length === 0) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              {tabs.find(t => t.id === tabId)?.label}
            </h3>
            <div className="max-w-md mx-auto">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Fields Configured</h4>
                <p className="text-gray-600 mb-4">This tab doesn't have any fields configured yet.</p>
                <button
                  onClick={() => window.location.href = '/form-customizer'}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  Configure Fields
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center lg:text-left">
          <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            {tabs.find(t => t.id === tabId)?.label}
          </h3>
          <p className="text-gray-600">Please fill in the required information</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {fields.map((field, index) => (
            <div key={`${field.name}-${index}`} className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 capitalize flex items-center space-x-2">
                <span>{field.label}</span>
                {field.required && <span className="text-red-500 text-lg">*</span>}
                {field.isCustom && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    Custom
                  </span>
                )}
              </label>
              {renderCustomField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors[field.name]}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomField = (field) => {
    const fieldValue = studentData[field.name] || "";
    const fieldError = errors[field.name];

    const baseInputClasses = `mt-2 block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      fieldError ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-blue-500"
    }`;

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "email":
        return (
          <input
            type="email"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || "Enter email address"}
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "tel":
        return (
          <input
            type="tel"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || "Enter phone number"}
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "number":
        return (
          <input
            type="number"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || "Enter number"}
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "date":
        return (
          <input
            type="date"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "select":
        return (
          <select
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows="3"
            className={baseInputClasses}
            required={field.required}
          />
        );
      case "file":
        return (
          <div className="relative">
            <input
              type="file"
              name={field.name}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setStudentData(prev => ({
                    ...prev,
                    [field.name]: file.name
                  }));
                }
              }}
              className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={field.required}
            />
          </div>
        );
      default:
        return (
          <input
            type="text"
            name={field.name}
            value={fieldValue}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseInputClasses}
            required={field.required}
          />
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic": return renderCustomFields("basic");
      case "academic": return renderCustomFields("academic");
      case "family": return renderCustomFields("family");
      case "address": return renderCustomFields("address");
      case "additional": return renderCustomFields("additional");
      case "preferences": return renderCustomFields("preferences");
      case "fees": return renderCustomFields("fees");
      case "kyc": return renderCustomFields("kyc");
      case "documents": return renderCustomFields("documents");
      case "review": return renderReview();
      default: return renderCustomFields("basic");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Popup Message */}
      {isPopupVisible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm transform transition-all duration-300 ${
          popupMessage.includes("success") ? "bg-gradient-to-r from-green-500 to-green-600 text-white" :
          popupMessage.includes("error") ? "bg-gradient-to-r from-red-500 to-red-600 text-white" :
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {popupMessage.includes("success") ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : popupMessage.includes("error") ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{popupMessage}</span>
            </div>
            <button onClick={() => setIsPopupVisible(false)} className="ml-3 text-white hover:text-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Student Registration
                  </h1>
                  <p className="text-gray-600 mt-1">Comprehensive student management system with full customization</p>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {Object.keys(customFieldConfig).length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-medium">
                      Custom config loaded ({Object.keys(customFieldConfig).length} tabs)
                    </span>
                  </div>
                )}
                {configLoading && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 font-medium">Loading configuration...</span>
                  </div>
                )}
                {!configLoading && Object.keys(customFieldConfig).length === 0 && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Using default configuration</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={debugCustomConfig}
                className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Debug</span>
              </button>
              <button
                onClick={createTestConfig}
                className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span>Test</span>
              </button>
              <button
                onClick={refreshCustomConfig}
                className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/form-customizer'}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <nav className="flex space-x-1 px-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm"
                      : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              {renderTabContent()}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t border-gray-100 space-y-4 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                  disabled={activeTab === "basic"}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === "basic"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex space-x-4">
                  {activeTab !== "review" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Submit Registration</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
