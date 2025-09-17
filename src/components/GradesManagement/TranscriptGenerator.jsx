import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faFileAlt,
  faQrcode,
  faSignature,
  faPrint,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const TranscriptGenerator = () => {
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      studentId: '23CS001',
      studentName: 'John Doe',
      program: 'B.Tech Computer Science',
      batch: '2023-2027',
      generatedDate: '2024-03-15T10:30:00',
      status: 'generated',
      version: '1.0',
      totalCredits: 85,
      cgpa: 8.2,
      courses: [
        { semester: 1, code: 'CS101', name: 'Programming Fundamentals', credits: 4, grade: 'A', points: 9 },
        { semester: 1, code: 'CS102', name: 'Data Structures', credits: 4, grade: 'A+', points: 10 },
        { semester: 2, code: 'CS201', name: 'Object Oriented Programming', credits: 4, grade: 'A', points: 9 },
        { semester: 2, code: 'CS202', name: 'Database Systems', credits: 3, grade: 'B+', points: 8 }
      ],
      digitalSignature: 'Dr. Registrar',
      qrCode: 'TRX-2024-001',
      downloadCount: 3,
      lastDownloaded: '2024-03-16T14:20:00'
    },
    {
      id: 2,
      studentId: '23EE002',
      studentName: 'Sarah Wilson',
      program: 'B.Tech Electrical Engineering',
      batch: '2023-2027',
      generatedDate: '2024-03-14T16:00:00',
      status: 'pending',
      version: '1.0',
      totalCredits: 82,
      cgpa: 9.1,
      courses: [
        { semester: 1, code: 'EE101', name: 'Electrical Circuits', credits: 4, grade: 'A+', points: 10 },
        { semester: 1, code: 'EE102', name: 'Electronics', credits: 4, grade: 'A', points: 9 },
        { semester: 2, code: 'EE201', name: 'Digital Electronics', credits: 3, grade: 'A+', points: 10 },
        { semester: 2, code: 'EE202', name: 'Control Systems', credits: 3, grade: 'A', points: 9 }
      ],
      digitalSignature: null,
      qrCode: 'TRX-2024-002',
      downloadCount: 0,
      lastDownloaded: null
    }
  ]);

  const [showGeneratorForm, setShowGeneratorForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [generatorForm, setGeneratorForm] = useState({
    studentId: '',
    includeGrades: true,
    includeGPA: true,
    includeSignature: true,
    includeQR: true,
    format: 'pdf'
  });

  const [students] = useState([
    { id: '23CS001', name: 'John Doe', program: 'B.Tech Computer Science', batch: '2023-2027' },
    { id: '23EE002', name: 'Sarah Wilson', program: 'B.Tech Electrical Engineering', batch: '2023-2027' },
    { id: '23ME003', name: 'Michael Brown', program: 'B.Tech Mechanical Engineering', batch: '2023-2027' }
  ]);

  const [filters, setFilters] = useState({
    status: '',
    program: '',
    batch: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generated': return faCheckCircle;
      case 'pending': return faClock;
      case 'processing': return faCalculator;
      case 'failed': return faExclamationTriangle;
      default: return faClock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    const student = students.find(s => s.id === generatorForm.studentId);
    if (!student) return;

    const newTranscript = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      program: student.program,
      batch: student.batch,
      generatedDate: new Date().toISOString(),
      status: 'generated',
      version: '1.0',
      totalCredits: 85,
      cgpa: 8.2,
      courses: [
        { semester: 1, code: 'CS101', name: 'Programming Fundamentals', credits: 4, grade: 'A', points: 9 },
        { semester: 1, code: 'CS102', name: 'Data Structures', credits: 4, grade: 'A+', points: 10 },
        { semester: 2, code: 'CS201', name: 'Object Oriented Programming', credits: 4, grade: 'A', points: 9 },
        { semester: 2, code: 'CS202', name: 'Database Systems', credits: 3, grade: 'B+', points: 8 }
      ],
      digitalSignature: generatorForm.includeSignature ? 'Dr. Registrar' : null,
      qrCode: generatorForm.includeQR ? `TRX-${Date.now()}` : null,
      downloadCount: 0,
      lastDownloaded: null
    };

    setTranscripts([newTranscript, ...transcripts]);
    setShowGeneratorForm(false);
    setGeneratorForm({
      studentId: '',
      includeGrades: true,
      includeGPA: true,
      includeSignature: true,
      includeQR: true,
      format: 'pdf'
    });
  };

  const handleDownload = (transcriptId) => {
    setTranscripts(transcripts.map(t => 
      t.id === transcriptId 
        ? { 
            ...t, 
            downloadCount: t.downloadCount + 1, 
            lastDownloaded: new Date().toISOString() 
          }
        : t
    ));
    
    // Simulate download
    console.log('Downloading transcript:', transcriptId);
  };

  const handleDelete = (transcriptId) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      setTranscripts(transcripts.filter(t => t.id !== transcriptId));
    }
  };

  const filteredTranscripts = transcripts.filter(transcript => {
    if (filters.status && transcript.status !== filters.status) return false;
    if (filters.program && !transcript.program.includes(filters.program)) return false;
    if (filters.batch && transcript.batch !== filters.batch) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transcript Generator</h2>
          <p className="text-gray-600">Generate official transcripts with digital signatures and verification</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGeneratorForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>Generate Transcript</span>
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faDownload} />
            <span>Bulk Export</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Generated</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcripts.filter(t => t.status === 'generated').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcripts.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faDownload} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcripts.reduce((sum, t) => sum + t.downloadCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(transcripts.map(t => t.studentId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="generated">Generated</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <input
              type="text"
              value={filters.program}
              onChange={(e) => setFilters({...filters, program: e.target.value})}
              placeholder="Search program..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => setFilters({...filters, batch: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Batches</option>
              <option value="2023-2027">2023-2027</option>
              <option value="2022-2026">2022-2026</option>
              <option value="2021-2025">2021-2025</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ status: '', program: '', batch: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transcripts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Generated Transcripts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredTranscripts.map((transcript) => (
              <div key={transcript.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{transcript.studentName} ({transcript.studentId})</h4>
                    <p className="text-sm text-gray-600">{transcript.program}</p>
                    <p className="text-sm text-gray-500">Batch: {transcript.batch}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transcript.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(transcript.status)} className="mr-1" />
                      {transcript.status}
                    </span>
                    {transcript.digitalSignature && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FontAwesomeIcon icon={faSignature} className="mr-1" />
                        Signed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{transcript.totalCredits}</p>
                    <p className="text-sm text-gray-600">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{transcript.cgpa.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">CGPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{transcript.downloadCount}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Generated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(transcript.generatedDate)}</p>
                  </div>
                </div>

                {/* Course Summary */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Course Summary:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {transcript.courses.slice(0, 4).map((course, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <p className="font-medium">{course.code}</p>
                        <p className="text-gray-600">{course.grade}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {transcript.digitalSignature && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        <FontAwesomeIcon icon={faSignature} className="mr-1" />
                        Digital Signature
                      </span>
                    )}
                    {transcript.qrCode && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        <FontAwesomeIcon icon={faQrcode} className="mr-1" />
                        QR Verification
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                      Version {transcript.version}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {transcript.lastDownloaded && `Last downloaded: ${formatDate(transcript.lastDownloaded)}`}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(transcript.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-1" />
                      Download
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      <FontAwesomeIcon icon={faPrint} className="mr-1" />
                      Print
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
                      Email
                    </button>
                    <button
                      onClick={() => handleDelete(transcript.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generator Form Modal */}
      {showGeneratorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Generate New Transcript</h3>
              <button
                onClick={() => {
                  setShowGeneratorForm(false);
                  setGeneratorForm({
                    studentId: '',
                    includeGrades: true,
                    includeGPA: true,
                    includeSignature: true,
                    includeQR: true,
                    format: 'pdf'
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={generatorForm.studentId}
                  onChange={(e) => setGeneratorForm({...generatorForm, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.id} - {student.name} ({student.program})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  value={generatorForm.format}
                  onChange={(e) => setGeneratorForm({...generatorForm, format: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pdf">PDF (Recommended)</option>
                  <option value="docx">Word Document</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transcript Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generatorForm.includeGrades}
                      onChange={(e) => setGeneratorForm({...generatorForm, includeGrades: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Include detailed grades</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generatorForm.includeGPA}
                      onChange={(e) => setGeneratorForm({...generatorForm, includeGPA: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Include GPA calculation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generatorForm.includeSignature}
                      onChange={(e) => setGeneratorForm({...generatorForm, includeSignature: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Include digital signature</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generatorForm.includeQR}
                      onChange={(e) => setGeneratorForm({...generatorForm, includeQR: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Include QR code for verification</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGeneratorForm(false);
                    setGeneratorForm({
                      studentId: '',
                      includeGrades: true,
                      includeGPA: true,
                      includeSignature: true,
                      includeQR: true,
                      format: 'pdf'
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Generate Transcript
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptGenerator;
