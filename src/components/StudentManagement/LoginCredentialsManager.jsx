import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEyeSlash, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faLock, faUnlock,
  faUserPlus, faEnvelope, faCopy, faArrowsRotate, faSearch, faFilter,
  faRefresh, faBan, faUserCheck, faUserTimes, faShieldAlt, faClock,
  faCalendarAlt, faChartLine, faExclamationCircle, faInfoCircle,
  faCheckDouble, faTimes, faSync, faUserCog, faDatabase, faCloudUpload
} from "@fortawesome/free-solid-svg-icons";
const LoginCredentialsManager = ({ students, onClose }) => {
  const [allStudents, setAllStudents] = useState(Array.isArray(students) ? students : []);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordPattern, setPasswordPattern] = useState("DEFAULT_ROLLNO");
  const [customPassword, setCustomPassword] = useState("");
  const [emailDomain, setEmailDomain] = useState("@mits.ac.in");
  const [usernamePattern, setUsernamePattern] = useState("ROLLNO");
  const [customUsername, setCustomUsername] = useState("{ROLLNO}");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [bulkAction, setBulkAction] = useState("generate");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterSection, setFilterSection] = useState("ALL");
  
  // Enhanced management states
  const [activeTab, setActiveTab] = useState("generate");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, uid, email, rollno
  const [credentialStatus, setCredentialStatus] = useState("ALL");
  const [existingCredentials, setExistingCredentials] = useState([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [bulkOperation, setBulkOperation] = useState("none");
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showUidDetails, setShowUidDetails] = useState(false);

  // Department name mappings (placed before first use)
  const departmentShortToFull = {
    'CIVIL': 'Civil Engineering',
    'ECE': 'Electronics & Communication Engineering',
    'EEE': 'Electrical & Electronics Engineering',
    'MECH': 'Mechanical Engineering',
    'BSH': 'Basic Sciences & Humanities',
    'MGMT': 'Management Studies',
    'MCA': 'Computer Applications',
    'CSE': 'Computer Science & Engineering',
    'CSE_AI': 'Computer Science & Engineering (Artificial Intelligence)',
    'CSE_CS': 'Computer Science & Engineering (Cyber Security)',
    'CST': 'Computer Science & Technology',
    'CSE_DS': 'Computer Science & Engineering (Data Science)',
    'CSE_AIML': 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
    'CSE_NET': 'Computer Science and Engineering (Networks)'
  };

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
      'Computer Science & Engineering (Data science)': 'CSE_DS',
      'Computer Science & Engineering (DataScience)': 'CSE_DS',
      'CSE (Data Science)': 'CSE_DS',
      'CSE-DS': 'CSE_DS',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'CSE_AIML',
      'Computer Science and Engineering (Networks)': 'CSE_NET'
    };
    const normalized = (department || '').toString().trim();
    return shortNames[normalized] || 'UNK';
  };

  // NOTE: deriveGroup moved above first usage to avoid temporal dead zone.
  // Derive department/year/section from explicit fields, studentId like CSE_DS_IV_A_XXXX,
  // or Firestore path students/{DEPT_SHORT}/{SECTION-YEAR}/{ROLLNO}
  const deriveGroup = (s = {}) => {
    const normalize = (v) => (v === undefined || v === null) ? '' : v.toString().trim();
    let dept = normalize(s.department);
    let year = normalize(s.year).toUpperCase();
    let section = normalize(s.section).toUpperCase();
    const sid = normalize(s.studentId);
    const path = normalize(s.primaryDocPath || s.path || s._path);
    if ((!dept || !year || !section) && sid) {
      const parts = sid.split('_');
      if (parts.length >= 3) {
        const maybeDept = parts[0];
        const maybeYear = parts[1];
        const maybeSection = parts[2];
        if (!dept && departmentShortToFull[maybeDept]) dept = departmentShortToFull[maybeDept];
        if (!year && /^[A-ZIVX]+$/.test(maybeYear)) year = maybeYear.toUpperCase();
        if (!section && /^[A-Z]$/.test(maybeSection)) section = maybeSection.toUpperCase();
      }
    }
    // Parse from Firestore path when available
    if ((!dept || !year || !section) && path.includes('/')) {
      // expect students/{DEPT_SHORT}/{SECTION-YEAR or YEAR-SECTION}/{ROLLNO}
      const m = path.match(/students\/([^/]+)\/([^/]+)\//i);
      if (m) {
        const deptShort = m[1];
        const groupKey = m[2];
        const parts = groupKey.split('-');
        if (parts.length === 2) {
          const [part1, part2] = parts;
          // Try to determine if it's Section-Year or Year-Section format
          const isYear = (str) => /^[IVX]+$/i.test(str);
          const isSection = (str) => /^[A-Z]$/i.test(str);
          
          let maybeSection, maybeYear;
          if (isSection(part1) && isYear(part2)) {
            // Section-Year format: A-III, B-III
            maybeSection = part1;
            maybeYear = part2;
          } else if (isYear(part1) && isSection(part2)) {
            // Year-Section format: III-A, III-B
            maybeYear = part1;
            maybeSection = part2;
          }
          
          if (!dept && departmentShortToFull[deptShort]) dept = departmentShortToFull[deptShort];
          if (!section && maybeSection) section = maybeSection.toUpperCase();
          if (!year && maybeYear) year = maybeYear.toUpperCase();
        }
      }
    }
    return { dept, year, section };
  };

  // Keep internal list in sync and fallback-load from collectionGroup if empty
  useEffect(() => {
    if (Array.isArray(students) && students.length > 0) {
      setAllStudents(students);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collectionGroup(db, "students"));
        if (cancelled) return;
        let fetched = snap?.docs?.map(d => ({ id: d.id, _path: d.ref.path, ...d.data() })) || [];

        // If nothing found via collectionGroup (top-level collections aren't included),
        // enumerate known department short codes and common Section-Year subcollections directly.
        if (!fetched || fetched.length === 0) {
          const deptShortCodes = Object.keys(departmentShortToFull);
          const romanYears = ["I", "II", "III", "IV"];
          const sections = [
            "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
          ];
          const combos = [];
          romanYears.forEach(y => sections.forEach(s => combos.push(`${s}-${y}`)));

          const aggregated = [];
          for (const dept of deptShortCodes) {
            for (const groupKey of combos) {
              try {
                const colRef = collection(db, `students/${dept}/${groupKey}`);
                const colSnap = await getDocs(colRef);
                colSnap.forEach(docSnap => {
                  aggregated.push({ id: docSnap.id, _path: docSnap.ref.path, ...docSnap.data() });
                });
              } catch (_) {
                // ignore missing collections
              }
            }
          }
          fetched = aggregated;
        }

        setAllStudents(fetched || []);
      } catch (_) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [students]);

  // Targeted loader: fetch based on selected filters. Supports partial filters by aggregating
  // over missing dimension(s) so the list is populated even when Year or Section is "ALL".
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (filterDepartment === 'ALL') return;
        const deptShort = getDepartmentShortName(filterDepartment);
        if (!deptShort || deptShort === 'UNK') return;

        const romanYears = ["I", "II", "III", "IV"];
        const sections = [
          "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ];

        const yearsToFetch = (filterYear === 'ALL') ? romanYears : [filterYear];
        const sectionsToFetch = (filterSection === 'ALL') ? sections : [filterSection];

        const aggregated = [];
        for (const y of yearsToFetch) {
          for (const s of sectionsToFetch) {
            try {
              const groupKey = `${s}-${y}`;
              const colRef = collection(db, `students/${deptShort}/${groupKey}`);
              const snap = await getDocs(colRef);
              snap.forEach(docSnap => {
                const data = docSnap.data() || {};
                aggregated.push({
                  id: docSnap.id,
                  rollNo: docSnap.id,
                  department: filterDepartment,
                  year: y,
                  section: s,
                  _path: docSnap.ref.path,
                  ...data
                });
              });
            } catch (_) {
              // ignore missing collections
            }
          }
        }
        if (cancelled) return;
        setAllStudents(aggregated);
      } catch (_) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [filterDepartment, filterYear, filterSection]);

  // Load existing credentials for management
  useEffect(() => {
    if (activeTab === "manage") {
      loadExistingCredentials();
    }
  }, [activeTab, filterDepartment, filterYear, filterSection, credentialStatus]);

  // Load existing credentials from Firestore with enhanced UID linking
  const loadExistingCredentials = async () => {
    setIsLoadingExisting(true);
    try {
      const studentsWithCredentials = [];
      
      // If we have students loaded, check their credentials
      if (allStudents && allStudents.length > 0) {
        for (const student of allStudents) {
          const studentRef = getStudentDocRef(student);
          try {
            const docSnap = await getDoc(studentRef);
            if (docSnap.exists() && docSnap.data().hasLoginCredentials) {
              const data = docSnap.data();
              studentsWithCredentials.push({
                ...student,
                username: data.username,
                email: data.email,
                hasLoginCredentials: true,
                credentialsGeneratedAt: data.credentialsGeneratedAt,
                authUid: data.authUid,
                lastLoginAt: data.lastLoginAt,
                isActive: data.isActive !== false,
                passwordResetAt: data.passwordResetAt,
                deactivatedAt: data.deactivatedAt,
                activatedAt: data.activatedAt,
                // Enhanced UID information
                uidShort: data.authUid ? data.authUid.substring(0, 8) + '...' : null,
                uidFull: data.authUid,
                hasAuthAccount: !!data.authUid
              });
            }
          } catch (error) {
            console.warn(`Error loading credentials for ${student.id}:`, error);
          }
        }
      } else {
        // If no students loaded, fetch from all departments
        const deptShortCodes = Object.keys(departmentShortToFull);
        const romanYears = ["I", "II", "III", "IV"];
        const sections = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
        
        for (const deptShort of deptShortCodes) {
          for (const year of romanYears) {
            for (const section of sections) {
              try {
                // Try both path formats
                const pathFormats = [
                  `${section}-${year}`,
                  `${year}-${section}`
                ];
                
                for (const groupKey of pathFormats) {
                  try {
                    const colRef = collection(db, `students/${deptShort}/${groupKey}`);
                    const snap = await getDocs(colRef);
                    
                    for (const docSnap of snap.docs) {
                      const studentData = docSnap.data();
                      if (studentData.hasLoginCredentials) {
                        studentsWithCredentials.push({
                          id: docSnap.id,
                          rollNo: docSnap.id,
                          department: departmentShortToFull[deptShort],
                          year: year,
                          section: section,
                          _path: docSnap.ref.path,
                          username: studentData.username,
                          email: studentData.email,
                          hasLoginCredentials: true,
                          credentialsGeneratedAt: studentData.credentialsGeneratedAt,
                          authUid: studentData.authUid,
                          lastLoginAt: studentData.lastLoginAt,
                          isActive: studentData.isActive !== false,
                          passwordResetAt: studentData.passwordResetAt,
                          deactivatedAt: studentData.deactivatedAt,
                          activatedAt: studentData.activatedAt,
                          // Enhanced UID information
                          uidShort: studentData.authUid ? studentData.authUid.substring(0, 8) + '...' : null,
                          uidFull: studentData.authUid,
                          hasAuthAccount: !!studentData.authUid,
                          ...studentData
                        });
                      }
                    }
                  } catch (error) {
                    // Ignore missing collections
                  }
                }
              } catch (error) {
                // Ignore errors for this combination
              }
            }
          }
        }
      }
      
      setExistingCredentials(studentsWithCredentials);
      addNotification(`Loaded ${studentsWithCredentials.length} existing credentials`, "success");
    } catch (error) {
      console.error("Error loading existing credentials:", error);
      addNotification("Error loading existing credentials", "error");
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Notification system
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Password patterns
  const passwordPatterns = [
    { id: "DEFAULT_ROLLNO", name: "Default (Roll Number)", description: "Password equals roll number" },
    { id: "ROLLNO-DOB", name: "Roll Number + DOB", description: "RollNo + Date of Birth" },
    { id: "ROLLNO-YEAR", name: "Roll Number + Year", description: "RollNo + Admission Year" },
    { id: "NAME-DOB", name: "Name + DOB", description: "First Name + Date of Birth" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" },
    { id: "RANDOM", name: "Random Password", description: "Generate random secure password" }
  ];

  // Username patterns
  const usernamePatterns = [
    { id: "ROLLNO", name: "Roll Number", description: "Use roll number as username" },
    { id: "EMAIL", name: "Email", description: "Use email as username" },
    { id: "NAME-ROLLNO", name: "Name + Roll No", description: "First Name + Roll Number" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" }
  ];

  // Generate username based on pattern
  const generateUsername = (student, pattern) => {
    const rollNo = student.rollNo || "";
    const email = student.email || "";
    const firstName = (student.firstName || student.name?.split(' ')[0] || "").toLowerCase();
    const lastName = (student.lastName || student.name?.split(' ')[1] || "").toLowerCase();

    switch (pattern) {
      case "ROLLNO":
        return rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      case "EMAIL":
        return email.split('@')[0];
      case "NAME-ROLLNO":
        return `${firstName}${rollNo}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      case "CUSTOM":
        return customUsername
          .replace("{ROLLNO}", rollNo)
          .replace("{EMAIL}", email.split('@')[0])
          .replace("{FIRSTNAME}", firstName)
          .replace("{LASTNAME}", lastName)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
      default:
        return rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  };

  // Generate password based on pattern
  const generatePassword = (student, pattern) => {
    const rollNo = student.rollNo || "";
    const dob = student.dateOfBirth || "";
    const year = student.admissionDate ? new Date(student.admissionDate).getFullYear() : new Date().getFullYear();
    const firstName = student.firstName || student.name?.split(' ')[0] || "";

    switch (pattern) {
      case "DEFAULT_ROLLNO":
        return `${rollNo}`;
      case "ROLLNO-DOB":
        const dobPart = dob.replace(/-/g, "").slice(-4);
        return `${rollNo}${dobPart}`;
      case "ROLLNO-YEAR":
        return `${rollNo}${year}`;
      case "NAME-DOB":
        const namePart = firstName.slice(0, 3).toLowerCase();
        const dobPart2 = dob.replace(/-/g, "").slice(-4);
        return `${namePart}${dobPart2}`;
      case "CUSTOM":
        return customPassword
          .replace("{ROLLNO}", rollNo)
          .replace("{DOB}", dob.replace(/-/g, ""))
          .replace("{YEAR}", year)
          .replace("{FIRSTNAME}", firstName);
      case "RANDOM":
        return generateRandomPassword();
      default:
        return `${rollNo}${dob.replace(/-/g, "").slice(-4)}`;
    }
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = includeSpecialChars ? chars + specialChars : chars;
    
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    return password;
  };

  // Generate email
  const generateEmail = (student) => {
    // Prefer roll number; if absent, fallback to generated username (email-safe)
    const fallbackUser = generateUsername(student, usernamePattern) || '';
    const base = (student.rollNo || fallbackUser || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${base}${emailDomain}`;
  };

  // On-demand fetcher used as a fallback when the local pool is empty
  const fetchStudentsByFilters = async () => {
    try {
      console.log('fetchStudentsByFilters called with:', { filterDepartment, filterYear, filterSection });
      if (filterDepartment === 'ALL') return [];
      const deptShort = getDepartmentShortName(filterDepartment);
      console.log('Department short name:', deptShort);
      if (!deptShort || deptShort === 'UNK') return [];
      const romanYears = ["I","II","III","IV"];
      const sections = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
      const yearsToFetch = (filterYear === 'ALL') ? romanYears : [filterYear];
      const sectionsToFetch = (filterSection === 'ALL') ? sections : [filterSection];
      console.log('Will fetch from:', { yearsToFetch, sectionsToFetch });
      const aggregated = [];
      
      // Try both path formats: Section-Year and Year-Section
      const pathFormats = [
        (s, y) => `${s}-${y}`, // A-III, B-III format
        (s, y) => `${y}-${s}`  // III-A, III-B format
      ];
      
      for (const y of yearsToFetch) {
        for (const s of sectionsToFetch) {
          for (const formatFn of pathFormats) {
            try {
              const groupKey = formatFn(s, y);
              console.log('Trying path:', `students/${deptShort}/${groupKey}`);
              const colRef = collection(db, `students/${deptShort}/${groupKey}`);
              const snap = await getDocs(colRef);
              console.log(`Found ${snap.size} students in ${groupKey}`);
              if (snap.size > 0) {
                snap.forEach(docSnap => {
                  const data = docSnap.data() || {};
                  aggregated.push({
                    id: docSnap.id,
                    rollNo: docSnap.id,
                    department: filterDepartment,
                    year: y,
                    section: s,
                    _path: docSnap.ref.path,
                    ...data
                  });
                });
                // If we found students with this format, skip the other format for this year/section combo
                break;
              }
            } catch (_) {
              // ignore missing collections
            }
          }
        }
      }
      console.log('Total aggregated students:', aggregated.length);
      return aggregated;
    } catch (_) {
      console.error('Error in fetchStudentsByFilters:', _);
      return [];
    }
  };

  // Generate credentials for selected students and return the list
  const generateCredentials = async () => {
    setIsGenerating(true);
    console.log('generateCredentials called');
    // Build filtered pool based on Department/Year/Section
    const matchesFilters = (s) => {
      const g = deriveGroup(s);
      const deptOk = filterDepartment === 'ALL' || (g.dept || '') === filterDepartment;
      const yearOk = filterYear === 'ALL' || (g.year || '') === filterYear;
      const secOk = filterSection === 'ALL' || (g.section || '') === filterSection;
      return deptOk && yearOk && secOk;
    };
    const source = (allStudents && allStudents.length > 0) ? allStudents : (students || []);
    console.log('Source students count:', source.length);
    let basePool = source.filter(matchesFilters);
    console.log('After filter, basePool count:', basePool.length);
    // If nothing is in local state, try an on-demand fetch
    if (!basePool || basePool.length === 0) {
      console.log('No students in local pool, fetching from Firestore...');
      const fetched = await fetchStudentsByFilters();
      console.log('Fetched students count:', fetched.length);
      if (fetched && fetched.length > 0) {
        setAllStudents(fetched);
        basePool = fetched.filter(matchesFilters);
        // If filters are overly restrictive or stale (e.g., UI shows All but state is old),
        // and we still have zero after filtering, fall back to using fetched results.
        if (!basePool || basePool.length === 0) {
          console.log('Filtered fetched results are empty; falling back to fetched list.');
          basePool = fetched;
        }
        console.log('After setting fetched students, basePool count:', basePool.length);
      }
    }
    if (selectedStudents && selectedStudents.length > 0) {
      const selectedSet = new Set(selectedStudents);
      const intersected = basePool.filter(s => selectedSet.has(s.id));
      // If the selection is stale and yields no matches for current filters,
      // fall back to using the filtered pool instead of returning empty.
      basePool = (intersected.length > 0) ? intersected : basePool;
      console.log('After selection filter, basePool count:', basePool.length);
    }
    const generated = basePool.map(student => {
      const username = generateUsername(student, usernamePattern);
      const password = generatePassword(student, passwordPattern);
      const email = generateEmail(student);
      return {
        ...student,
        generatedUsername: username,
        generatedPassword: password,
        generatedEmail: email,
        hasLoginCredentials: true
      };
    });
    setGeneratedCredentials(generated);
    setIsGenerating(false);
    console.log('Final generated credentials count:', generated.length);
    return generated;
  };

  // Derive filter options dynamically with sensible fallbacks when data is not yet loaded
  const sourceForOptions = (allStudents && allStudents.length > 0) ? allStudents : (students || []);
  const derivedDepartments = Array.from(new Set((sourceForOptions || []).map(s => deriveGroup(s).dept).filter(Boolean))).sort();
  const fallbackDepartments = Object.values(departmentShortToFull);
  const availableDepartments = (derivedDepartments.length > 0 ? derivedDepartments : fallbackDepartments);

  const derivedYears = Array.from(new Set(
    (sourceForOptions || [])
      .filter(s => filterDepartment === 'ALL' || deriveGroup(s).dept === filterDepartment)
      .map(s => deriveGroup(s).year)
      .filter(Boolean)
  )).sort();
  const fallbackYears = ["I","II","III","IV"];
  const availableYears = (derivedYears.length > 0 ? derivedYears : fallbackYears);

  const derivedSections = Array.from(new Set(
    (sourceForOptions || [])
      .filter(s => (filterDepartment === 'ALL' || deriveGroup(s).dept === filterDepartment) && (filterYear === 'ALL' || deriveGroup(s).year === filterYear))
      .map(s => deriveGroup(s).section)
      .filter(Boolean)
  )).sort();
  const fallbackSections = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
  ];
  const availableSections = (derivedSections.length > 0 ? derivedSections : fallbackSections);

  // (moved mapping helpers above to avoid temporal dead zone errors)

  

  // Helper: compute student doc ref in hierarchical structure
  const getStudentDocRef = (student) => {
    const group = deriveGroup(student);
    const deptShort = getDepartmentShortName(group.dept || student.department);
    const sanitizedDept = (deptShort || 'UNK').toString().replace(/[^A-Z0-9_]/gi, '');
    const sanitizedYear = (group.year || student.year || 'U').toString().replace(/[^A-Z0-9]/gi, '');
    const sanitizedSection = (group.section || student.section || 'U').toString().replace(/[^A-Z0-9]/gi, '');
    // Path format uses Section-Year (e.g., B-III)
    const groupKey = `${sanitizedSection}-${sanitizedYear}`;
    const rollId = (student.rollNo || student.id || '').toString();
    return doc(db, `students/${sanitizedDept}/${groupKey}/${rollId}`);
  };

  // Save credentials to database (optionally accept explicit list)
  const saveCredentials = async (listOverride) => {
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      const toWrite = Array.isArray(listOverride) ? listOverride : generatedCredentials;
      for (const student of toWrite) {
        const studentRef = getStudentDocRef(student);
        // Write student credentials (merge-safe in case doc is missing)
        batch.set(studentRef, {
          username: student.generatedUsername,
          password: student.generatedPassword, // In production, this should be hashed
          email: student.generatedEmail,
          hasLoginCredentials: true,
          credentialsGeneratedAt: new Date(),
          credentialsPattern: {
            username: usernamePattern,
            password: passwordPattern
          }
        }, { merge: true });

        // Create user account in Firebase Auth
        try {
          const auth = getAuth();
          // If email already exists, skip creation and just mark in Firestore
          const methods = await fetchSignInMethodsForEmail(auth, student.generatedEmail);
          let createdUser = null;
          if (!methods || methods.length === 0) {
            try {
              createdUser = await createUserWithEmailAndPassword(
                auth,
                student.generatedEmail,
                student.generatedPassword
              );
            } catch (createErr) {
              // If account already exists or password policy mismatch, continue gracefully
              if (createErr?.code === 'auth/email-already-in-use') {
                console.info(`Auth account already exists for ${student.generatedEmail}, skipping creation.`);
              } else {
                console.warn(`Auth account creation failed for ${student.generatedEmail}:`, createErr);
              }
            }
          } else {
            // Already exists; we won't attempt to create again
            console.info(`Sign-in methods exist for ${student.generatedEmail}; not creating.`);
          }

          const uid = createdUser?.user?.uid || null;
          if (uid) {
            batch.set(studentRef, {
              authUid: uid,
              authEmail: student.generatedEmail,
              authCreatedAt: serverTimestamp(),
              rollNoWithUid: `${student.rollNo || student.id || ''}_${uid}`
            }, { merge: true });

            // Create a flat index doc keyed by Auth UID for quick lookups
            const deptShort = getDepartmentShortName(student.department);
            const sanitizedDept = (deptShort || 'UNK').toString().replace(/[^A-Z0-9_]/gi, '');
            const sanitizedYear = (student.year || 'U').toString().replace(/[^A-Z0-9]/gi, '');
            const sanitizedSection = (student.section || 'U').toString().replace(/[^A-Z0-9]/gi, '');
            const groupKey = `${sanitizedSection}-${sanitizedYear}`;
            const rollId = (student.rollNo || student.id || '').toString();
            const primaryDocPath = `students/${sanitizedDept}/${groupKey}/${rollId}`;

            const byUidRef = doc(db, `studentsByUid/${uid}`);
            batch.set(byUidRef, {
              authUid: uid,
              authEmail: student.generatedEmail,
              department: student.department,
              year: student.year,
              section: student.section,
              rollNo: rollId,
              primaryDocPath,
              updatedAt: serverTimestamp()
            }, { merge: true });

            // Optional alias doc within the same group using UID as document id (read-only pointer)
            const aliasRef = doc(db, `students/${sanitizedDept}/${groupKey}/${uid}`);
            batch.set(aliasRef, {
              isAlias: true,
              authUid: uid,
              primaryDocId: rollId,
              primaryDocPath,
              department: student.department,
              year: student.year,
              section: student.section,
              createdAt: serverTimestamp()
            }, { merge: true });
          }
          // Optional pacing to avoid rate limits
          await new Promise(r => setTimeout(r, 35));
        } catch (authError) {
          console.warn(`Failed creating/checking auth for ${student.generatedEmail}:`, authError);
        }
      }

      await batch.commit();
      alert("Login credentials saved successfully!");
      setGeneratedCredentials([]);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving credentials:", error);
      alert("Error saving credentials. Please try again.");
      setIsSaving(false);
    }
  };

  // Combined action: generate credentials, then immediately save (creates Auth and links UID)
  const generateAndSave = async () => {
    const generated = await generateCredentials();
    if (generated && generated.length > 0) {
      await saveCredentials(generated);
      addNotification(`Successfully generated and saved credentials for ${generated.length} students`, "success");
    } else {
      addNotification('No students matched the selected filters.', "warning");
    }
  };

  // Enhanced credential management functions
  const resetPassword = async (student) => {
    try {
      const newPassword = generatePassword(student, passwordPattern);
      const auth = getAuth();
      
      // Update in Firestore
      const studentRef = getStudentDocRef(student);
      await updateDoc(studentRef, {
        password: newPassword,
        passwordResetAt: serverTimestamp(),
        passwordResetBy: "admin"
      });

      // Send password reset email if Auth account exists
      if (student.authUid) {
        try {
          await sendPasswordResetEmail(auth, student.email);
          addNotification(`Password reset email sent to ${student.email}`, "success");
        } catch (emailError) {
          addNotification(`Password updated but email failed for ${student.email}`, "warning");
        }
      }
      
      addNotification(`Password reset for ${student.name || student.rollNo}`, "success");
    } catch (error) {
      console.error("Error resetting password:", error);
      addNotification(`Failed to reset password for ${student.name || student.rollNo}`, "error");
    }
  };

  const deactivateAccount = async (student) => {
    try {
      const studentRef = getStudentDocRef(student);
      await updateDoc(studentRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: "admin"
      });
      
      addNotification(`Account deactivated for ${student.name || student.rollNo}`, "success");
    } catch (error) {
      console.error("Error deactivating account:", error);
      addNotification(`Failed to deactivate account for ${student.name || student.rollNo}`, "error");
    }
  };

  const activateAccount = async (student) => {
    try {
      const studentRef = getStudentDocRef(student);
      await updateDoc(studentRef, {
        isActive: true,
        activatedAt: serverTimestamp(),
        activatedBy: "admin"
      });
      
      addNotification(`Account activated for ${student.name || student.rollNo}`, "success");
    } catch (error) {
      console.error("Error activating account:", error);
      addNotification(`Failed to activate account for ${student.name || student.rollNo}`, "error");
    }
  };

  const deleteCredentials = async (student) => {
    if (!confirm(`Are you sure you want to delete credentials for ${student.name || student.rollNo}?`)) {
      return;
    }
    
    try {
      const studentRef = getStudentDocRef(student);
      await updateDoc(studentRef, {
        hasLoginCredentials: false,
        username: null,
        password: null,
        email: null,
        authUid: null,
        deletedAt: serverTimestamp(),
        deletedBy: "admin"
      });
      
      addNotification(`Credentials deleted for ${student.name || student.rollNo}`, "success");
    } catch (error) {
      console.error("Error deleting credentials:", error);
      addNotification(`Failed to delete credentials for ${student.name || student.rollNo}`, "error");
    }
  };

  // Bulk operations
  const performBulkOperation = async (operation) => {
    if (selectedForAction.length === 0) {
      addNotification("Please select students for bulk operation", "warning");
      return;
    }

    setActionInProgress(true);
    setOperationProgress({ current: 0, total: selectedForAction.length });

    try {
      for (let i = 0; i < selectedForAction.length; i++) {
        const student = selectedForAction[i];
        setOperationProgress({ current: i + 1, total: selectedForAction.length });

        switch (operation) {
          case "reset_password":
            await resetPassword(student);
            break;
          case "deactivate":
            await deactivateAccount(student);
            break;
          case "activate":
            await activateAccount(student);
            break;
          case "delete":
            await deleteCredentials(student);
            break;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      addNotification(`Bulk ${operation} completed for ${selectedForAction.length} students`, "success");
      setSelectedForAction([]);
      loadExistingCredentials(); // Refresh the list
    } catch (error) {
      console.error("Bulk operation error:", error);
      addNotification(`Bulk operation failed: ${error.message}`, "error");
    } finally {
      setActionInProgress(false);
      setOperationProgress({ current: 0, total: 0 });
    }
  };

  // Enhanced export functionality
  const exportToCSV = (data = generatedCredentials, type = "generated") => {
    let csvContent = [];
    
    if (type === "generated") {
      csvContent = [
        "Name,Roll Number,Username,Email,Password,Department,Year,Section,Status",
        ...data.map(student => 
          `"${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}","${student.rollNo}","${student.generatedUsername}","${student.generatedEmail}","${student.generatedPassword}","${student.department}","${student.year}","${student.section}","Generated"`
        )
      ];
    } else if (type === "existing") {
      csvContent = [
        "Name,Roll Number,Username,Email,Department,Year,Section,Status,Created Date,Last Login,Auth UID",
        ...data.map(student => 
          `"${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}","${student.rollNo}","${student.username}","${student.email}","${student.department}","${student.year}","${student.section}","${student.isActive !== false ? 'Active' : 'Inactive'}","${student.credentialsGeneratedAt ? new Date(student.credentialsGeneratedAt.toDate()).toLocaleDateString() : 'N/A'}","${student.lastLoginAt ? new Date(student.lastLoginAt.toDate()).toLocaleDateString() : 'N/A'}","${student.authUid || 'N/A'}"`
        )
      ];
    }
    
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_credentials_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addNotification(`Exported ${data.length} credentials to CSV`, "success");
  };

  // Export to Excel (JSON format that can be opened in Excel)
  const exportToExcel = (data = generatedCredentials, type = "generated") => {
    let excelData = [];
    
    if (type === "generated") {
      excelData = data.map(student => ({
        Name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        'Roll Number': student.rollNo,
        Username: student.generatedUsername,
        Email: student.generatedEmail,
        Password: student.generatedPassword,
        Department: student.department,
        Year: student.year,
        Section: student.section,
        Status: 'Generated'
      }));
    } else if (type === "existing") {
      excelData = data.map(student => ({
        Name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        'Roll Number': student.rollNo,
        Username: student.username,
        Email: student.email,
        Department: student.department,
        Year: student.year,
        Section: student.section,
        Status: student.isActive !== false ? 'Active' : 'Inactive',
        'Created Date': student.credentialsGeneratedAt ? new Date(student.credentialsGeneratedAt.toDate()).toLocaleDateString() : 'N/A',
        'Last Login': student.lastLoginAt ? new Date(student.lastLoginAt.toDate()).toLocaleDateString() : 'N/A',
        'Auth UID': student.authUid || 'N/A'
      }));
    }
    
    const jsonString = JSON.stringify(excelData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_credentials_${type}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    addNotification(`Exported ${data.length} credentials to JSON/Excel format`, "success");
  };

  // Enhanced search functionality with UID support
  const getFilteredStudents = () => {
    return existingCredentials.filter(student => {
      let matchesSearch = true;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        switch (searchType) {
          case "uid":
            matchesSearch = student.authUid?.toLowerCase().includes(term) || 
                           student.uidShort?.toLowerCase().includes(term);
            break;
          case "email":
            matchesSearch = student.email?.toLowerCase().includes(term);
            break;
          case "rollno":
            matchesSearch = student.rollNo?.toLowerCase().includes(term);
            break;
          case "all":
          default:
            matchesSearch = student.name?.toLowerCase().includes(term) ||
                           student.rollNo?.toLowerCase().includes(term) ||
                           student.email?.toLowerCase().includes(term) ||
                           student.authUid?.toLowerCase().includes(term) ||
                           student.uidShort?.toLowerCase().includes(term);
            break;
        }
      }
      
      const matchesStatus = credentialStatus === "ALL" ||
        (credentialStatus === "ACTIVE" && student.isActive !== false) ||
        (credentialStatus === "INACTIVE" && student.isActive === false);
      
      return matchesSearch && matchesStatus;
    });
  };

  // Find student by UID
  const findStudentByUid = (uid) => {
    return existingCredentials.find(student => 
      student.authUid === uid || student.uidShort?.includes(uid.substring(0, 8))
    );
  };

  // Copy UID to clipboard
  const copyUidToClipboard = (uid) => {
    navigator.clipboard.writeText(uid).then(() => {
      addNotification("UID copied to clipboard", "success");
    });
  };

  // Export filtered data
  const exportFilteredData = () => {
    const filteredData = getFilteredStudents();
    
    if (filteredData.length === 0) {
      addNotification("No data to export", "warning");
      return;
    }
    
    exportToCSV(filteredData, "existing");
  };

  // Copy credentials to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Select all students
  const selectAllStudents = () => {
    const source = (allStudents && allStudents.length > 0) ? allStudents : (students || []);
    const g = (s) => deriveGroup(s);
    const ids = source
      .filter(s => (filterDepartment === 'ALL' || g(s).dept === filterDepartment)
                && (filterYear === 'ALL' || g(s).year === filterYear)
                && (filterSection === 'ALL' || g(s).section === filterSection))
      .map(s => s.id);
    setSelectedStudents(ids);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Bulk actions
  const performBulkAction = async () => {
    switch (bulkAction) {
      case "generate":
        await generateCredentials();
        break;
      case "reset":
        // Reset credentials for selected students
        break;
      case "disable":
        // Disable accounts for selected students
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <FontAwesomeIcon icon={faKey} className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Login Credentials Manager</h2>
              <p className="text-gray-600">Generate and manage student login credentials</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="bg-white px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faCog} className="text-gray-600" />
            </button>
            <button
              onClick={loadExistingCredentials}
              className="bg-white px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faRefresh} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              notification.type === "success" ? "bg-green-500 text-white" :
              notification.type === "error" ? "bg-red-500 text-white" :
              notification.type === "warning" ? "bg-yellow-500 text-white" :
              "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon 
                icon={
                  notification.type === "success" ? faCheckCircle :
                  notification.type === "error" ? faExclamationCircle :
                  notification.type === "warning" ? faExclamationTriangle :
                  faInfoCircle
                } 
              />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      {actionInProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faSync} className="text-blue-500 animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                Processing {operationProgress.current} of {operationProgress.total} students...
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(operationProgress.current / operationProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("generate")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "generate"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Generate Credentials
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "manage"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faUserCog} className="mr-2" />
              Manage Existing
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "analytics"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "generate" && (
        <>
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => { setFilterDepartment(e.target.value); setFilterYear('ALL'); setFilterSection('ALL'); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All</option>
                {availableDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filterYear}
                onChange={(e) => { setFilterYear(e.target.value); setFilterSection('ALL'); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All</option>
                {availableSections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Username Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username Pattern</label>
            <select
              value={usernamePattern}
              onChange={(e) => setUsernamePattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {usernamePatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Password Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Pattern</label>
            <select
              value={passwordPattern}
              onChange={(e) => setPasswordPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {passwordPatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Email Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Domain</label>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              placeholder="@mits.ac.in"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password Length (for random passwords) */}
          {passwordPattern === "RANDOM" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Length</label>
              <input
                type="number"
                value={passwordLength}
                onChange={(e) => setPasswordLength(parseInt(e.target.value) || 8)}
                min="6"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Include Special Characters */}
          {passwordPattern === "RANDOM" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSpecialChars"
                checked={includeSpecialChars}
                onChange={(e) => setIncludeSpecialChars(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeSpecialChars" className="ml-2 text-sm text-gray-700">
                Include Special Characters
              </label>
            </div>
          )}

          {/* Custom Username Pattern */}
          {usernamePattern === "CUSTOM" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Username Pattern</label>
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g., {FIRSTNAME}.{ROLLNO}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: {"{ROLLNO}"}, {"{EMAIL}"}, {"{FIRSTNAME}"}, {"{LASTNAME}"}
              </p>
            </div>
          )}

          {/* Custom Password Pattern */}
          {passwordPattern === "CUSTOM" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Password Pattern</label>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="e.g., {ROLLNO}#{DOB}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: {"{ROLLNO}"}, {"{DOB}"}, {"{YEAR}"}, {"{FIRSTNAME}"}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateAndSave}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faKey} />
            <span>{isGenerating ? 'Generating...' : 'Generate Credentials'}</span>
          </button>

          <button
            onClick={selectAllStudents}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Select All Students</span>
          </button>

          <button
            onClick={clearSelection}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUndo} />
            <span>Clear Selection</span>
          </button>

          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={showPasswords ? faEyeSlash : faEye} />
            <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
          </button>
        </div>
      </div>

      {/* Student Selection */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Students ({selectedStudents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(allStudents || students || []).filter(s => selectedStudents.includes(s.id)).map(student => (
              <div key={student.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudentSelection(student.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.department} • {student.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Credentials */}
      {generatedCredentials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Credentials ({generatedCredentials.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={saveCredentials}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>{isSaving ? 'Saving...' : 'Save to Database'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedCredentials.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.department} • {student.year}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-600">{student.generatedUsername}</span>
                        <button
                          onClick={() => copyToClipboard(student.generatedUsername)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{student.generatedEmail}</span>
                        <button
                          onClick={() => copyToClipboard(student.generatedEmail)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {showPasswords ? student.generatedPassword : '••••••••'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(student.generatedPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Generated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

          {/* Pattern Examples */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Username Patterns</h4>
                <div className="space-y-2">
                  {usernamePatterns.map(p => (
                    <div key={p.id} className="p-2 border border-gray-200 rounded">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Password Patterns</h4>
                <div className="space-y-2">
                  {passwordPatterns.map(p => (
                    <div key={p.id} className="p-2 border border-gray-200 rounded">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "manage" && (
        <div className="space-y-6">
          {/* Enhanced Search and Filter with UID Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={
                        searchType === "uid" ? "Search by UID..." :
                        searchType === "email" ? "Search by email..." :
                        searchType === "rollno" ? "Search by roll number..." :
                        "Search by name, roll number, email, or UID..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Fields</option>
                    <option value="uid">UID Only</option>
                    <option value="email">Email Only</option>
                    <option value="rollno">Roll No Only</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={credentialStatus}
                  onChange={(e) => setCredentialStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
                <button
                  onClick={() => setShowUidDetails(!showUidDetails)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>UID Details</span>
                </button>
                <button
                  onClick={loadExistingCredentials}
                  disabled={isLoadingExisting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={isLoadingExisting ? faSync : faRefresh} className={isLoadingExisting ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCheck} className="text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600">Total</p>
                    <p className="text-lg font-bold text-blue-800">{existingCredentials.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCheck} className="text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-green-600">Active</p>
                    <p className="text-lg font-bold text-green-800">
                      {existingCredentials.filter(s => s.isActive !== false).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserTimes} className="text-red-500 mr-2" />
                  <div>
                    <p className="text-sm text-red-600">Inactive</p>
                    <p className="text-lg font-bold text-red-800">
                      {existingCredentials.filter(s => s.isActive === false).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="text-yellow-500 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-600">Selected</p>
                    <p className="text-lg font-bold text-yellow-800">{selectedForAction.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* UID Details Section */}
            {showUidDetails && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                  UID Information & Quick Find
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs text-gray-500 mb-1">Total with Auth UIDs</div>
                    <div className="text-lg font-bold text-purple-600">
                      {existingCredentials.filter(s => s.hasAuthAccount).length}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs text-gray-500 mb-1">Without Auth UIDs</div>
                    <div className="text-lg font-bold text-orange-600">
                      {existingCredentials.filter(s => !s.hasAuthAccount).length}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs text-gray-500 mb-1">UID Search</div>
                    <input
                      type="text"
                      placeholder="Enter UID to find student..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      onChange={(e) => {
                        const uid = e.target.value;
                        if (uid.length >= 8) {
                          const found = findStudentByUid(uid);
                          if (found) {
                            addNotification(`Found: ${found.name || found.rollNo}`, "success");
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Bulk Actions and Export */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {selectedForAction.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                      {selectedForAction.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedForAction([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Export Buttons */}
                <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                  <button
                    onClick={() => exportToCSV(existingCredentials, "existing")}
                    disabled={existingCredentials.length === 0}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => exportToExcel(existingCredentials, "existing")}
                    disabled={existingCredentials.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                  >
                    <FontAwesomeIcon icon={faDatabase} />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={exportFilteredData}
                    disabled={existingCredentials.length === 0}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Export Filtered</span>
                  </button>
                </div>
                
                {/* Bulk Actions */}
                {selectedForAction.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => performBulkOperation("reset_password")}
                      disabled={actionInProgress}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faKey} />
                      <span>Reset Passwords</span>
                    </button>
                    <button
                      onClick={() => performBulkOperation("deactivate")}
                      disabled={actionInProgress}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faBan} />
                      <span>Deactivate</span>
                    </button>
                    <button
                      onClick={() => performBulkOperation("activate")}
                      disabled={actionInProgress}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faUserCheck} />
                      <span>Activate</span>
                    </button>
                    <button
                      onClick={() => performBulkOperation("delete")}
                      disabled={actionInProgress}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

                      {/* Enhanced Existing Credentials Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Existing Credentials ({existingCredentials.length})
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Click on any row to view details</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedForAction.length === existingCredentials.length && existingCredentials.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForAction(existingCredentials);
                            } else {
                              setSelectedForAction([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credentials</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingExisting ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center space-x-2">
                            <FontAwesomeIcon icon={faSync} className="animate-spin" />
                            <span>Loading credentials...</span>
                          </div>
                        </td>
                      </tr>
                    ) : existingCredentials.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <FontAwesomeIcon icon={faUserTimes} className="text-2xl text-gray-300" />
                            <span>No existing credentials found</span>
                            <button
                              onClick={loadExistingCredentials}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Click here to refresh
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getFilteredStudents().map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedForAction.some(s => s.id === student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedForAction(prev => [...prev, student]);
                                  } else {
                                    setSelectedForAction(prev => prev.filter(s => s.id !== student.id));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {(student.name || student.rollNo || 'S').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-gray-500">{student.rollNo}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">{student.username}</div>
                                <div className="text-gray-500">{student.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.hasAuthAccount ? (
                                <div className="text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                      {student.uidShort}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyUidToClipboard(student.authUid);
                                      }}
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Copy full UID"
                                    >
                                      <FontAwesomeIcon icon={faCopy} className="text-xs" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                    Auth Account
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400">
                                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                  No Auth UID
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                student.isActive !== false 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={student.isActive !== false ? faUserCheck : faUserTimes} 
                                  className="mr-1" 
                                />
                                {student.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div>{student.department}</div>
                                <div className="text-gray-500">{student.year} • {student.section}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.credentialsGeneratedAt ? 
                                <div>
                                  <div>{new Date(student.credentialsGeneratedAt.toDate()).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(student.credentialsGeneratedAt.toDate()).toLocaleTimeString()}
                                  </div>
                                </div> : 
                                'N/A'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.lastLoginAt ? 
                                <div>
                                  <div>{new Date(student.lastLoginAt.toDate()).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(student.lastLoginAt.toDate()).toLocaleTimeString()}
                                  </div>
                                </div> : 
                                'Never'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetPassword(student);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                  title="Reset Password"
                                >
                                  <FontAwesomeIcon icon={faKey} />
                                </button>
                                {student.isActive !== false ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deactivateAccount(student);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                    title="Deactivate Account"
                                  >
                                    <FontAwesomeIcon icon={faBan} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      activateAccount(student);
                                    }}
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                    title="Activate Account"
                                  >
                                    <FontAwesomeIcon icon={faUserCheck} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCredentials(student);
                                  }}
                                  className="text-red-800 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete Credentials"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Credential Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserCheck} className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Credentials</p>
                  <p className="text-2xl font-bold text-blue-600">{existingCredentials.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserCheck} className="text-green-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Active Accounts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {existingCredentials.filter(s => s.isActive !== false).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserTimes} className="text-red-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Inactive Accounts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {existingCredentials.filter(s => s.isActive === false).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginCredentialsManager;
