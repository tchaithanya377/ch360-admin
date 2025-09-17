import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
const FormCustomizer = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [customFields, setCustomFields] = useState({});
  const [availableFields, setAvailableFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: []
  });
  const [editingField, setEditingField] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "👤" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "address", label: "Address", icon: "🏠" },
    { id: "additional", label: "Additional", icon: "📋" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "fees", label: "Fees", icon: "💰" },
    { id: "kyc", label: "KYC", icon: "✅" },
    { id: "documents", label: "Documents", icon: "📄" }
  ];

  // Predefined available fields
  const predefinedFields = [
    // Basic Info Fields
    { name: "admissionNumber", label: "Admission Number", type: "text", required: true, placeholder: "Enter admission number" },
    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter full name" },
    { name: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
    { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { name: "bloodGroup", label: "Blood Group", type: "select", required: false, options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter email address" },
    { name: "studentMobile", label: "Mobile Number", type: "tel", required: true, placeholder: "Enter mobile number" },
    { name: "aadhaar", label: "Aadhaar Number", type: "text", required: false, placeholder: "Enter 12-digit Aadhaar number" },
    
    // Academic Fields
    { name: "program", label: "Program", type: "select", required: true, options: ["B.Tech", "M.Tech", "MBA", "MCA", "BBA", "B.Sc", "M.Sc", "Ph.D"] },
    { name: "department", label: "Department", type: "select", required: true, options: ["Computer Science & Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Management Studies"] },
    { name: "year", label: "Year", type: "select", required: true, options: ["I", "II", "III", "IV"] },
    { name: "section", label: "Section", type: "select", required: true, options: ["A", "B", "C"] },
    { name: "admissionDate", label: "Admission Date", type: "date", required: true },
    { name: "semester", label: "Semester", type: "select", required: false, options: ["1", "2", "3", "4", "5", "6", "7", "8"] },
    
    // Family Fields
    { name: "fatherName", label: "Father's Name", type: "text", required: true, placeholder: "Enter father's name" },
    { name: "fatherMobile", label: "Father's Mobile", type: "tel", required: true, placeholder: "Enter father's mobile" },
    { name: "motherName", label: "Mother's Name", type: "text", required: true, placeholder: "Enter mother's name" },
    { name: "parentEmail", label: "Parent Email", type: "email", required: false, placeholder: "Enter parent email" },
    { name: "guardianName", label: "Guardian Name", type: "text", required: false, placeholder: "Enter guardian name" },
    { name: "guardianMobile", label: "Guardian Mobile", type: "tel", required: false, placeholder: "Enter guardian mobile" },
    { name: "guardianEmail", label: "Guardian Email", type: "email", required: false, placeholder: "Enter guardian email" },
    { name: "guardianRelation", label: "Guardian Relation", type: "text", required: false, placeholder: "Enter guardian relation" },
    
    // Address Fields
    { name: "address", label: "Address", type: "textarea", required: true, placeholder: "Enter complete address" },
    { name: "stateOfOrigin", label: "State", type: "text", required: true, placeholder: "Enter state" },
    { name: "district", label: "District", type: "text", required: true, placeholder: "Enter district" },
    { name: "pincode", label: "Pincode", type: "text", required: true, placeholder: "Enter pincode" },
    { name: "emergencyContact", label: "Emergency Contact", type: "tel", required: false, placeholder: "Enter emergency contact" },
    { name: "emergencyContactRelation", label: "Emergency Contact Relation", type: "text", required: false, placeholder: "Enter relation" },
    
    // Additional Fields
    { name: "category", label: "Category", type: "select", required: false, options: ["General", "OBC", "SC", "ST", "EWS"] },
    { name: "religion", label: "Religion", type: "text", required: false, placeholder: "Enter religion" },
    { name: "nationality", label: "Nationality", type: "text", required: false, placeholder: "Enter nationality" },
    { name: "quota", label: "Quota", type: "select", required: false, options: ["None", "Sports", "NCC", "NSS", "PH"] },
    { name: "previousInstitution", label: "Previous Institution", type: "text", required: false, placeholder: "Enter previous institution" },
    { name: "previousPercentage", label: "Previous Percentage", type: "number", required: false, placeholder: "Enter previous percentage" },
    { name: "entranceExam", label: "Entrance Exam", type: "text", required: false, placeholder: "Enter entrance exam" },
    { name: "entranceRank", label: "Entrance Rank", type: "text", required: false, placeholder: "Enter entrance rank" },
    { name: "scholarship", label: "Scholarship", type: "text", required: false, placeholder: "Enter scholarship details" },
    
    // Preferences Fields
    { name: "hostelRequired", label: "Hostel Required", type: "select", required: false, options: ["Yes", "No"] },
    { name: "transportRequired", label: "Transport Required", type: "select", required: false, options: ["Yes", "No"] },
    
    // Fee Fields
    { name: "feeStructure", label: "Fee Structure", type: "select", required: true, options: ["Regular", "Scholarship", "Merit", "Management"] },
    { name: "totalFee", label: "Total Fee", type: "number", required: true, placeholder: "Enter total fee" },
    { name: "paidAmount", label: "Paid Amount", type: "number", required: false, placeholder: "Enter paid amount" },
    { name: "remainingAmount", label: "Remaining Amount", type: "number", required: false, placeholder: "Auto-calculated" },
    { name: "paymentMethod", label: "Payment Method", type: "select", required: false, options: ["Cash", "Cheque", "Online Transfer", "Credit Card", "Debit Card", "UPI"] },
    { name: "paymentStatus", label: "Payment Status", type: "select", required: false, options: ["Pending", "Partial", "Paid"] },
    { name: "feeDueDate", label: "Fee Due Date", type: "date", required: false },
    { name: "installmentPlan", label: "Installment Plan", type: "select", required: false, options: ["Full Payment", "2 Installments", "3 Installments", "4 Installments", "6 Installments", "Monthly"] },
    { name: "discountApplied", label: "Discount Applied", type: "number", required: false, placeholder: "Enter discount amount" },
    { name: "discountReason", label: "Discount Reason", type: "select", required: false, options: ["Merit Based", "Sports Quota", "Sibling Discount", "Staff Child", "Alumni Child", "Financial Need", "Other"] },
    
    // KYC Fields
    { name: "aadhaarVerified", label: "Aadhaar Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "panCardVerified", label: "PAN Card Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "addressProofVerified", label: "Address Proof Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "incomeCertificateVerified", label: "Income Certificate Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "casteCertificateVerified", label: "Caste Certificate Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "transferCertificateVerified", label: "Transfer Certificate Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "tenthMarksheetVerified", label: "10th Marksheet Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "interMarksheetVerified", label: "Intermediate Marksheet Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "photoVerified", label: "Photo Verified", type: "select", required: false, options: ["Verified", "Pending", "Rejected", "Not Required"] },
    { name: "kycStatus", label: "KYC Status", type: "select", required: false, options: ["Pending", "In Progress", "Completed", "Rejected", "On Hold"] },
    { name: "kycRemarks", label: "KYC Remarks", type: "textarea", required: false, placeholder: "Enter KYC remarks" },
    
    // Document Fields
    { name: "aadhaarDocument", label: "Aadhaar Card", type: "file", required: false },
    { name: "panCardDocument", label: "PAN Card", type: "file", required: false },
    { name: "addressProofDocument", label: "Address Proof", type: "file", required: false },
    { name: "incomeCertificateDocument", label: "Income Certificate", type: "file", required: false },
    { name: "casteCertificateDocument", label: "Caste Certificate", type: "file", required: false },
    { name: "transferCertificateDocument", label: "Transfer Certificate", type: "file", required: false },
    { name: "tenthMarksheetDocument", label: "10th Marksheet", type: "file", required: false },
    { name: "interMarksheetDocument", label: "Intermediate Marksheet", type: "file", required: false },
    { name: "studentPhoto", label: "Student Photo", type: "file", required: false }
  ];

  useEffect(() => {
    loadCustomFields();
    setAvailableFields(predefinedFields);
  }, []);

  const loadCustomFields = async () => {
    try {
      const docRef = doc(db, "formConfig", "studentRegistration");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCustomFields(docSnap.data().tabs || {});
      } else {
        // Initialize with default fields
        const defaultFields = {};
        tabs.forEach(tab => {
          defaultFields[tab.id] = predefinedFields.filter(field => {
            if (tab.id === "basic") return ["admissionNumber", "name", "gender", "dateOfBirth", "bloodGroup", "email", "studentMobile", "aadhaar"].includes(field.name);
            if (tab.id === "academic") return ["program", "department", "year", "section", "admissionDate", "semester"].includes(field.name);
            if (tab.id === "family") return ["fatherName", "fatherMobile", "motherName", "parentEmail", "guardianName", "guardianMobile", "guardianEmail", "guardianRelation"].includes(field.name);
            if (tab.id === "address") return ["address", "stateOfOrigin", "district", "pincode", "emergencyContact", "emergencyContactRelation"].includes(field.name);
            if (tab.id === "additional") return ["category", "religion", "nationality", "quota", "previousInstitution", "previousPercentage", "entranceExam", "entranceRank", "scholarship"].includes(field.name);
            if (tab.id === "preferences") return ["hostelRequired", "transportRequired"].includes(field.name);
            if (tab.id === "fees") return ["feeStructure", "totalFee", "paidAmount", "remainingAmount", "paymentMethod", "paymentStatus", "feeDueDate", "installmentPlan", "discountApplied", "discountReason"].includes(field.name);
            if (tab.id === "kyc") return ["aadhaarVerified", "panCardVerified", "addressProofVerified", "incomeCertificateVerified", "casteCertificateVerified", "transferCertificateVerified", "tenthMarksheetVerified", "interMarksheetVerified", "photoVerified", "kycStatus", "kycRemarks"].includes(field.name);
            if (tab.id === "documents") return ["aadhaarDocument", "panCardDocument", "addressProofDocument", "incomeCertificateDocument", "casteCertificateDocument", "transferCertificateDocument", "tenthMarksheetDocument", "interMarksheetDocument", "studentPhoto"].includes(field.name);
            return false;
          });
        });
        setCustomFields(defaultFields);
      }
    } catch (error) {
      console.error("Error loading custom fields:", error);
      handlePopup("Error loading form configuration", "error");
    }
  };

  const saveCustomFields = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "formConfig", "studentRegistration");
      await setDoc(docRef, {
        tabs: customFields,
        updatedAt: serverTimestamp()
      });
      handlePopup("Form configuration saved successfully!", "success");
    } catch (error) {
      console.error("Error saving custom fields:", error);
      handlePopup("Error saving form configuration", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, field) => {
    e.dataTransfer.setData("field", JSON.stringify(field));
  };

  const handleDrop = (e, tabId) => {
    e.preventDefault();
    const fieldData = JSON.parse(e.dataTransfer.getData("field"));
    
    // Check if field already exists in the tab
    const existingFields = customFields[tabId] || [];
    const fieldExists = existingFields.some(f => f.name === fieldData.name);
    
    if (!fieldExists) {
      setCustomFields(prev => ({
        ...prev,
        [tabId]: [...(prev[tabId] || []), fieldData]
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeField = (tabId, fieldName) => {
    setCustomFields(prev => ({
      ...prev,
      [tabId]: prev[tabId].filter(field => field.name !== fieldName)
    }));
    handlePopup("Field removed successfully!", "success");
  };

  const toggleFieldRequired = (tabId, fieldName) => {
    setCustomFields(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(field => 
        field.name === fieldName 
          ? { ...field, required: !field.required }
          : field
      )
    }));
  };

  const editField = (field) => {
    setEditingField(field);
    setShowEditModal(true);
  };

  const updateField = () => {
    if (!editingField.name || !editingField.label) {
      handlePopup("Please fill in field name and label", "error");
      return;
    }

    setCustomFields(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(field => 
        field.name === editingField.name ? editingField : field
      )
    }));

    setEditingField(null);
    setShowEditModal(false);
    handlePopup("Field updated successfully!", "success");
  };

  const moveField = (tabId, fromIndex, toIndex) => {
    const fields = [...customFields[tabId]];
    const [movedField] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, movedField);
    
    setCustomFields(prev => ({
      ...prev,
      [tabId]: fields
    }));
  };

  const addCustomField = () => {
    if (!newField.name || !newField.label) {
      handlePopup("Please fill in field name and label", "error");
      return;
    }

    const customField = {
      ...newField,
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      isCustom: true
    };

    setCustomFields(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), customField]
    }));

    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: []
    });
    setShowNewFieldModal(false);
    handlePopup("Custom field added successfully!", "success");
  };

  const handlePopup = (message, type = "info") => {
    setPopupMessage(message);
    setIsPopupVisible(true);
    setTimeout(() => setIsPopupVisible(false), 4000);
  };

  const renderFieldPreview = (field) => {
    const basePreviewClasses = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm";
    
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={basePreviewClasses}
            disabled
          />
        );
      case "email":
        return (
          <input
            type="email"
            placeholder={field.placeholder || "Enter email address"}
            className={basePreviewClasses}
            disabled
          />
        );
      case "tel":
        return (
          <input
            type="tel"
            placeholder={field.placeholder || "Enter phone number"}
            className={basePreviewClasses}
            disabled
          />
        );
      case "number":
        return (
          <input
            type="number"
            placeholder={field.placeholder || "Enter number"}
            className={basePreviewClasses}
            disabled
          />
        );
      case "date":
        return (
          <input
            type="date"
            className={basePreviewClasses}
            disabled
          />
        );
      case "select":
        return (
          <select className={basePreviewClasses} disabled>
            <option>Select {field.label}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={basePreviewClasses}
            rows="2"
            disabled
          />
        );
      case "file":
        return (
          <div className="relative">
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              disabled
            />
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={basePreviewClasses}
            disabled
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Form Customizer
                  </h1>
                  <p className="text-gray-600 mt-1">Drag and drop fields to create your perfect registration form</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-blue-700 font-medium">
                    {Object.values(customFields).flat().length} Fields Configured
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">
                    {tabs.length} Tabs Available
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCustomFields({});
                  handlePopup("Form reset to default", "info");
                }}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                onClick={saveCustomFields}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Config</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.location.href = '/student-registration'}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Form</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Fields Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Available Fields</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{availableFields.length} fields</span>
                </div>
              </div>
              
              {/* Add Custom Field Button */}
              <button
                onClick={() => setShowNewFieldModal(true)}
                className="w-full mb-6 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Custom Field</span>
              </button>

              {/* Search/Filter */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search fields..."
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {availableFields.map((field, index) => (
                  <div
                    key={`${field.name}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    className="p-4 border border-gray-200 rounded-xl cursor-move hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-gray-900">{field.label}</p>
                          {field.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Required</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{field.type}</span>
                          {field.placeholder && (
                            <span className="text-xs text-gray-500 truncate">{field.placeholder}</span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Customization Panel */}
          <div className="lg:col-span-2">
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
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Customize {tabs.find(t => t.id === activeTab)?.label} Fields
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {customFields[activeTab]?.length || 0} fields configured
                    </p>
                  </div>
                                     <div className="flex space-x-3">
                     <button
                       onClick={() => {
                         setCustomFields(prev => ({
                           ...prev,
                           [activeTab]: prev[activeTab].map(field => ({ ...field, required: true }))
                         }));
                         handlePopup("All fields made required", "success");
                       }}
                       className="px-3 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span>Make All Required</span>
                     </button>
                     <button
                       onClick={() => {
                         setCustomFields(prev => ({
                           ...prev,
                           [activeTab]: prev[activeTab].map(field => ({ ...field, required: false }))
                         }));
                         handlePopup("All fields made optional", "success");
                       }}
                       className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                       </svg>
                       <span>Make All Optional</span>
                     </button>
                     <button
                       onClick={() => {
                         setCustomFields(prev => ({
                           ...prev,
                           [activeTab]: []
                         }));
                         handlePopup("Fields cleared for this tab", "info");
                       }}
                       className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                       <span>Clear Tab</span>
                     </button>
                   </div>
                </div>

                <div
                  className="min-h-96 border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
                  onDrop={(e) => handleDrop(e, activeTab)}
                  onDragOver={handleDragOver}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(customFields[activeTab] || []).map((field, index) => (
                      <div
                        key={`${field.name}-${index}`}
                        className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 group"
                      >
                                                 <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center space-x-2">
                             <span className="font-semibold text-gray-900">{field.label}</span>
                             {field.required && (
                               <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Required</span>
                             )}
                             {field.isCustom && (
                               <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Custom</span>
                             )}
                           </div>
                           <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={() => toggleFieldRequired(activeTab, field.name)}
                               className={`p-1 rounded transition-colors ${
                                 field.required 
                                   ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50" 
                                   : "text-green-500 hover:text-green-700 hover:bg-green-50"
                               }`}
                               title={field.required ? "Make optional" : "Make required"}
                             >
                               {field.required ? (
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                 </svg>
                               ) : (
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                               )}
                             </button>
                             <button
                               onClick={() => editField(field)}
                               className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                               title="Edit field"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                               </svg>
                             </button>
                             <button
                               onClick={() => removeField(activeTab, field.name)}
                               className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                               title="Remove field"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             </button>
                           </div>
                         </div>
                        <div className="mb-2">
                          {renderFieldPreview(field)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{field.type}</span>
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(!customFields[activeTab] || customFields[activeTab].length === 0) && (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Fields Added</h4>
                          <p className="text-gray-600 mb-4">Drag fields from the left panel to add them to this tab</p>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>Drag & Drop</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Custom Field Modal */}
        {showNewFieldModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Custom Field</h3>
                  <p className="text-gray-600 mt-1">Create a new field for your form</p>
                </div>
                <button
                  onClick={() => setShowNewFieldModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Field Name *</label>
                    <input
                      type="text"
                      value={newField.name}
                      onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., custom_field"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used internally (no spaces, lowercase)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label *</label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g., Custom Field"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Display name for users</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type *</label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="text">Text Input</option>
                    <option value="email">Email Input</option>
                    <option value="tel">Phone Number</option>
                    <option value="number">Number Input</option>
                    <option value="date">Date Picker</option>
                    <option value="select">Dropdown Select</option>
                    <option value="textarea">Text Area</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                
                {newField.type === "select" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Options (comma-separated) *</label>
                    <input
                      type="text"
                      value={newField.options.join(", ")}
                      onChange={(e) => setNewField(prev => ({ 
                        ...prev, 
                        options: e.target.value.split(",").map(opt => opt.trim()).filter(opt => opt)
                      }))}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={newField.placeholder}
                    onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="Enter placeholder text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required" className="ml-3 block text-sm font-medium text-gray-900">
                    Make this field required
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomField}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
                 )}

         {/* Edit Field Modal */}
         {showEditModal && editingField && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900">Edit Field</h3>
                   <p className="text-gray-600 mt-1">Modify field properties</p>
                 </div>
                 <button
                   onClick={() => {
                     setShowEditModal(false);
                     setEditingField(null);
                   }}
                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Field Name *</label>
                     <input
                       type="text"
                       value={editingField.name}
                       onChange={(e) => setEditingField(prev => ({ ...prev, name: e.target.value }))}
                       placeholder="e.g., custom_field"
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                     />
                     <p className="text-xs text-gray-500 mt-1">Used internally (no spaces, lowercase)</p>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label *</label>
                     <input
                       type="text"
                       value={editingField.label}
                       onChange={(e) => setEditingField(prev => ({ ...prev, label: e.target.value }))}
                       placeholder="e.g., Custom Field"
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                     />
                     <p className="text-xs text-gray-500 mt-1">Display name for users</p>
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type *</label>
                   <select
                     value={editingField.type}
                     onChange={(e) => setEditingField(prev => ({ ...prev, type: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                   >
                     <option value="text">Text Input</option>
                     <option value="email">Email Input</option>
                     <option value="tel">Phone Number</option>
                     <option value="number">Number Input</option>
                     <option value="date">Date Picker</option>
                     <option value="select">Dropdown Select</option>
                     <option value="textarea">Text Area</option>
                     <option value="file">File Upload</option>
                   </select>
                 </div>
                 
                 {editingField.type === "select" && (
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Options (comma-separated) *</label>
                     <input
                       type="text"
                       value={editingField.options.join(", ")}
                       onChange={(e) => setEditingField(prev => ({ 
                         ...prev, 
                         options: e.target.value.split(",").map(opt => opt.trim()).filter(opt => opt)
                       }))}
                       placeholder="Option 1, Option 2, Option 3"
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                     />
                     <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                   </div>
                 )}
                 
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder Text</label>
                   <input
                     type="text"
                     value={editingField.placeholder}
                     onChange={(e) => setEditingField(prev => ({ ...prev, placeholder: e.target.value }))}
                     placeholder="Enter placeholder text"
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                   />
                 </div>
                 
                 <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                   <input
                     type="checkbox"
                     id="edit-required"
                     checked={editingField.required}
                     onChange={(e) => setEditingField(prev => ({ ...prev, required: e.target.checked }))}
                     className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                   />
                   <label htmlFor="edit-required" className="ml-3 block text-sm font-medium text-gray-900">
                     Make this field required
                   </label>
                 </div>
               </div>
               
               <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
                 <button
                   onClick={() => {
                     setShowEditModal(false);
                     setEditingField(null);
                   }}
                   className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={updateField}
                   className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                 >
                   Update Field
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default FormCustomizer;
