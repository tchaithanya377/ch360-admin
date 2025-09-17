import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, faPlus, faEdit, faTrash, faEye, faSearch, 
  faFilter, faSave, faTimes, faExclamationTriangle,
  faDownload, faUpload, faFile, faFilePdf, faFileWord,
  faFileExcel, faFileImage, faFileArchive, faGlobe,
  faBuilding, faCloudUploadAlt, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentDocuments = ({ selectedDepartment }) => {
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'POLICY',
    department_id: '',
    version: '1.0',
    is_public: false
  });

  useEffect(() => {
    loadDocuments();
    loadDepartments();
  }, [page, searchTerm, documentTypeFilter, publicFilter]);

  const loadDocuments = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        document_type: documentTypeFilter || undefined,
        is_public: publicFilter !== '' ? publicFilter === 'true' : undefined,
        department_id: selectedDepartment?.id || undefined,
        ...params
      };

      const data = await departmentApiService.getDocuments(queryParams);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setDocuments(normalized);
      const count = typeof data?.count === 'number' ? data.count : normalized.length;
      setTotalCount(count);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentApiService.getDepartments({ page_size: 100 });
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setDepartments(normalized);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      // Auto-detect file type from extension
      const extension = file.name.split('.').pop().toLowerCase();
      setFormData(prev => ({
        ...prev,
        file_type: extension
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      file_type: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validations
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!selectedDepartment?.id && !formData.department_id) {
      errors.department_id = 'Department is required';
    }
    
    if (!selectedFile && !editingDocument) {
      errors.file = 'Please select a file to upload';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Prepare form data for API submission
      const submitData = {
        ...formData,
        department_id: selectedDepartment?.id || formData.department_id,
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      // For new documents, we need to handle file upload
      if (!editingDocument && selectedFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add the file
        formDataToSend.append('file', selectedFile);
        
        // Add other form fields
        Object.keys(submitData).forEach(key => {
          if (submitData[key] !== null && submitData[key] !== undefined) {
            formDataToSend.append(key, submitData[key]);
          }
        });

        await departmentApiService.createDocument(formDataToSend);
      } else {
        // For editing or when no file is selected, send as JSON
        if (editingDocument) {
          await departmentApiService.updateDocument(editingDocument.id, submitData);
        } else {
          await departmentApiService.createDocument(submitData);
        }
      }
      
      setShowModal(false);
      setEditingDocument(null);
      resetForm();
      loadDocuments();
    } catch (err) {
      console.error('Document submission error:', err);
      
      // Handle API validation errors
      if (err.data && typeof err.data === 'object') {
        const apiErrors = {};
        Object.keys(err.data).forEach(field => {
          if (Array.isArray(err.data[field])) {
            apiErrors[field] = err.data[field][0]; // Take first error message
          } else {
            apiErrors[field] = err.data[field];
          }
        });
        setFieldErrors(apiErrors);
        setError('Please fix the errors below and try again.');
      } else {
        setError(err.message || 'Failed to save document. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title || '',
      description: document.description || '',
      document_type: document.document_type || 'POLICY_DOCUMENT',
      department_id: document.department_id || '',
      version: document.version || '1.0',
      is_public: document.is_public || false
    });
    setSelectedFile(null); // Don't pre-select file for editing
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await departmentApiService.deleteDocument(id);
        loadDocuments();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      document_type: 'POLICY',
      department_id: '',
      version: '1.0',
      is_public: false
    });
    setSelectedFile(null);
    setFieldErrors({});
    setError('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDocument(null);
    resetForm();
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return faFile;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return faFilePdf;
    if (type.includes('word') || type.includes('doc')) return faFileWord;
    if (type.includes('excel') || type.includes('sheet')) return faFileExcel;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return faFileImage;
    if (type.includes('zip') || type.includes('rar')) return faFileArchive;
    return faFile;
  };

  const getFileIconColor = (fileType) => {
    if (!fileType) return 'text-gray-600';
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'text-red-600';
    if (type.includes('word') || type.includes('doc')) return 'text-blue-600';
    if (type.includes('excel') || type.includes('sheet')) return 'text-green-600';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return 'text-purple-600';
    if (type.includes('zip') || type.includes('rar')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'POLICY':
        return 'bg-blue-100 text-blue-800';
      case 'PROCEDURE':
        return 'bg-green-100 text-green-800';
      case 'FORM':
        return 'bg-yellow-100 text-yellow-800';
      case 'REPORT':
        return 'bg-purple-100 text-purple-800';
      case 'MANUAL':
        return 'bg-indigo-100 text-indigo-800';
      case 'GUIDELINE':
        return 'bg-pink-100 text-pink-800';
      case 'CERTIFICATE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const documentTypes = [
    { value: 'POLICY', label: 'Policy Document' },
    { value: 'PROCEDURE', label: 'Procedure Document' },
    { value: 'FORM', label: 'Form' },
    { value: 'REPORT', label: 'Report' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'GUIDELINE', label: 'Guideline' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Reusable form field component
  const FormField = ({ label, name, type = 'text', required = false, error, children, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          {...props}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        />
      )}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  const FormSelect = ({ label, name, required = false, error, children, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {children}
      </select>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  const FormTextarea = ({ label, name, required = false, error, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Department Documents</h2>
            <p className="text-gray-600">
              {selectedDepartment ? `Documents for ${selectedDepartment.name}` : 'All Documents'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Document
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={publicFilter}
                onChange={(e) => setPublicFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Documents</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No documents found
            </div>
          ) : (
            documents.map((document) => (
              <div key={document.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <FontAwesomeIcon 
                        icon={getFileIcon(document.file_type)} 
                        className={`w-6 h-6 ${getFileIconColor(document.file_type)}`}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>
                      <p className="text-sm text-gray-600">{document.document_type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.document_type)}`}>
                      {document.document_type}
                    </span>
                    {document.is_public ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Public
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Private
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">{document.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    {document.version && (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                        <span>Version: {document.version}</span>
                      </div>
                    )}
                    {document.file_size && (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                        <span>Size: {document.file_size}</span>
                      </div>
                    )}
                    {document.created_date && (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                        <span>Created: {new Date(document.created_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {document.file_url && (
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        title="Download"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(document)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= totalCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= totalCount}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingDocument ? 'Edit Document' : 'Add Department Document'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingDocument ? 'Update document details' : 'Upload a new department document'}
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Global Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
                    </div>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormSelect
                        label="Department"
                        name="department_id"
                        value={selectedDepartment?.id || formData.department_id}
                        onChange={handleInputChange}
                        required
                        disabled={!!selectedDepartment}
                        error={fieldErrors.department_id}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="md:col-span-2">
                      <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Document title"
                        error={fieldErrors.title}
                      />
                    </div>
                    <div>
                      <FormSelect
                        label="Document Type"
                        name="document_type"
                        value={formData.document_type}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.document_type}
                      >
                        {documentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div>
                      <FormField
                        label="Version"
                        name="version"
                        type="text"
                        value={formData.version}
                        onChange={handleInputChange}
                        placeholder="e.g., 1.0"
                        error={fieldErrors.version}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormTextarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        placeholder="Describe the document content and purpose"
                        error={fieldErrors.description}
                      />
                    </div>
                  </div>
                </div>

                {/* File Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faCloudUploadAlt} className="text-green-600" />
                    </div>
                    File Information
                  </h4>
                  
                  {/* File Upload Area */}
                  <div className="space-y-4">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-50' 
                          : selectedFile 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      />
                      
                      {selectedFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <FontAwesomeIcon 
                              icon={getFileIcon(selectedFile.name.split('.').pop())} 
                              className={`w-12 h-12 ${getFileIconColor(selectedFile.name.split('.').pop())}`}
                            />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1 h-3 w-3" />
                            Remove File
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <FontAwesomeIcon icon={faCloudUploadAlt} className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {dragActive ? 'Drop file here' : 'Upload Document'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Drag and drop a file here, or click to select
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, ZIP, RAR
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {fieldErrors.file && (
                      <div className="flex items-center text-sm text-red-600">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
                        {fieldErrors.file}
                      </div>
                    )}
                  </div>

                  {/* Public Checkbox */}
                  <div className="mt-6 flex items-center">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-900">
                      Is Public
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingDocument ? 'Updating...' : 'Uploading...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {editingDocument ? 'Update Document' : 'Upload Document'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentDocuments;