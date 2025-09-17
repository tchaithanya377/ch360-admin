import React, { useState, useEffect, useMemo } from "react";
import studentApiService from '../services/studentApiService';
import {
  studentsCollectionPath,
  studentDocPath,
  coursesCollectionPath,
  courseDocPath,
  possibleStudentsCollectionPaths,
  coursesCollectionPathYearSem,
  courseDocPathYearSem,
} from "../utils/pathBuilders";

function Relationships() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  // Use short department codes to match database layout
  const [selectedDepartment, setSelectedDepartment] = useState("CSE_DS");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(""); // e.g., II_4
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Normalize student fields from heterogeneous sources
  const normalizeStudent = (raw, id, path) => {
    const data = raw || {};
    const rollCandidates = [
      data.rollNo,
      data.rollno,
      data.RollNo,
      data.Roll,
      data.roll,
      data.regNo,
      data.RegNo,
      data.registrationNo,
      data.registrationNumber,
      data.admissionNo,
      data.hallTicket,
      data.hallticket,
      data.searchableRollNo,
      data.searchableRollno,
      data.studentId,
      data.student_id,
    ];
    const nameCandidates = [
      data.studentName,
      data.name,
      data.fullName,
      data.full_name,
      data.displayName,
      data.student_name,
      data.shortName,
      data.searchableName,
      data.firstName && data.lastName ? `${data.firstName} ${data.lastName}`.trim() : undefined,
      data.first_name && data.last_name ? `${data.first_name} ${data.last_name}`.trim() : undefined,
    ];
    const rollNo = rollCandidates.find(v => typeof v === 'string' && v.trim().length > 0) || id;
    const studentName = nameCandidates.find(v => typeof v === 'string' && v.trim().length > 0);
    const section = (data.section || data.Section || data.sectionName || data.sec || "").toString().toUpperCase();
    return { id, _path: path, rollNo, studentName, section, ...data };
  };

  // Natural sort by roll number with graceful fallbacks
  const compareByRollNo = (a, b) => {
    const ar = (a.rollNo || "").toString();
    const br = (b.rollNo || "").toString();
    if (ar && br) {
      const cmp = ar.localeCompare(br, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return cmp;
    } else if (ar && !br) {
      return -1;
    } else if (!ar && br) {
      return 1;
    }
    return (a.id || "").toString().localeCompare((b.id || "").toString(), undefined, { numeric: true, sensitivity: "base" });
  };

  const sortedStudents = useMemo(() => {
    const list = Array.isArray(students) ? [...students] : [];
    return list.sort(compareByRollNo);
  }, [students]);

  const visibleStudents = useMemo(() => {
    const q = (debouncedQuery || "").toString().trim().toLowerCase();
    if (!q) return sortedStudents;
    return sortedStudents.filter((s) => {
      const name = (s.studentName || s.name || s.fullName || "").toString().toLowerCase();
      const first = (s.firstName || "").toString().toLowerCase();
      const last = (s.lastName || "").toString().toLowerCase();
      const roll = (s.rollNo || "").toString().toLowerCase();
      return name.includes(q) || roll.includes(q) || `${first} ${last}`.trim().includes(q);
    });
  }, [sortedStudents, debouncedQuery]);

  // Debounce search input for smoother typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Derive available sections from student data (fallback to A..F)
  const derivedSections = useMemo(() => {
    const set = new Set();
    (students || []).forEach(s => {
      const sec = (s.section || selectedSection || "").toString().toUpperCase();
      if (sec) set.add(sec);
    });
    const result = Array.from(set).filter(Boolean).sort();
    return result.length > 0 ? result : ["A","B","C","D","E","F"];
  }, [students, selectedSection]);

  // Fetch faculty for selected department
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!selectedDepartment) return;
      try {
        const snap = await getDocs(collection(db, `faculty/${selectedDepartment}/members`));
        setFaculty(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching faculty:", e);
        setFaculty([]);
      }
    };
    fetchFaculty();
  }, [selectedDepartment]);

  // Fetch Data Based on Department, Year and Section
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDepartment || !selectedYear || !selectedSection) {
        console.log("Department, Year or Section not selected yet.");
        return;
      }

      setIsLoading(true);

      try {
        const normalizedSection = selectedSection.toUpperCase();
        const studentsPath = studentsCollectionPath(selectedDepartment, selectedYear, normalizedSection);
        // Prefer new year_sem structure if provided, else ALL_SECTIONS per-year
        const useYearSem = !!selectedSemester;
        const coursesPath = useYearSem
          ? coursesCollectionPathYearSem(selectedDepartment, selectedSemester)
          : coursesCollectionPath(selectedDepartment, selectedYear, "ALL_SECTIONS");
        console.log("Fetching courses from:", coursesPath);

        // Fetch students with variants: evaluate all variants and choose the richest data
        let studentsData = [];
        const variantPaths = [studentsPath, ...possibleStudentsCollectionPaths(selectedDepartment, selectedYear, normalizedSection)];
        const seenPaths = new Set();
        let best = { score: -1, data: [] };
        for (const path of variantPaths) {
          if (seenPaths.has(path)) continue;
          seenPaths.add(path);
          try {
            const snap = await getDocs(collection(db, path));
            if (snap && snap.size > 0) {
              const list = snap.docs.map((d) => normalizeStudent(d.data(), d.id, `${path}/${d.id}`));
              // Score by presence of real rollNos and names
              const score = list.reduce((acc, s) => acc + (s.rollNo && s.rollNo !== s.id ? 1 : 0) + (s.studentName ? 1 : 0), 0);
              if (score > best.score) best = { score, data: list };
            }
          } catch (_) {
            // ignore and try next variant
          }
        }
        if (best.score >= 0) {
          studentsData = best.data;
        }
        // As a last resort, try legacy structure: students/{year}/{section}
        if (studentsData.length === 0) {
          try {
            const legacySnap = await getDocs(collection(db, `students/${selectedYear}/${normalizedSection}`));
            if (legacySnap && legacySnap.size > 0) {
              studentsData = legacySnap.docs.map((d) => normalizeStudent(d.data(), d.id, `students/${selectedYear}/${normalizedSection}/${d.id}`));
            }
          } catch (_) {}
        }

        studentsData = studentsData.sort(compareByRollNo);
        setStudents(studentsData);

        const coursesSnapshot = await getDocs(collection(db, coursesPath)).catch(() => ({ docs: [] }));
        let coursesData = coursesSnapshot.docs.map((d) => ({ id: d.id, _path: `${coursesPath}/${d.id}`, ...d.data() }));

        // Fallback: try ALL_SECTIONS if specific section is empty
        // No additional fallback needed since we intentionally load from ALL_SECTIONS

        // Final fallback: scan courseDetails across the DB and filter by dept/year from path
        if (coursesData.length === 0) {
          try {
            const cgSnap = await getDocs((await import("firebase/firestore")).collectionGroup(db, "courseDetails"));
            const filtered = [];
            cgSnap.forEach((docSnap) => {
              const path = docSnap.ref.path; // courses/{dept}/years/{year}/sections/{section}/courseDetails/{id}
              const seg = path.split("/");
              const dept = seg[1];
              const year = seg[3];
              if (dept === selectedDepartment && year === selectedYear) {
                filtered.push({ id: docSnap.id, _path: path, ...docSnap.data() });
              }
            });
            coursesData = filtered;
          } catch (_) {
            // ignore
          }
        }
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedDepartment, selectedYear, selectedSection]);

  // Handle selecting or deselecting individual students
  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId) // Deselect if already selected
        : [...prevSelected, studentId] // Select if not already selected
    );
  };

  // Handle "Select All Visible" or "Deselect Visible"
  const handleSelectAll = () => {
    if (visibleStudents.length > 0 && visibleStudents.every(s => selectedStudents.includes(s.id))) {
      const remaining = selectedStudents.filter(id => !visibleStudents.some(s => s.id === id));
      setSelectedStudents(remaining);
    } else {
      const visibleIds = visibleStudents.map((student) => student.id);
      const merged = Array.from(new Set([...(selectedStudents || []), ...visibleIds]));
      setSelectedStudents(merged);
    }
  };

  const assignRelationships = async () => {
    if (!selectedYear || !selectedSection || !selectedCourse || !selectedFaculty) {
      alert("Please select year, section, course, and faculty.");
      return;
    }

    const studentIdsToAssign = selectedStudents.length > 0
      ? selectedStudents
      : students.map((s) => s.id);

    if (studentIdsToAssign.length === 0) {
      alert("No students found for the selected year/section.");
      return;
    }

    setIsLoading(true);

    try {
      const batch = writeBatch(db);
      const normalizedSection = selectedSection.toUpperCase();
      const teachingKey = `${selectedYear}_${normalizedSection}`;

      // Upsert each student with the course in their list
      studentIdsToAssign.forEach((studentId) => {
        const existing = students.find(s => s.id === studentId);
        const studentPath = existing && existing._path
          ? existing._path
          : studentDocPath(selectedDepartment, selectedYear, normalizedSection, studentId);
        const studentRef = doc(db, studentPath);
        batch.set(studentRef, { courses: [selectedCourse] }, { merge: true });
      });

      // Update faculty courses and per section/year teaching list
      const facultyRef = doc(db, `faculty/${selectedDepartment}/members/${selectedFaculty}`);
      batch.set(
        facultyRef,
        {
          courses: [selectedCourse],
          teaching: { [teachingKey]: studentIdsToAssign },
        },
        { merge: true }
      );

      // Upsert the course with instructor and students in the SECTION-SPECIFIC document
      // For new structure, we only write to master course's sections subdoc
      const selectedCourseMeta = courses.find(c => c.id === selectedCourse) || {};
      const useYearSem = !!selectedSemester;
      const sectionCourseRef = doc(
        db,
        useYearSem
          ? courseDocPathYearSem(selectedDepartment, selectedSemester, selectedCourse)
          : courseDocPath(selectedDepartment, selectedYear, normalizedSection, selectedCourse)
      );
      const studentsBySection = {
        [normalizedSection]: studentIdsToAssign
      };
      // Always maintain a per-section course document for easy reads and legacy compatibility
      batch.set(
        sectionCourseRef,
        {
          courseCode: selectedCourseMeta.courseCode || selectedCourseMeta.code || undefined,
          courseName: selectedCourseMeta.courseName || selectedCourseMeta.title || selectedCourseMeta.name || undefined,
          instructor: selectedFaculty,
          students: deleteField(),
          studentsBySection,
          masterCoursePath: selectedCourseMeta._path || (useYearSem ? courseDocPathYearSem(selectedDepartment, selectedSemester, selectedCourse) : null),
        },
        { merge: true }
      );

      // Additionally, write a normalized per-section sub-document under the master ALL_SECTIONS course doc for scalability
      // For new structure or existing master with path, store link under master course doc
      if (selectedCourseMeta && (selectedCourseMeta._path || useYearSem)) {
        const masterPath = selectedCourseMeta._path || courseDocPathYearSem(selectedDepartment, selectedSemester, selectedCourse);
        const masterSectionsPath = `${masterPath}/sections/${normalizedSection}`;
        const masterSectionRef = doc(db, masterSectionsPath);
        batch.set(
          masterSectionRef,
          {
            instructor: selectedFaculty,
            students: studentIdsToAssign,
            department: selectedDepartment,
            year: selectedYear,
            section: normalizedSection,
            semesterKey: selectedSemester || null,
          },
          { merge: true }
        );
      }

      await batch.commit();
      alert(`Assigned course to ${studentIdsToAssign.length} students and faculty successfully.`);
    } catch (error) {
      console.error("Error assigning relationships:", error);
      alert("An error occurred while assigning relationships.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Assign Faculty to Course and Students
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-lg text-gray-700">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 bg-white shadow-lg rounded-lg p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Department</h2>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="CSE_DS">CSE_DS</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Year</h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Year --</option>
                <option value="I">I</option>
                <option value="IV">IV</option>
                <option value="III">III</option>
                <option value="II">II</option>
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Semester (optional)</h2>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Use Year-based (legacy) --</option>
                <option value="I_1">I_1</option>
                <option value="I_2">I_2</option>
                <option value="II_3">II_3</option>
                <option value="II_4">II_4</option>
                <option value="III_5">III_5</option>
                <option value="III_6">III_6</option>
                <option value="IV_7">IV_7</option>
                <option value="IV_8">IV_8</option>
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Section</h2>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Section --</option>
                {derivedSections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {students.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Students</h2>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by roll no or name"
                    className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {visibleStudents.length > 0 && visibleStudents.every(s => selectedStudents.includes(s.id))
                        ? "Deselect Visible"
                        : "Select Visible"}
                    </button>
                    <span className="text-sm text-gray-600">Selected: {selectedStudents.length} / {students.length}</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full text-sm table-auto">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="p-2 w-10 text-center">Sel</th>
                        <th className="p-2 text-left">Roll No</th>
                        <th className="p-2 text-left">Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((student) => {
                        const checked = selectedStudents.includes(student.id);
                        const displayName = student.studentName || student.name || student.fullName || ((student.firstName || student.lastName) ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : undefined);
                        return (
                          <tr key={student.id} className={checked ? "bg-blue-50" : ""}>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                id={student.id}
                                checked={checked}
                                onChange={() => handleStudentSelection(student.id)}
                              />
                            </td>
                            <td className="p-2 font-medium text-gray-800">{student.rollNo || student.id}</td>
                            <td className="p-2 text-gray-700">{displayName || `Student ${student.id}`}</td>
                          </tr>
                        );
                      })}
                      {visibleStudents.length === 0 && (
                        <tr>
                          <td className="p-3 text-center text-gray-500" colSpan={3}>No matching students</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Course</h2>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={courses.length === 0}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Faculty</h2>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={faculty.length === 0}
              >
                <option value="">-- Select Faculty --</option>
                {faculty.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.designation})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={assignRelationships}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
            >
              Assign Relationships
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relationships;
