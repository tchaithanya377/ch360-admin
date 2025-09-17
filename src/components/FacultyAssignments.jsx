import React, { useEffect, useState } from "react";
import studentApiService from '../services/studentApiService';
import { studentsCollectionPath } from "../utils/pathBuilders";

function FacultyAssignments() {
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssignmentsFast = async () => {
      setLoading(true);
      try {
        // Build a map of faculty members across departments using collectionGroup("members")
        const facultyMap = new Map();
        try {
          const facultyMembersSnap = await getDocs(collectionGroup(db, "members"));
          facultyMembersSnap.forEach((m) => {
            facultyMap.set(m.id, { id: m.id, path: m.ref.path, ...m.data() });
          });
        } catch (_) {
          // Fallback: try top-level faculty collection if present
          const fallbackSnap = await getDocs(collection(db, "faculty"));
          fallbackSnap.forEach((f) => {
            facultyMap.set(f.id, { id: f.id, path: `faculty/${f.id}`, ...f.data() });
          });
        }

        // Fetch all courseDetails with an instructor set. Prefer indexed where, fallback to client filter
        let coursesSnap;
        try {
          const qAssigned = query(collectionGroup(db, "courseDetails"), where("instructor", "!=", null));
          coursesSnap = await getDocs(qAssigned);
        } catch (_) {
          coursesSnap = await getDocs(collectionGroup(db, "courseDetails"));
        }

        const assignments = [];
        for (const docSnap of coursesSnap.docs) {
          const data = docSnap.data() || {};
          const baseInstructorId = data.instructor;
          // Parse path variants
          const segments = docSnap.ref.path.split("/");
          const dept = segments[1] || "";
          const variantKey = segments[2] || ""; // 'years' or 'year_sem'
          const year = segments[3] || ""; // IV, III_5, etc.
          const courseId = (variantKey === 'year_sem') ? (segments[5] || docSnap.id) : (segments[7] || docSnap.id);
          const facBase = baseInstructorId ? (facultyMap.get(baseInstructorId) || {}) : {};
          const courseCode = data.courseCode || data.code || data.course_code || data.courseCODE || "";
          const courseName = data.courseName || data.title || data.name || data.course_name || "";

          const pushAssignment = (sectionId, instructorIdOverride) => {
            const instructorId = instructorIdOverride || baseInstructorId;
            if (!instructorId) return;
            const fac = facultyMap.get(instructorId) || facBase || {};
            assignments.push({
              id: courseId,
              courseDocPath: docSnap.ref.path,
              department: dept,
              year,
              section: sectionId,
              courseCode,
              courseName,
              facultyId: instructorId,
              facultyName: fac.name || "Unknown",
              facultyDesignation: fac.designation || "",
              facultyDocPath: fac.path || null,
            });
          };

          if (variantKey === 'years') {
            const sectionFromPath = segments[5] || ""; // A/B/C or ALL_SECTIONS
            if (sectionFromPath && sectionFromPath !== 'ALL_SECTIONS') {
              pushAssignment(sectionFromPath);
            } else {
              // Expand sections subcollection under the course doc
              try {
                const secsSnap = await getDocs(collection(docSnap.ref, 'sections'));
                if (!secsSnap.empty) {
                  secsSnap.forEach(secDoc => {
                    const secData = secDoc.data() || {};
                    pushAssignment(secDoc.id, secData.instructor || baseInstructorId);
                  });
                } else {
                  // fallback to ALL_SECTIONS single item
                  pushAssignment('ALL_SECTIONS');
                }
              } catch (_) {
                pushAssignment('ALL_SECTIONS');
              }
            }
          } else if (variantKey === 'year_sem') {
            // year_sem has no section in path; use sections subcollection
            try {
              const secsSnap = await getDocs(collection(docSnap.ref, 'sections'));
              if (!secsSnap.empty) {
                secsSnap.forEach(secDoc => {
                  const secData = secDoc.data() || {};
                  pushAssignment(secDoc.id, secData.instructor || baseInstructorId);
                });
              }
            } catch (_) {
              // no sections; skip
            }
          }
        }

        setFacultyAssignments(assignments);
        setFilteredAssignments(assignments);
      } catch (error) {
        console.error("Error fetching faculty assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsFast();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterAssignments(term, selectedYear, selectedSection);
  };

  const handleYearFilter = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    filterAssignments(searchTerm, year, selectedSection);
  };

  const handleSectionFilter = (e) => {
    const section = e.target.value;
    setSelectedSection(section);
    filterAssignments(searchTerm, selectedYear, section);
  };

  const filterAssignments = (term, year, section) => {
    const filtered = facultyAssignments.filter((assignment) => {
      const matchesSearch = (
        (assignment.facultyName || "").toLowerCase().includes(term) ||
        (assignment.facultyDesignation || "").toLowerCase().includes(term) ||
        (assignment.courseName || "").toLowerCase().includes(term) ||
        (assignment.courseCode || "").toLowerCase().includes(term)
      );
      const matchesYear = year ? assignment.year === year : true;
      const matchesSection = section ? assignment.section === section : true;
      return matchesSearch && matchesYear && matchesSection;
    });
    setFilteredAssignments(filtered);
  };

  const handleViewEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (assignment) => {
    if (window.confirm("Are you sure you want to delete this relationship?")) {
      try {
        // Step 1: Remove the course from the faculty's assigned courses and teaching map
        const possibleFacultyPaths = [];
        if (assignment.facultyDocPath) possibleFacultyPaths.push(assignment.facultyDocPath);
        if (assignment.department && assignment.facultyId) {
          possibleFacultyPaths.push(`faculty/${assignment.department}/members/${assignment.facultyId}`);
        }
        for (const fPath of possibleFacultyPaths) {
          try {
          const facultyRef = doc(db, fPath);
          const facultyDocSnap = await getDoc(facultyRef);
          if (facultyDocSnap.exists()) {
            const facultyData = facultyDocSnap.data() || {};
            const updatedCourses = (facultyData.courses || []).filter((courseId) => courseId !== assignment.id);
            const teachingKey = `${(assignment.year || '').split('_')[0]}_${assignment.section}`;
            await updateDoc(facultyRef, { courses: updatedCourses, [`teaching.${teachingKey}`]: deleteField() });
          }
          } catch (_) { /* ignore */ }
        }

        // Step 2: Remove the course from all students in the specified dept/year/section (new schema)
        try {
          const romanYear = (assignment.year || '').toString().split('_')[0];
          const studentsPath = studentsCollectionPath(assignment.department, romanYear, assignment.section);
          const studentsSnapshot = await getDocs(collection(db, studentsPath));
          for (const sDoc of studentsSnapshot.docs) {
            const studentRef = sDoc.ref;
            await updateDoc(studentRef, { courses: arrayRemove(assignment.id) });
          }
        } catch (_) {
          // ignore missing collections
        }

        // Try legacy structure removal as well: students/{year}/{section}
        try {
          const romanYear = (assignment.year || '').toString().split('_')[0];
          const legacySnap = await getDocs(collection(db, `students/${romanYear}/${assignment.section}`));
          for (const sDoc of legacySnap.docs) {
            const studentRef = sDoc.ref;
            await updateDoc(studentRef, { courses: arrayRemove(assignment.id) });
          }
        } catch (_) { /* ignore */ }

        // Step 3: Delete section linkage and/or per-section course document
        const path = assignment.courseDocPath || '';
        const seg = path.split('/');
        const variantKey = seg[2] || '';
        if (variantKey === 'years') {
          const pathSection = seg[5] || '';
          if (pathSection && pathSection !== 'ALL_SECTIONS') {
            // This is already a section-specific course doc → delete it
            await deleteDoc(doc(db, path));
          } else {
            // Master ALL_SECTIONS course → delete the subdoc for this section
            const secRef = doc(db, `${path}/sections/${assignment.section}`);
            await deleteDoc(secRef);
          }
        } else if (variantKey === 'year_sem') {
          // Delete subdoc under master course
          const secRef = doc(db, `${path}/sections/${assignment.section}`);
          await deleteDoc(secRef);
        } else {
          // Unknown variant: best-effort reset
          const courseRef = doc(db, path);
          await updateDoc(courseRef, { instructor: null, students: [] });
        }

        // Step 4: Update the local state
        setFacultyAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
        setFilteredAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
        alert("Relationship deleted successfully!");
      } catch (error) {
        console.error("Error deleting relationship:", error);
        alert("An error occurred while deleting the relationship.");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedAssignment) {
        const courseRef = doc(
          db,
          `courses/Computer Science & Engineering (Data Science)/years/${selectedAssignment.year}/sections/${selectedAssignment.section}/courseDetails/${selectedAssignment.id}`
        );
        await updateDoc(courseRef, {
          courseName: selectedAssignment.courseName,
          courseCode: selectedAssignment.courseCode,
        });
        alert("Assignment updated successfully!");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("An error occurred while updating the assignment.");
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="text-center p-6">Loading assignments...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Faculty Assigned Courses
        </h1>

        {/* Filters Section */}
        <div className="flex flex-wrap justify-between items-center bg-white shadow-md p-4 rounded-lg mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by faculty name or designation"
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedYear}
            onChange={handleYearFilter}
            className="w-full md:w-1/4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 md:mt-0"
          >
            <option value="">All Years</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>

          <select
            value={selectedSection}
            onChange={handleSectionFilter}
            className="w-full md:w-1/4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 md:mt-0"
          >
            <option value="">All Sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Faculty Assignments */}
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  {assignment.facultyName}
                </h2>
                <p className="text-gray-600">
                  <strong>Designation:</strong> {assignment.facultyDesignation}
                </p>
                <p className="text-gray-600">
                  <strong>Year:</strong> {assignment.year || "-"}
                </p>
                <p className="text-gray-600">
                  <strong>Section:</strong> {assignment.section === "ALL_SECTIONS" ? "All Sections" : (assignment.section || "-")}
                </p>
                <p className="text-gray-600">
                  <strong>Course Code:</strong> {assignment.courseCode || "(Not set)"}
                </p>
                <p className="text-gray-600">
                  <strong>Course Name:</strong> {assignment.courseName || "(Not set)"}
                </p>
                <div className="mt-4">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md mr-2"
                    onClick={() => handleViewEdit(assignment)}
                  >
                    View/Edit
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-md"
                    onClick={() => handleDelete(assignment)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-6">
            No faculty assignments found. Please adjust your filters or add data
            to Firestore.
          </p>
        )}
      </div>

      {/* Modal for View/Edit */}
      {isModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">View/Edit Assignment</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Course Code</label>
              <input
                type="text"
                value={selectedAssignment.courseCode}
                onChange={(e) =>
                  setSelectedAssignment({ ...selectedAssignment, courseCode: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Course Name</label>
              <input
                type="text"
                value={selectedAssignment.courseName}
                onChange={(e) =>
                  setSelectedAssignment({ ...selectedAssignment, courseName: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyAssignments;
