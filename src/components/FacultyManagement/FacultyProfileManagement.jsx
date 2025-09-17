import React, { useState, useEffect } from "react";
import facultyApiService from '../../services/facultyApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FacultyCreateForm from './FacultyCreateForm.jsx';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard,
  faGraduationCap,
  faBriefcase,
  faUniversity,
  faCalendarAlt,
  faBook,
  faFileAlt,
  faUpload,
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
  faEye,
  faDownload,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faUsers,
  faChalkboardTeacher,



  faAward,

  faBuilding,
  faMoneyBillWave,
  faCreditCard,
  faShieldAlt,
  faHistory,
  faStar,
  faCalendarCheck,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserShield,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faUserPlus,
  faUserEdit,
  faUserMinus,
  faUserLock,
  faUserSecret,
  faUserTag,
  faUserSlash,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faEllipsisVertical,
  faList
} from "@fortawesome/free-solid-svg-icons";
const FacultyProfileManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [bulkActions, setBulkActions] = useState([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Form states for different sections
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    firstName: "",
    lastName: "",
    middleName: "",
    apaarFacultyId: "",
    employeeId: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    emergencyContact: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    bloodGroup: "",
    maritalStatus: "",
    achievements: "",
    researchInterests: "",
    profilePicture: null,
    bio: "",
    notes: "",
    panNo: "",
  });

  const [academicQualifications, setAcademicQualifications] = useState({
    highestDegree: "",
    highestQualification: "",
    areaOfSpecialization: "",
    specialization: "",
    university: "",
    yearOfCompletion: "",
    percentage: "",
    certifications: [],
    researchAreas: []
  });

  const [employmentDetails, setEmploymentDetails] = useState({
    department: "",
    department_ref: null,
    designation: "",
    presentDesignation: "",
    designationAtJoining: "",
    joiningDate: "",
    dateOfJoiningInstitution: "",
    dateDesignatedAsProfessor: "",
    confirmationDate: "",
    status: "",
    currentlyAssociated: true,
    reportingTo: "",
    workLocation: "",
    employeeType: "",
    employmentType: "",
    natureOfAssociation: "",
    contractualType: "",
    dateOfLeaving: "",
    experienceInCurrentInstitute: "",
    experienceYears: "",
    previousInstitution: "",
    isHod: false,
    isMentor: false,
    mentorForGrades: "",
  });

  const [teachingLoad, setTeachingLoad] = useState({
    assignedCourses: [],
    weeklyHours: 0,
    labSessions: 0,
    tutorialSessions: 0,
    projectGuidance: 0,
    totalWorkload: 0
  });

  const [experienceRecord, setExperienceRecord] = useState({
    previousInstitutions: [],
    industryExperience: [],
    totalExperience: 0,
    researchExperience: 0,
    administrativeExperience: 0
  });

  const [documents, setDocuments] = useState({
    photo: null,
    idProof: null,
    panCard: null,
    aadhaarCard: null,
    educationalCertificates: [],
    experienceCertificates: [],
    relievingLetters: [],
    otherDocuments: []
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "",
    panNumber: "",
    pfNumber: "",
    esiNumber: "",
    uanNumber: "",
    taxDeclarations: []
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await facultyApiService.getFaculty();
        const facultyData = response.results.map((member) => ({
          id: member.id,
          _path: `faculty/${member.id}`,
          personalDetails: {
            name: (member.name || `${member.first_name || ''} ${member.middle_name || ''} ${member.last_name || ''}`.replace(/\s+/g,' ').trim()),
            email: member.email || "",
            phone: member.phone_number || "",
            dateOfBirth: member.date_of_birth || "",
            address: member.address_line_1 || ""
          },
          employmentDetails: {
            employeeId: member.employee_id || "",
            department: member.department || "",
            designation: member.designation || "",
            joiningDate: member.date_of_joining || "",
            status: member.status || "ACTIVE"
          },
          academicQualifications: {
            highestQualification: member.highest_qualification || "",
            specialization: member.area_of_specialization || ""
          },
          bankDetails: {
            bankName: member.bankDetails?.bankName || "",
            accountNumber: member.bankDetails?.accountNumber || "",
            ifscCode: member.bankDetails?.ifscCode || ""
          },
          authUid: member.id || "",
          authEmail: member.email || ""
        }));
        setFaculty(facultyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const handlePasswordReset = async (member) => {
    try {
      const email = member?.authEmail || member?.personalDetails?.email;
      if (!email) {
        alert("No email found for this faculty member.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (e) {
      console.error("Failed to send reset email", e);
      alert("Failed to send password reset email.");
    }
  };

  const handleAddFaculty = () => {
    setSelectedFaculty(null);
    setShowModal(true);
    setActiveSection("personal");
  };

  const handleEditFaculty = (facultyMember) => {
    setSelectedFaculty(facultyMember);
    setPersonalDetails({
      ...personalDetails,
      ...(facultyMember.personalDetails || {})
    });
    setAcademicQualifications({
      ...academicQualifications,
      ...(facultyMember.academicQualifications || {})
    });
    setEmploymentDetails({
      ...employmentDetails,
      ...(facultyMember.employmentDetails || {})
    });
    setTeachingLoad({
      ...teachingLoad,
      ...(facultyMember.teachingLoad || {})
    });
    setExperienceRecord({
      ...experienceRecord,
      ...(facultyMember.experienceRecord || {})
    });
    setDocuments({
      ...documents,
      ...(facultyMember.documents || {})
    });
    setBankDetails({
      ...bankDetails,
      ...(facultyMember.bankDetails || {})
    });
    setShowModal(true);
  };

  const handleSaveFaculty = async () => {
    try {
      setSaveError("");
      setValidationErrors({});

      // Normalize enums/choices
      const normalizeGender = (g) => {
        const v = (g || "").toString().toUpperCase();
        if (["M","MALE"].includes(v)) return "M";
        if (["F","FEMALE"].includes(v)) return "F";
        if (["O","OTHER"].includes(v)) return "O";
        return "";
      };
      const normalizeStatus = (s) => {
        const v = (s || "").toString().toUpperCase().replace(/\s+/g,'_');
        const allowed = ["ACTIVE","INACTIVE","ON_LEAVE","RETIRED","TERMINATED"];
        return allowed.includes(v) ? v : "ACTIVE";
      };
      const normalizeEmploymentType = (t) => {
        const v = (t || "").toString().toUpperCase().replace(/\s+/g,'_');
        const map = { REGULAR: "FULL_TIME" };
        const out = map[v] || v;
        const allowed = ["FULL_TIME","PART_TIME","CONTRACT","VISITING","ADJUNCT"];
        return allowed.includes(out) ? out : "FULL_TIME";
      };

      // Basic required-field validation
      const required = {
        name: personalDetails.name,
        apaar_faculty_id: personalDetails.apaarFacultyId,
        employee_id: employmentDetails.employeeId,
        first_name: personalDetails.firstName || personalDetails.name?.split(' ')[0],
        last_name: personalDetails.lastName || (Array.isArray(personalDetails.name?.split(' ')) ? personalDetails.name.split(' ').slice(1).join(' ') : ''),
        date_of_birth: personalDetails.dateOfBirth,
        gender: normalizeGender(personalDetails.gender),
        highest_degree: academicQualifications.highestDegree,
        highest_qualification: academicQualifications.highestQualification,
        date_of_joining_institution: employmentDetails.dateOfJoiningInstitution || employmentDetails.joiningDate,
        date_of_joining: employmentDetails.joiningDate,
        designation_at_joining: employmentDetails.designationAtJoining || employmentDetails.designation,
        present_designation: employmentDetails.presentDesignation || employmentDetails.designation,
        designation: employmentDetails.designation,
        employment_type: normalizeEmploymentType(employmentDetails.employmentType || employmentDetails.employeeType),
        status: normalizeStatus(employmentDetails.status),
        nature_of_association: employmentDetails.natureOfAssociation || 'REGULAR',
        experience_in_current_institute: employmentDetails.experienceInCurrentInstitute || '0',
        experience_years: employmentDetails.experienceYears || '0',
        department: employmentDetails.department,
        email: personalDetails.email,
        phone_number: personalDetails.phone,
        address_line_1: personalDetails.addressLine1 || personalDetails.address,
        city: personalDetails.city,
        state: personalDetails.state,
        postal_code: personalDetails.postalCode,
        emergency_contact_name: personalDetails.emergencyContactName || personalDetails.emergencyContact,
        emergency_contact_phone: personalDetails.emergencyContactPhone,
        emergency_contact_relationship: personalDetails.emergencyContactRelationship,
      };
      const errs = {};
      Object.entries(required).forEach(([k,v]) => {
        if (v === undefined || v === null || v === "") errs[k] = "Required";
      });
      if (Object.keys(errs).length) {
        setValidationErrors(errs);
        setSaveError("Please fill all required fields.");
        return;
      }

      // Convert the form data to Django API format
      const facultyData = {
        // Basic Information
        name: personalDetails.name || '',
        apaar_faculty_id: personalDetails.apaarFacultyId || personalDetails.apaar_id || '',
        employee_id: employmentDetails.employeeId || '',
        first_name: personalDetails.firstName || personalDetails.name?.split(' ')[0] || '',
        last_name: personalDetails.lastName || (Array.isArray(personalDetails.name?.split(' ')) ? personalDetails.name.split(' ').slice(1).join(' ') : ''),
        middle_name: personalDetails.middleName || '',
        date_of_birth: personalDetails.dateOfBirth || '',
        gender: normalizeGender(personalDetails.gender),

        // Academic Information
        highest_degree: academicQualifications.highestDegree || '',
        highest_qualification: academicQualifications.highestQualification || '',
        university: academicQualifications.university || '',
        area_of_specialization: academicQualifications.areaOfSpecialization || academicQualifications.specialization || '',
        specialization: academicQualifications.specialization || '',
        year_of_completion: academicQualifications.yearOfCompletion || '',

        // Employment Information
        date_of_joining_institution: employmentDetails.dateOfJoiningInstitution || employmentDetails.joiningDate || '',
        date_of_joining: employmentDetails.joiningDate || '',
        designation_at_joining: employmentDetails.designationAtJoining || '',
        present_designation: employmentDetails.presentDesignation || employmentDetails.designation || '',
        designation: employmentDetails.designation || '',
        date_designated_as_professor: employmentDetails.dateDesignatedAsProfessor || '',
        employment_type: normalizeEmploymentType(employmentDetails.employmentType || employmentDetails.employeeType),
        status: normalizeStatus(employmentDetails.status || 'ACTIVE'),
        currently_associated: employmentDetails.currentlyAssociated ?? true,

        // Association Details
        nature_of_association: (employmentDetails.natureOfAssociation || 'REGULAR').toString().toUpperCase(),
        contractual_full_time_part_time: employmentDetails.contractualType || '',
        date_of_leaving: employmentDetails.dateOfLeaving || '',
        experience_in_current_institute: employmentDetails.experienceInCurrentInstitute || '',
        experience_years: employmentDetails.experienceYears || '',
        previous_institution: employmentDetails.previousInstitution || '',

        // Department Information
        department: employmentDetails.department || '',
        department_ref: employmentDetails.department_ref || null,

        // Contact Information
        email: personalDetails.email || '',
        phone_number: personalDetails.phone || '',
        alternate_phone: personalDetails.alternatePhone || '',

        // Address Information
        address_line_1: personalDetails.addressLine1 || personalDetails.address || '',
        address_line_2: personalDetails.addressLine2 || '',
        city: personalDetails.city || '',
        state: personalDetails.state || '',
        postal_code: personalDetails.postalCode || '',
        country: personalDetails.country || 'India',

        // Professional Information
        achievements: personalDetails.achievements || academicQualifications.achievements || '',
        research_interests: (Array.isArray(academicQualifications.researchAreas) ? academicQualifications.researchAreas.join(', ') : (academicQualifications.researchAreas || '')) || personalDetails.researchInterests || '',

        // Administrative Information
        is_head_of_department: employmentDetails.isHod || false,
        is_mentor: employmentDetails.isMentor || false,
        mentor_for_grades: employmentDetails.mentorForGrades || '',

        // Emergency Contact
        emergency_contact_name: personalDetails.emergencyContactName || '',
        emergency_contact_phone: personalDetails.emergencyContactPhone || '',
        emergency_contact_relationship: personalDetails.emergencyContactRelationship || '',

        // Additional Information
        profile_picture: personalDetails.profilePicture || null,
        bio: personalDetails.bio || '',
        notes: personalDetails.notes || '',
        pan_no: personalDetails.panNo || '',
      };

      if (selectedFaculty) {
        await facultyApiService.updateFaculty(selectedFaculty.id, facultyData);
      } else {
        await facultyApiService.createFaculty(facultyData);
      }

      setShowModal(false);
      setSelectedFaculty(null);
      // Reset form states
      
      // Refresh the faculty list
      const response = await facultyApiService.getFaculty();
      const list = Array.isArray(response) ? response : (Array.isArray(response?.results) ? response.results : []);
      const updatedFacultyData = list.map((member) => ({
        id: member.id,
        _path: `faculty/${member.id}`,
        personalDetails: {
          name: member.name || `${member.first_name || ''} ${member.middle_name || ''} ${member.last_name || ''}`.replace(/\s+/g,' ').trim(),
          email: member.email || "",
          phone: member.phone_number || "",
          alternatePhone: member.alternate_phone || '',
          dateOfBirth: member.date_of_birth || "",
          gender: member.gender || '',
          addressLine1: member.address_line_1 || "",
          addressLine2: member.address_line_2 || '',
          city: member.city || '',
          state: member.state || '',
          postalCode: member.postal_code || '',
          country: member.country || 'India'
        },
        employmentDetails: {
          employeeId: member.employee_id || "",
          department: member.department || "",
          department_ref: member.department_ref || null,
          designation: member.designation || "",
          presentDesignation: member.present_designation || '',
          designationAtJoining: member.designation_at_joining || '',
          joiningDate: member.date_of_joining || "",
          dateOfJoiningInstitution: member.date_of_joining_institution || '',
          dateDesignatedAsProfessor: member.date_designated_as_professor || '',
          employmentType: member.employment_type || '',
          status: member.status || "ACTIVE",
          currentlyAssociated: member.currently_associated,
          natureOfAssociation: member.nature_of_association || '',
          contractualType: member.contractual_full_time_part_time || '',
          dateOfLeaving: member.date_of_leaving || '',
          experienceInCurrentInstitute: member.experience_in_current_institute || '',
          experienceYears: member.experience_years || '',
          previousInstitution: member.previous_institution || ''
        },
        academicQualifications: {
          highestDegree: member.highest_degree || '',
          highestQualification: member.highest_qualification || "",
          areaOfSpecialization: member.area_of_specialization || '',
          specialization: member.specialization || "",
          university: member.university || "",
          yearOfCompletion: member.year_of_completion || ""
        },
        bankDetails: {
          bankName: member.bankDetails?.bankName || "",
          accountNumber: member.bankDetails?.accountNumber || "",
          ifscCode: member.bankDetails?.ifscCode || ""
        },
        authUid: member.id || "",
        authEmail: member.email || ""
      }));
      setFaculty(updatedFacultyData);
    } catch (error) {
      setSaveError(error?.message || 'Failed to save faculty');
      console.error("Error saving faculty:", error);
    }
  };

  const filteredFaculty = faculty
    .filter((member) => {
      const matchesSearch = member.personalDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.employmentDetails?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.personalDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.employmentDetails?.department?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || member.employmentDetails?.department === filterDepartment;
      const matchesDesignation = !filterDesignation || member.employmentDetails?.designation === filterDesignation;
      
      return matchesSearch && matchesDepartment && matchesDesignation;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.personalDetails?.name || "";
          bValue = b.personalDetails?.name || "";
          break;
        case "employeeId":
          aValue = a.employmentDetails?.employeeId || "";
          bValue = b.employmentDetails?.employeeId || "";
          break;
        case "department":
          aValue = a.employmentDetails?.department || "";
          bValue = b.employmentDetails?.department || "";
          break;
        case "designation":
          aValue = a.employmentDetails?.designation || "";
          bValue = b.employmentDetails?.designation || "";
          break;
        case "joiningDate":
          aValue = new Date(a.employmentDetails?.joiningDate || 0);
          bValue = new Date(b.employmentDetails?.joiningDate || 0);
          break;
        default:
          aValue = a.personalDetails?.name || "";
          bValue = b.personalDetails?.name || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const sections = [
    { id: "personal", name: "Personal Details", icon: faUser, color: "blue" },
    { id: "academic", name: "Academic Qualifications", icon: faGraduationCap, color: "green" },
    { id: "employment", name: "Employment Details", icon: faBriefcase, color: "purple" },
    { id: "teaching", name: "Teaching Load", icon: faChalkboardTeacher, color: "orange" },
    { id: "experience", name: "Experience Record", icon: faHistory, color: "red" },
    { id: "documents", name: "Documents", icon: faFileAlt, color: "indigo" },
    { id: "bank", name: "Bank & Payroll", icon: faMoneyBillWave, color: "teal" }
  ];

  const getStatusColor = (status) => {
    const v = (status || '').toString().toUpperCase();
    switch (v) {
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
      case "ON_LEAVE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INACTIVE": return "bg-red-100 text-red-800 border-red-200";
      case "RETIRED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "TERMINATED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={personalDetails.name}
                  onChange={(e) => setPersonalDetails({...personalDetails, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter full name"
                />
                {validationErrors.name && <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID *</label>
                <input
                  type="text"
                  value={employmentDetails.employeeId}
                  onChange={(e) => setEmploymentDetails({...employmentDetails, employeeId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee ID"
                />
                {validationErrors.employee_id && <p className="text-xs text-red-600 mt-1">{validationErrors.employee_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter email address"
                />
                {validationErrors.email && <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={personalDetails.phone}
                  onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={personalDetails.dateOfBirth}
                  onChange={(e) => setPersonalDetails({...personalDetails, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={personalDetails.gender}
                  onChange={(e) => setPersonalDetails({...personalDetails, gender: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                <select
                  value={personalDetails.bloodGroup}
                  onChange={(e) => setPersonalDetails({...personalDetails, bloodGroup: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                <select
                  value={personalDetails.maritalStatus}
                  onChange={(e) => setPersonalDetails({...personalDetails, maritalStatus: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                value={personalDetails.address}
                onChange={(e) => setPersonalDetails({...personalDetails, address: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter complete address"
              />
            </div>
          </div>
        );
      case "academic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Highest Qualification</label>
              <select
                value={academicQualifications.highestQualification}
                onChange={(e) => setAcademicQualifications({...academicQualifications, highestQualification: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Qualification</option>
                <option value="Ph.D">Ph.D</option>
                <option value="M.Tech">M.Tech</option>
                <option value="M.E">M.E</option>
                <option value="M.Sc">M.Sc</option>
                <option value="M.A">M.A</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.E">B.E</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.A">B.A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <input
                type="text"
                value={academicQualifications.specialization}
                onChange={(e) => setAcademicQualifications({...academicQualifications, specialization: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
              <input
                type="text"
                value={academicQualifications.university}
                onChange={(e) => setAcademicQualifications({...academicQualifications, university: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Completion</label>
              <input
                type="number"
                value={academicQualifications.yearOfCompletion}
                onChange={(e) => setAcademicQualifications({...academicQualifications, yearOfCompletion: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Percentage/CGPA</label>
              <input
                type="text"
                value={academicQualifications.percentage}
                onChange={(e) => setAcademicQualifications({...academicQualifications, percentage: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Research Areas</label>
              <textarea
                value={(Array.isArray(academicQualifications.researchAreas) ? academicQualifications.researchAreas.join(", ") : (academicQualifications.researchAreas || ""))}
                onChange={(e) => setAcademicQualifications({...academicQualifications, researchAreas: e.target.value.split(", ")})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter research areas separated by commas"
              />
            </div>
          </div>
        );
      case "employment":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <select
                value={employmentDetails.department}
                onChange={(e) => setEmploymentDetails({...employmentDetails, department: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Department</option>
                <option value="COMPUTER_SCIENCE">Computer Science</option>
                <option value="MATHEMATICS">Mathematics</option>
                <option value="PHYSICS">Physics</option>
                <option value="CHEMISTRY">Chemistry</option>
                <option value="BIOLOGY">Biology</option>
                <option value="ENGLISH">English</option>
                <option value="HISTORY">History</option>
                <option value="GEOGRAPHY">Geography</option>
                <option value="ECONOMICS">Economics</option>
                <option value="COMMERCE">Commerce</option>
                <option value="PHYSICAL_EDUCATION">Physical Education</option>
                <option value="ARTS">Arts</option>
                <option value="MUSIC">Music</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
              <select
                value={employmentDetails.designation}
                onChange={(e) => setEmploymentDetails({...employmentDetails, designation: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Designation</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
                <option value="LECTURER">Lecturer</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="HEAD_OF_DEPARTMENT">Head of Department</option>
                <option value="DEAN">Dean</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="VICE_PRINCIPAL">Vice Principal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date</label>
              <input
                type="date"
                value={employmentDetails.joiningDate}
                onChange={(e) => setEmploymentDetails({...employmentDetails, joiningDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={employmentDetails.status || ""}
                onChange={(e) => setEmploymentDetails({...employmentDetails, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
                <option value="RETIRED">Retired</option>
              </select>
              {validationErrors.status && <p className="text-xs text-red-600 mt-1">{validationErrors.status}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Type</label>
              <select
                value={employmentDetails.employmentType || employmentDetails.employeeType || ""}
                onChange={(e) => setEmploymentDetails({...employmentDetails, employmentType: e.target.value, employeeType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Employee Type</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="VISITING">Visiting</option>
                <option value="ADJUNCT">Adjunct</option>
              </select>
              {validationErrors.employment_type && <p className="text-xs text-red-600 mt-1">{validationErrors.employment_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Location</label>
              <input
                type="text"
                value={employmentDetails.workLocation}
                onChange={(e) => setEmploymentDetails({...employmentDetails, workLocation: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        );
      case "teaching":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Courses</label>
              <textarea
                value={(Array.isArray(teachingLoad.assignedCourses) ? teachingLoad.assignedCourses.join(", ") : (teachingLoad.assignedCourses || ""))}
                onChange={(e) => setTeachingLoad({...teachingLoad, assignedCourses: e.target.value.split(", ")})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter assigned courses separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Hours</label>
              <input
                type="number"
                value={teachingLoad.weeklyHours}
                onChange={(e) => setTeachingLoad({...teachingLoad, weeklyHours: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Sessions</label>
              <input
                type="number"
                value={teachingLoad.labSessions}
                onChange={(e) => setTeachingLoad({...teachingLoad, labSessions: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tutorial Sessions</label>
              <input
                type="number"
                value={teachingLoad.tutorialSessions}
                onChange={(e) => setTeachingLoad({...teachingLoad, tutorialSessions: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Guidance</label>
              <input
                type="number"
                value={teachingLoad.projectGuidance}
                onChange={(e) => setTeachingLoad({...teachingLoad, projectGuidance: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Workload</label>
              <input
                type="number"
                value={teachingLoad.totalWorkload}
                onChange={(e) => setTeachingLoad({...teachingLoad, totalWorkload: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Institutions</label>
              <textarea
                value={(Array.isArray(experienceRecord.previousInstitutions) ? experienceRecord.previousInstitutions.join(", ") : (experienceRecord.previousInstitutions || ""))}
                onChange={(e) => setExperienceRecord({...experienceRecord, previousInstitutions: e.target.value.split(", ")})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter previous institutions separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Industry Experience</label>
              <textarea
                value={(Array.isArray(experienceRecord.industryExperience) ? experienceRecord.industryExperience.join(", ") : (experienceRecord.industryExperience || ""))}
                onChange={(e) => setExperienceRecord({...experienceRecord, industryExperience: e.target.value.split(", ")})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter industry experience separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Experience (Years)</label>
              <input
                type="number"
                value={experienceRecord.totalExperience}
                onChange={(e) => setExperienceRecord({...experienceRecord, totalExperience: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Research Experience (Years)</label>
              <input
                type="number"
                value={experienceRecord.researchExperience}
                onChange={(e) => setExperienceRecord({...experienceRecord, researchExperience: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Administrative Experience (Years)</label>
              <input
                type="number"
                value={experienceRecord.administrativeExperience}
                onChange={(e) => setExperienceRecord({...experienceRecord, administrativeExperience: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        );
      case "documents":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDocuments({...documents, photo: e.target.files[0]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {documents.photo && (
                <p className="mt-2 text-sm text-gray-500">Selected file: {documents.photo.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Proof</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocuments({...documents, idProof: e.target.files[0]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {documents.idProof && (
                <p className="mt-2 text-sm text-gray-500">Selected file: {documents.idProof.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Card</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocuments({...documents, panCard: e.target.files[0]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {documents.panCard && (
                <p className="mt-2 text-sm text-gray-500">Selected file: {documents.panCard.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Card</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocuments({...documents, aadhaarCard: e.target.files[0]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {documents.aadhaarCard && (
                <p className="mt-2 text-sm text-gray-500">Selected file: {documents.aadhaarCard.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Educational Certificates</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setDocuments({...documents, educationalCertificates: [...documents.educationalCertificates, ...e.target.files]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected files: {(Array.isArray(documents.educationalCertificates) ? documents.educationalCertificates.map(f => f.name).join(", ") : "")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Certificates</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setDocuments({...documents, experienceCertificates: [...documents.experienceCertificates, ...e.target.files]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected files: {(Array.isArray(documents.experienceCertificates) ? documents.experienceCertificates.map(f => f.name).join(", ") : "")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Relieving Letters</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setDocuments({...documents, relievingLetters: [...documents.relievingLetters, ...e.target.files]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected files: {(Array.isArray(documents.relievingLetters) ? documents.relievingLetters.map(f => f.name).join(", ") : "")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Other Documents</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setDocuments({...documents, otherDocuments: [...documents.otherDocuments, ...e.target.files]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected files: {(Array.isArray(documents.otherDocuments) ? documents.otherDocuments.map(f => f.name).join(", ") : "")}
              </p>
            </div>
          </div>
        );
      case "bank":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
              <input
                type="text"
                value={bankDetails.branchName}
                onChange={(e) => setBankDetails({...bankDetails, branchName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
              <select
                value={bankDetails.accountType}
                onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Account Type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Recurring Deposit">Recurring Deposit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number</label>
              <input
                type="text"
                value={bankDetails.panNumber}
                onChange={(e) => setBankDetails({...bankDetails, panNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PF Number</label>
              <input
                type="text"
                value={bankDetails.pfNumber}
                onChange={(e) => setBankDetails({...bankDetails, pfNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ESI Number</label>
              <input
                type="text"
                value={bankDetails.esiNumber}
                onChange={(e) => setBankDetails({...bankDetails, esiNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">UAN Number</label>
              <input
                type="text"
                value={bankDetails.uanNumber}
                onChange={(e) => setBankDetails({...bankDetails, uanNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Declarations</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setBankDetails({...bankDetails, taxDeclarations: [...bankDetails.taxDeclarations, ...e.target.files]})}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Selected files: {(Array.isArray(bankDetails.taxDeclarations) ? bankDetails.taxDeclarations.map(f => f.name).join(", ") : "")}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">Section content will be implemented here</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Profiles</h2>
          <p className="text-gray-600 mt-1">Manage and organize faculty information</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faUsers : faList} />
            <span>{viewMode === "grid" ? "List View" : "Grid View"}</span>
          </button>
          <button
            onClick={handleAddFaculty}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Chemical">Chemical</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Designations</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Research Scholar">Research Scholar</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
              <option value="Adjunct Faculty">Adjunct Faculty</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="employeeId">Sort by Employee ID</option>
              <option value="department">Sort by Department</option>
              <option value="designation">Sort by Designation</option>
              <option value="joiningDate">Sort by Joining Date</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={sortOrder === "asc" ? faSortUp : faSortDown} className="text-gray-600" />
              <span className="text-gray-700">{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
            </button>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchTerm || filterDepartment || filterDesignation) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </span>
            )}
            {filterDepartment && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Department: {filterDepartment}
                <button
                  onClick={() => setFilterDepartment("")}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </span>
            )}
            {filterDesignation && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Designation: {filterDesignation}
                <button
                  onClick={() => setFilterDesignation("")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDepartment("");
                setFilterDesignation("");
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Faculty Cards/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFaculty.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {member.personalDetails?.name?.charAt(0) || "F"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {member.personalDetails?.name || "Unknown Name"}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {member.employmentDetails?.employeeId || "No ID"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUniversity} className="w-4" />
                    <span className="truncate">{member.employmentDetails?.department || "No Department"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUserTie} className="w-4" />
                    <span className="truncate">{member.employmentDetails?.designation || "No Designation"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="w-4" />
                    <span className="truncate">{member.personalDetails?.email || "No Email"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(member.employmentDetails?.status)}`}>
                    {member.employmentDetails?.status || "Unknown"}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditFaculty(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handlePasswordReset(member)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <FontAwesomeIcon icon={faUserLock} />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Faculty Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaculty.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {member.personalDetails?.name?.charAt(0) || "F"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {member.personalDetails?.name || "Unknown Name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.employmentDetails?.employeeId || "No ID"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.employmentDetails?.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.employmentDetails?.designation || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(member.employmentDetails?.status)}`}>
                        {member.employmentDetails?.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{member.personalDetails?.email || "N/A"}</div>
                        <div className="text-gray-500">{member.personalDetails?.phone || "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFaculty(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handlePasswordReset(member)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <FontAwesomeIcon icon={faUserLock} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFaculty.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
          <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No faculty members found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={handleAddFaculty}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 mx-auto"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add First Faculty</span>
          </button>
        </div>
      )}

      {/* Modal for Add/Edit Faculty */}
      {showModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedFaculty ? "Edit Faculty Profile" : "Add New Faculty"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedFaculty ? "Update faculty information" : "Create a new faculty profile"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Section Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                      activeSection === section.id
                        ? `bg-white text-${section.color}-600 border-b-2 border-${section.color}-500`
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <FontAwesomeIcon icon={section.icon} />
                    <span className="hidden sm:inline">{section.name}</span>
                    <span className="sm:hidden">{section.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {renderSectionContent()}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFaculty}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 font-medium"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>Save Faculty</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && !selectedFaculty && (
        <FacultyCreateForm
          onClose={() => setShowModal(false)}
          onCreated={() => {
            // refresh list after create
            (async () => {
              try {
                const response = await facultyApiService.getFaculty();
                const list = Array.isArray(response) ? response : (Array.isArray(response?.results) ? response.results : []);
                const updated = list.map((member) => ({
                  id: member.id,
                  _path: `faculty/${member.id}`,
                  personalDetails: {
                    name: member.name || `${member.first_name || ''} ${member.middle_name || ''} ${member.last_name || ''}`.replace(/\s+/g,' ').trim(),
                    email: member.email || "",
                    phone: member.phone_number || "",
                    dateOfBirth: member.date_of_birth || "",
                    address: member.address_line_1 || ""
                  },
                  employmentDetails: {
                    employeeId: member.employee_id || "",
                    department: member.department || "",
                    designation: member.designation || "",
                    joiningDate: member.date_of_joining || "",
                    status: member.status || "ACTIVE"
                  },
                  academicQualifications: {
                    highestQualification: member.highest_qualification || "",
                    specialization: member.area_of_specialization || ""
                  },
                  bankDetails: { bankName: '', accountNumber: '', ifscCode: '' },
                  authUid: member.id || "",
                  authEmail: member.email || ""
                }));
                setFaculty(updated);
              } catch {}
            })();
          }}
        />
      )}

      {showModal && selectedFaculty && (
        <FacultyCreateForm
          mode="edit"
          facultyId={selectedFaculty.id}
          initialPersonal={{
            name: selectedFaculty.personalDetails?.name || '',
            apaar_faculty_id: selectedFaculty.apaar_faculty_id || '',
            employee_id: selectedFaculty.employmentDetails?.employeeId || '',
            pan_no: selectedFaculty.pan_no || '',
            first_name: selectedFaculty.first_name || '',
            last_name: selectedFaculty.last_name || '',
            middle_name: selectedFaculty.middle_name || '',
            date_of_birth: selectedFaculty.date_of_birth || '',
            gender: selectedFaculty.gender || '',
            email: selectedFaculty.personalDetails?.email || '',
            phone_number: selectedFaculty.personalDetails?.phone || '',
            alternate_phone: selectedFaculty.personalDetails?.alternatePhone || '',
            address_line_1: selectedFaculty.personalDetails?.addressLine1 || selectedFaculty.personalDetails?.address || '',
            address_line_2: selectedFaculty.personalDetails?.addressLine2 || '',
            city: selectedFaculty.personalDetails?.city || '',
            state: selectedFaculty.personalDetails?.state || '',
            postal_code: selectedFaculty.personalDetails?.postalCode || '',
            country: selectedFaculty.personalDetails?.country || 'India',
            achievements: selectedFaculty.personalDetails?.achievements || '',
            research_interests: selectedFaculty.personalDetails?.researchInterests || '',
            emergency_contact_name: selectedFaculty.personalDetails?.emergencyContactName || '',
            emergency_contact_phone: selectedFaculty.personalDetails?.emergencyContactPhone || '',
            emergency_contact_relationship: selectedFaculty.personalDetails?.emergencyContactRelationship || '',
            bio: selectedFaculty.personalDetails?.bio || '',
            notes: selectedFaculty.personalDetails?.notes || ''
          }}
          initialAcademic={{
            highest_degree: selectedFaculty.academicQualifications?.highestDegree || '',
            university: selectedFaculty.academicQualifications?.university || '',
            area_of_specialization: selectedFaculty.academicQualifications?.areaOfSpecialization || '',
            highest_qualification: selectedFaculty.academicQualifications?.highestQualification || '',
            specialization: selectedFaculty.academicQualifications?.specialization || '',
            year_of_completion: selectedFaculty.academicQualifications?.yearOfCompletion || ''
          }}
          initialEmployment={{
            date_of_joining_institution: selectedFaculty.employmentDetails?.dateOfJoiningInstitution || '',
            designation_at_joining: selectedFaculty.employmentDetails?.designationAtJoining || '',
            present_designation: selectedFaculty.employmentDetails?.presentDesignation || '',
            date_designated_as_professor: selectedFaculty.employmentDetails?.dateDesignatedAsProfessor || '',
            nature_of_association: selectedFaculty.employmentDetails?.natureOfAssociation || 'REGULAR',
            contractual_full_time_part_time: selectedFaculty.employmentDetails?.contractualType || '',
            currently_associated: !!selectedFaculty.employmentDetails?.currentlyAssociated,
            date_of_leaving: selectedFaculty.employmentDetails?.dateOfLeaving || '',
            experience_in_current_institute: selectedFaculty.employmentDetails?.experienceInCurrentInstitute || '',
            designation: selectedFaculty.employmentDetails?.designation || '',
            department: selectedFaculty.employmentDetails?.department || '',
            employment_type: selectedFaculty.employmentDetails?.employmentType || '',
            status: selectedFaculty.employmentDetails?.status || 'ACTIVE',
            date_of_joining: selectedFaculty.employmentDetails?.joiningDate || '',
            experience_years: selectedFaculty.employmentDetails?.experienceYears || '',
            previous_institution: selectedFaculty.employmentDetails?.previousInstitution || ''
          }}
          onClose={() => { setShowModal(false); setSelectedFaculty(null); }}
          onCreated={() => {
            setShowModal(false);
            setSelectedFaculty(null);
            // refresh list
            (async () => {
              try {
                const response = await facultyApiService.getFaculty();
                const list = Array.isArray(response) ? response : (Array.isArray(response?.results) ? response.results : []);
                const updated = list.map((member) => ({
                  id: member.id,
                  _path: `faculty/${member.id}`,
                  personalDetails: {
                    name: member.name || `${member.first_name || ''} ${member.middle_name || ''} ${member.last_name || ''}`.replace(/\s+/g,' ').trim(),
                    email: member.email || "",
                    phone: member.phone_number || "",
                    dateOfBirth: member.date_of_birth || "",
                    address: member.address_line_1 || ""
                  },
                  employmentDetails: {
                    employeeId: member.employee_id || "",
                    department: member.department || "",
                    designation: member.designation || "",
                    joiningDate: member.date_of_joining || "",
                    status: member.status || "ACTIVE"
                  },
                  academicQualifications: {
                    highestQualification: member.highest_qualification || "",
                    specialization: member.area_of_specialization || ""
                  },
                  bankDetails: { bankName: '', accountNumber: '', ifscCode: '' },
                  authUid: member.id || "",
                  authEmail: member.email || ""
                }));
                setFaculty(updated);
              } catch {}
            })();
          }}
        />
      )}
    </div>
  );
};

export default FacultyProfileManagement;
