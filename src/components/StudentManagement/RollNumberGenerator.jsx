import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRandom, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare
} from "@fortawesome/free-solid-svg-icons";
const RollNumberGenerator = ({ students, onClose }) => {
  const [generationMode, setGenerationMode] = useState("auto");
  const [pattern, setPattern] = useState("YEAR-DEPT-SEQ");
  const [startNumber, setStartNumber] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedRollNumbers, setGeneratedRollNumbers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [customPattern, setCustomPattern] = useState("");
  const [yearMapping, setYearMapping] = useState({});
  const [deptMapping, setDeptMapping] = useState({});

  // Available patterns
  const patterns = [
    { id: "YEAR-DEPT-SEQ", name: "Year-Department-Sequence", description: "2024-CSE-001" },
    { id: "DEPT-YEAR-SEQ", name: "Department-Year-Sequence", description: "CSE-2024-001" },
    { id: "YEAR-SEQ", name: "Year-Sequence", description: "2024-001" },
    { id: "DEPT-SEQ", name: "Department-Sequence", description: "CSE-001" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" }
  ];

  // Year mappings
  const yearMappings = {
    "I": "1",
    "II": "2", 
    "III": "3",
    "IV": "4",
    "V": "5",
    "VI": "6",
    "VII": "7",
    "VIII": "8",
    "IX": "9",
    "X": "10",
    "XI": "11",
    "XII": "12",
    "1st Year": "1",
    "2nd Year": "2",
    "3rd Year": "3",
    "4th Year": "4",
    "5th Year": "5",
    "6th Year": "6",
    "7th Year": "7",
    "8th Year": "8",
    "9th Year": "9",
    "10th Year": "10",
    "11th Year": "11",
    "12th Year": "12",
    "First Year": "1",
    "Second Year": "2",
    "Third Year": "3",
    "Fourth Year": "4",
    "Fifth Year": "5",
    "Sixth Year": "6",
    "Seventh Year": "7",
    "Eighth Year": "8",
    "Ninth Year": "9",
    "Tenth Year": "10",
    "Eleventh Year": "11",
    "Twelfth Year": "12"
  };

  // Department mappings
  const deptMappings = {
    "Civil Engineering": "CIVIL",
    "Electronics & Communication Engineering": "ECE",
    "Electrical & Electronics Engineering": "EEE",
    "Mechanical Engineering": "MECH",
    "Basic Sciences & Humanities": "BSH",
    "Management Studies": "MGMT",
    "Computer Applications": "MCA",
    "Computer Science & Engineering": "CSE",
    "Computer Science & Engineering (Artificial Intelligence)": "CSE_AI",
    "Computer Science & Engineering (Cyber Security)": "CSE_CS",
    "Computer Science & Technology": "CST",
    "Computer Science & Engineering (Data Science)": "CSE_DS",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)": "CSE_AIML",
    "Computer Science and Engineering (Networks)": "CSE_NET"
  };

  useEffect(() => {
    setYearMapping(yearMappings);
    setDeptMapping(deptMappings);
  }, []);

  // Generate roll number based on pattern
  const generateRollNumber = (student, index, pattern) => {
    const currentYear = new Date().getFullYear();
    const year = yearMapping[student.year] || student.year || currentYear;
    const dept = deptMapping[student.department] || student.department || "GEN";
    const sequence = String(startNumber + index).padStart(3, '0');

    switch (pattern) {
      case "YEAR-DEPT-SEQ":
        return `${year}-${dept}-${sequence}`;
      case "DEPT-YEAR-SEQ":
        return `${dept}-${year}-${sequence}`;
      case "YEAR-SEQ":
        return `${year}-${sequence}`;
      case "DEPT-SEQ":
        return `${dept}-${sequence}`;
      case "CUSTOM":
        return customPattern
          .replace("{YEAR}", year)
          .replace("{DEPT}", dept)
          .replace("{SEQ}", sequence)
          .replace("{PREFIX}", prefix)
          .replace("{SUFFIX}", suffix);
      default:
        return `${year}-${dept}-${sequence}`;
    }
  };

  // Generate roll numbers for selected students
  const generateRollNumbers = () => {
    setIsGenerating(true);
    
    const studentsToProcess = selectedStudents.length > 0 ? selectedStudents : students;
    const generated = studentsToProcess.map((student, index) => ({
      ...student,
      generatedRollNo: generateRollNumber(student, index, pattern),
      originalRollNo: student.rollNo
    }));

    setGeneratedRollNumbers(generated);
    setIsGenerating(false);
  };

  // Save generated roll numbers to database
  const saveRollNumbers = async () => {
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      
      generatedRollNumbers.forEach((student) => {
        const studentRef = doc(db, "students", student.id);
        batch.update(studentRef, {
          rollNo: student.generatedRollNo,
          rollNumberGeneratedAt: new Date(),
          rollNumberPattern: pattern
        });
      });

      await batch.commit();
      alert("Roll numbers saved successfully!");
      setGeneratedRollNumbers([]);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving roll numbers:", error);
      alert("Error saving roll numbers. Please try again.");
      setIsSaving(false);
    }
  };

  // Export roll numbers to CSV
  const exportToCSV = () => {
    const csvContent = [
      "Name,Roll Number,Department,Year,Original Roll No,Generated Roll No",
      ...generatedRollNumbers.map(student => 
        `"${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}","${student.rollNo}","${student.department}","${student.year}","${student.originalRollNo || ''}","${student.generatedRollNo}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roll_numbers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faRandom} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Roll Number Generator</h2>
            <p className="text-gray-600">Generate and manage student roll numbers with custom patterns</p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Generation Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
            <select
              value={generationMode}
              onChange={(e) => setGenerationMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Auto Generate</option>
              <option value="manual">Manual Review</option>
              <option value="preview">Preview Only</option>
            </select>
          </div>

          {/* Pattern Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number Pattern</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {patterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Start Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Number</label>
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix (Optional)</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., STU"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Suffix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suffix (Optional)</label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g., 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Custom Pattern */}
          {pattern === "CUSTOM" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Pattern</label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="e.g., {PREFIX}-{YEAR}-{DEPT}-{SEQ}-{SUFFIX}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: {"{YEAR}"}, {"{DEPT}"}, {"{SEQ}"}, {"{PREFIX}"}, {"{SUFFIX}"}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateRollNumbers}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRandom} />
            <span>{isGenerating ? 'Generating...' : 'Generate Roll Numbers'}</span>
          </button>

          <button
            onClick={selectAllStudents}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Select All Students</span>
          </button>

          <button
            onClick={clearSelection}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUndo} />
            <span>Clear Selection</span>
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
            {students.filter(s => selectedStudents.includes(s.id)).map(student => (
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

      {/* Generated Roll Numbers */}
      {generatedRollNumbers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Roll Numbers ({generatedRollNumbers.length})
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
                onClick={saveRollNumbers}
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Original Roll No</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generated Roll No</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedRollNumbers.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{student.originalRollNo || 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{student.generatedRollNo}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map(p => (
            <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">{p.name}</h4>
              <p className="text-sm text-gray-600">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollNumberGenerator;
