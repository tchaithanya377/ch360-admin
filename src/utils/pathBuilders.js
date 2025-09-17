// Firestore path builders for dynamic department/year/section structures
// Department normalization keeps both a readable and a compact key

export const normalizeDepartmentKey = (departmentLabel) => {
  if (!departmentLabel) return "UNK";
  return departmentLabel.toString().replace(/[^A-Z0-9_]/gi, "_");
};

// Build key in section-year dash form: e.g., A-II
export const buildStudentsGroupKey = (year, section) => {
  const y = (year || "U").toString().toUpperCase();
  const s = (section || "U").toString().toUpperCase();
  return `${s}-${y}`;
};

// students/{department}/{year_section}
// department is expected to be a short code like CSE_DS
export const studentsCollectionPath = (department, year, section) => {
  const dept = normalizeDepartmentKey(department);
  const groupKey = buildStudentsGroupKey(year, section);
  return `students/${dept}/${groupKey}`;
};

// students/{department}/{year_section}/{studentId}
export const studentDocPath = (department, year, section, studentId) => {
  return `${studentsCollectionPath(department, year, section)}/${studentId}`;
};

// courses/{department}/years/{year}/sections/{section}/courseDetails
// department is expected to be a short code like CSE_DS for courses as well
export const coursesCollectionPath = (department, year, section) => {
  const dept = department;
  const y = (year || "").toString().toUpperCase();
  const s = (section || "").toString().toUpperCase();
  return `courses/${dept}/years/${y}/sections/${s}/courseDetails`;
};

export const courseDocPath = (department, year, section, courseId) => {
  return `${coursesCollectionPath(department, year, section)}/${courseId}`;
};

// New structure: courses/{department}/year_sem/{YY_S}/courseDetails
export const coursesCollectionPathYearSem = (department, yearSem) => {
  const dept = department;
  const ys = (yearSem || "").toString().toUpperCase();
  return `courses/${dept}/year_sem/${ys}/courseDetails`;
};

export const courseDocPathYearSem = (department, yearSem, courseId) => {
  return `${coursesCollectionPathYearSem(department, yearSem)}/${courseId}`;
};

// Helper: list possible semester keys for a given academic year
export const possibleSemesterKeysForYear = (year) => {
  const y = (year || '').toString().toUpperCase();
  switch (y) {
    case 'I':
      return ['I_1', 'I_2'];
    case 'II':
      return ['II_3', 'II_4'];
    case 'III':
      return ['III_5', 'III_6'];
    case 'IV':
      return ['IV_7', 'IV_8'];
    default:
      return [];
  }
};

// Timetables (legacy): timetables/{year}/{section}
export const timetableCollectionPathLegacy = (year, section) => {
  const y = (year || '').toString().toUpperCase();
  const s = (section || '').toString().toUpperCase();
  return `timetables/${y}/${s}`;
};

// Timetables (new): timetables/{department}/year_sem/{YY_S}/{section}
export const timetableCollectionPathYearSem = (department, yearSem, section) => {
  const dept = department;
  const ys = (yearSem || '').toString().toUpperCase();
  const s = (section || '').toString().toUpperCase();
  return `timetables/${dept}/year_sem/${ys}/${s}`;
};

// Variants helpers to support legacy structures
// Generate possible department identifiers, e.g., CSE_DS -> [CSE_DS, CSEDS]
export const getDepartmentVariants = (department) => {
  const variants = new Set();
  const normalized = normalizeDepartmentKey(department || "UNK");
  variants.add(normalized);
  // Compact form without underscores (e.g., CSE_DS -> CSEDS)
  const compact = normalized.replace(/_/g, "");
  if (compact) variants.add(compact);
  // If input is already compact, also add underscored
  if (department && /[A-Z0-9]+/i.test(department) && !department.includes("_")) {
    const underscored = department.replace(/([^_])([A-Z])/g, "$1_$2").toUpperCase();
    variants.add(normalizeDepartmentKey(underscored));
  }
  return Array.from(variants);
};

// Generate possible group key variants for students subcollections
// Default current: Section-Year (e.g., B-III), Legacy: Year-Section (e.g., III-B)
export const buildStudentsGroupKeyVariants = (year, section) => {
  const y = (year || "U").toString().toUpperCase();
  const s = (section || "U").toString().toUpperCase();
  return [
    `${s}-${y}`,
    `${y}-${s}`,
  ];
};

// List all plausible students collection paths to try for read operations
export const possibleStudentsCollectionPaths = (department, year, section) => {
  const deptVariants = getDepartmentVariants(department);
  const keyVariants = buildStudentsGroupKeyVariants(year, section);
  const paths = [];
  deptVariants.forEach((dept) => {
    keyVariants.forEach((key) => {
      paths.push(`students/${dept}/${key}`);
    });
  });
  return paths;
};


