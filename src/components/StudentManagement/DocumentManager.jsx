import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faUpload,
  faUserPlus, faCopy, faArrowsRotate, faFileUpload, faCheck,
  faTimes, faSpinner, faFolder, faFile, faFilePdf, faFileImage
} from "@fortawesome/free-solid-svg-icons";
const DocumentManager = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Document types
  const defaultDocumentTypes = [
    { id: "admission", name: "Admission Documents", description: "Admission forms, certificates" },
    { id: "academic", name: "Academic Records", description: "Marksheets, transcripts" },
    { id: "identity", name: "Identity Documents", description: "Aadhaar, PAN, passport" },
    { id: "medical", name: "Medical Certificates", description: "Health certificates, reports" },
    { id: "financial", name: "Financial Documents", description: "Fee receipts, scholarship docs" },
    { id: "other", name: "Other Documents", description: "Miscellaneous documents" }
  ];

  useEffect(() => {
    setDocumentTypes(defaultDocumentTypes);
  }, []);

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return faFilePdf;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return faFileImage;
      case 'doc':
      case 'docx':
        return faFileAlt;
      default:
        return faFile;
    }
  };

  // Get file color based on type
  const getFileColor = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'text-red-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'text-green-600';
      case 'doc':
      case 'docx':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Upload documents
  const uploadDocuments = async () => {
    if (!selectedStudent || selectedFiles.length === 0) {
      alert("Please select a student and files to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedDocs = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simulate file upload (replace with actual upload logic)
        const uploadProgress = ((i + 1) / selectedFiles.length) * 100;
        setUploadProgress(uploadProgress);

        // Create document record
        const documentRecord = {
          id: Date.now() + i,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          documentType: "other", // You can add a field to select document type
          uploadedAt: new Date(),
          uploadedBy: "admin",
          status: "uploaded"
        };

        uploadedDocs.push(documentRecord);

        // Save to database
        try {
          await addDoc(collection(db, "studentDocuments"), {
            ...documentRecord,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Error saving document record:", error);
        }

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update documents list
      setDocuments(prev => [...uploadedDocs, ...prev]);
      
      alert("Documents uploaded successfully!");
      setSelectedFiles([]);
      setShowUploadModal(false);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Download document
  const downloadDocument = (document) => {
    // Simulate download (replace with actual download logic)
    alert(`Downloading ${document.fileName}...`);
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        // Delete from database
        // await deleteDoc(doc(db, "studentDocuments", documentId));
        
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting document. Please try again.");
      }
    }
  };

  // Export document list
  const exportDocumentList = () => {
    const csvContent = [
      "Student Name,Roll Number,Document Name,Document Type,File Size,Upload Date,Status",
      ...documents.map(doc => 
        `"${doc.studentName}","${selectedStudent?.rollNo || ''}","${doc.fileName}","${doc.documentType}","${doc.fileSize}","${doc.uploadedAt.toLocaleDateString()}","${doc.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === "all" || doc.documentType === filterType;
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate document statistics
  const calculateStats = () => {
    const total = documents.length;
    const byType = {};
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    documents.forEach(doc => {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
    });

    return {
      total,
      byType,
      totalSize: (totalSize / (1024 * 1024)).toFixed(2) // Convert to MB
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faFileAlt} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Document Manager</h2>
            <p className="text-gray-600">Manage student documents and files</p>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.slice(0, 9).map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gray-300 p-2 rounded-full">
                  <FontAwesomeIcon icon={faUserPlus} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.rollNo} • {student.department}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Selected Student</h4>
                <p className="text-sm text-gray-600">
                  {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()} • {selectedStudent.rollNo}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Upload Documents</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportDocumentList}
              disabled={documents.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Export List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Statistics */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalSize} MB</p>
              <p className="text-sm text-gray-600">Total Size</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byType).length}</p>
              <p className="text-sm text-gray-600">Document Types</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{selectedStudent ? 1 : 0}</p>
              <p className="text-sm text-gray-600">Selected Student</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Documents ({filteredDocuments.length})
          </h3>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faFolder} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No documents found.</p>
            {selectedStudent && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Upload First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${getFileColor(document.fileName).replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <FontAwesomeIcon icon={getFileIcon(document.fileName)} className={`text-lg ${getFileColor(document.fileName)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{document.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(document.fileSize / 1024).toFixed(1)} KB • {document.uploadedAt.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">{document.studentName}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => downloadDocument(document)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Download"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-sm" />
                    </button>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    document.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FontAwesomeIcon icon={document.status === 'uploaded' ? faCheckCircle : faClock} className="mr-1" />
                    {document.status}
                  </span>
                  <span className="text-xs text-gray-500">{document.documentType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {selectedStudent && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Student:</strong> {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()}
                  </p>
                  <p className="text-sm text-gray-600">Roll No: {selectedStudent.rollNo}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={getFileIcon(file.name)} className={getFileColor(file.name)} />
                        <span className="truncate">{file.name}</span>
                        <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={uploadDocuments}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={isUploading ? faSpinner : faUpload} className={isUploading ? 'animate-spin' : ''} />
                  <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
