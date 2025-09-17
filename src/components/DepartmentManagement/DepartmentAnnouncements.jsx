import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, faPlus, faEdit, faTrash, faEye, faSearch, 
  faFilter, faSave, faTimes, faExclamationTriangle,
  faBell, faCalendarAlt, faUser, faFlag, faGlobe
} from '@fortawesome/free-solid-svg-icons';
import departmentApiService from '../../services/departmentApiService';

const DepartmentAnnouncements = ({ selectedDepartment }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'GENERAL',
    priority: 'MEDIUM',
    department_id: '',
    is_published: false,
    publish_date: '',
    expiry_date: '',
    target_audience: 'ALL',
    attachments: '',
    author: '',
    notes: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, [page, searchTerm, announcementTypeFilter, priorityFilter, publishedFilter]);

  // Load departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await departmentApiService.getDepartments({ page_size: 100 });
        const list = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
        setDepartments(list);
      } catch (e) {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const loadAnnouncements = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        announcement_type: announcementTypeFilter || undefined,
        priority: priorityFilter || undefined,
        is_published: publishedFilter !== '' ? publishedFilter === 'true' : undefined,
        department_id: selectedDepartment?.id || undefined,
        ...params
      };

      const data = await departmentApiService.getAnnouncements(queryParams);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setAnnouncements(normalized);
      const count = typeof data?.count === 'number' ? data.count : normalized.length;
      setTotalCount(count);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
      setAnnouncements([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        department_id: selectedDepartment?.id || formData.department_id
      };
      if (selectedFiles.length) {
        submitData._files = selectedFiles;
      }

      if (editingAnnouncement) {
        await departmentApiService.updateAnnouncement(editingAnnouncement.id, submitData);
      } else {
        await departmentApiService.createAnnouncement(submitData);
      }
      
      setShowModal(false);
      setEditingAnnouncement(null);
      resetForm();
      loadAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      announcement_type: announcement.announcement_type || 'GENERAL',
      priority: announcement.priority || 'MEDIUM',
      department_id: announcement.department_id || '',
      is_published: announcement.is_published || false,
      publish_date: announcement.publish_date || '',
      expiry_date: announcement.expiry_date || '',
      target_audience: announcement.target_audience || '',
      attachments: announcement.attachments || '',
      author: announcement.author || '',
      notes: announcement.notes || ''
    });
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await departmentApiService.deleteAnnouncement(id);
        loadAnnouncements();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      announcement_type: 'GENERAL',
      priority: 'MEDIUM',
      department_id: selectedDepartment?.id || '',
      is_published: false,
      publish_date: '',
      expiry_date: '',
      target_audience: 'ALL',
      attachments: '',
      author: '',
      notes: ''
    });
    setSelectedFiles([]);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    resetForm();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'GENERAL':
        return 'bg-blue-100 text-blue-800';
      case 'ACADEMIC':
        return 'bg-purple-100 text-purple-800';
      case 'EVENT':
        return 'bg-green-100 text-green-800';
      case 'DEADLINE':
        return 'bg-red-100 text-red-800';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const announcementTypes = [
    { value: 'GENERAL', label: 'General' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'EVENT', label: 'Event' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'MAINTENANCE', label: 'Maintenance' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const targetAudienceOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'FACULTY', label: 'Faculty' },
    { value: 'STUDENTS', label: 'Students' },
    { value: 'STAFF', label: 'Staff' },
    { value: 'ALUMNI', label: 'Alumni' },
    { value: 'PARENTS', label: 'Parents' },
    { value: 'PUBLIC', label: 'Public' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Announcements</h2>
          <p className="text-gray-600">
            {selectedDepartment ? `Announcements for ${selectedDepartment.name}` : 'All Announcements'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Announcement
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
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={announcementTypeFilter}
              onChange={(e) => setAnnouncementTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {announcementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No announcements found
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{announcement.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(announcement.announcement_type)}`}>
                      {announcement.announcement_type}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    {announcement.is_published ? (
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{announcement.content}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    {announcement.author && (
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        {announcement.author}
                      </span>
                    )}
                    {announcement.publish_date && (
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                        {new Date(announcement.publish_date).toLocaleDateString()}
                      </span>
                    )}
                    {announcement.target_audience && (
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faGlobe} className="mr-1" />
                        {announcement.target_audience}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
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

      {/* Announcement Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department {selectedDepartment ? '' : '*'}
                  </label>
                  <select
                    name="department_id"
                    value={selectedDepartment?.id || formData.department_id}
                    onChange={handleInputChange}
                    disabled={!!selectedDepartment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">---------</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Announcement title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Announcement type *
                  </label>
                  <select
                    name="announcement_type"
                    value={formData.announcement_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {announcementTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publish date
                  </label>
                  <input
                    type="datetime-local"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry date
                  </label>
                  <input
                    type="datetime-local"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target audience
                  </label>
                  <select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {targetAudienceOptions.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Attachments - modern dropzone + list + optional links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files || []);
                    if (files.length) setSelectedFiles(prev => [...prev, ...files]);
                  }}
                  className="w-full rounded-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors bg-gray-50"
                >
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <FontAwesomeIcon icon={faBullhorn} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drag and drop files here</p>
                    <p className="text-xs text-gray-400">or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-100"
                    >
                      Browse files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setSelectedFiles(prev => [...prev, ...files]);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {selectedFiles.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-md border border-gray-200 p-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                            {f.name.split('.').pop()?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 line-clamp-1">{f.name}</p>
                            <p className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment links (optional)
                  </label>
                  <input
                    type="text"
                    name="attachments"
                    value={formData.attachments}
                    onChange={handleInputChange}
                    placeholder="Comma-separated URLs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Is published
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAnnouncements;
