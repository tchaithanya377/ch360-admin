import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheckCircle,
  faTimes,
  faEdit,
  faTrash,
  faDownload,
  faUpload,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave,
  faExclamationTriangle,
  faArrowRight,
  faComments,
  faBell,
  faGlobe,
  faLock,
  faUnlock
} from '@fortawesome/free-solid-svg-icons';

const ResultPublication = () => {
  const [publications, setPublications] = useState([
    {
      id: 1,
      title: 'Semester 1 Results - 2024',
      description: 'All departments semester 1 results',
      publishDate: '2024-03-15T10:00:00',
      status: 'published',
      visibility: 'public',
      totalStudents: 1250,
      departments: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'],
      notifications: {
        email: true,
        sms: true,
        whatsapp: false
      },
      accessCount: 342,
      lastAccessed: '2024-03-16T14:30:00'
    },
    {
      id: 2,
      title: 'CS301 Mid-Semester Results',
      description: 'Data Structures mid-semester examination results',
      publishDate: '2024-03-12T16:00:00',
      status: 'scheduled',
      visibility: 'department',
      totalStudents: 45,
      departments: ['Computer Science'],
      notifications: {
        email: true,
        sms: false,
        whatsapp: false
      },
      accessCount: 0,
      lastAccessed: null
    },
    {
      id: 3,
      title: 'EE201 End-Semester Results',
      description: 'Electrical Circuits end-semester examination results',
      publishDate: '2024-03-10T12:00:00',
      status: 'draft',
      visibility: 'private',
      totalStudents: 38,
      departments: ['Electrical Engineering'],
      notifications: {
        email: false,
        sms: false,
        whatsapp: false
      },
      accessCount: 0,
      lastAccessed: null
    }
  ]);

  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    description: '',
    publishDate: '',
    visibility: 'private',
    departments: [],
    notifications: {
      email: false,
      sms: false,
      whatsapp: false
    }
  });

  const [departments] = useState([
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology'
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return faCheckCircle;
      case 'scheduled': return faClock;
      case 'draft': return faEdit;
      case 'archived': return faTimes;
      default: return faClock;
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return faGlobe;
      case 'department': return faUserGraduate;
      case 'private': return faLock;
      default: return faLock;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPublication) {
      setPublications(publications.map(pub => 
        pub.id === editingPublication.id ? { ...publicationForm, id: pub.id, status: 'draft', accessCount: 0, lastAccessed: null } : pub
      ));
    } else {
      const newPublication = {
        ...publicationForm,
        id: Date.now(),
        status: 'draft',
        accessCount: 0,
        lastAccessed: null
      };
      setPublications([...publications, newPublication]);
    }
    setShowPublicationForm(false);
    setEditingPublication(null);
    setPublicationForm({
      title: '',
      description: '',
      publishDate: '',
      visibility: 'private',
      departments: [],
      notifications: {
        email: false,
        sms: false,
        whatsapp: false
      }
    });
  };

  const handlePublish = (publicationId) => {
    setPublications(publications.map(pub => 
      pub.id === publicationId ? { ...pub, status: 'published' } : pub
    ));
  };

  const handleArchive = (publicationId) => {
    setPublications(publications.map(pub => 
      pub.id === publicationId ? { ...pub, status: 'archived' } : pub
    ));
  };

  const handleEdit = (publication) => {
    setEditingPublication(publication);
    setPublicationForm(publication);
    setShowPublicationForm(true);
  };

  const handleDelete = (publicationId) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      setPublications(publications.filter(pub => pub.id !== publicationId));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Result Publication</h2>
          <p className="text-gray-600">Publish and manage result visibility with notifications</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPublicationForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faEye} />
            <span>Create Publication</span>
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
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
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {publications.filter(pub => pub.status === 'published').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {publications.filter(pub => pub.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FontAwesomeIcon icon={faEdit} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">
                {publications.filter(pub => pub.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Access</p>
              <p className="text-2xl font-bold text-gray-900">
                {publications.reduce((sum, pub) => sum + pub.accessCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Result Publications</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {publications.map((publication) => (
              <div key={publication.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{publication.title}</h4>
                    <p className="text-sm text-gray-600">{publication.description}</p>
                    <p className="text-sm text-gray-500">
                      {publication.departments.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(publication.visibility)}`}>
                      <FontAwesomeIcon icon={getVisibilityIcon(publication.visibility)} className="mr-1" />
                      {publication.visibility}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(publication.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(publication.status)} className="mr-1" />
                      {publication.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{publication.totalStudents}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{publication.accessCount}</p>
                    <p className="text-sm text-gray-600">Access Count</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Publish Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(publication.publishDate)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Last Accessed</p>
                    <p className="text-sm font-medium text-gray-900">
                      {publication.lastAccessed ? formatDate(publication.lastAccessed) : 'Never'}
                    </p>
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Notifications:</p>
                  <div className="flex space-x-4">
                    {Object.entries(publication.notifications).map(([type, enabled]) => (
                      <div key={type} className="flex items-center">
                        <FontAwesomeIcon 
                          icon={enabled ? faBell : faTimes} 
                          className={`text-sm mr-1 ${enabled ? 'text-green-600' : 'text-gray-400'}`} 
                        />
                        <span className="text-xs text-gray-600 capitalize">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Created {formatDate(publication.publishDate)}
                  </div>
                  <div className="flex space-x-2">
                    {publication.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(publication.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(publication)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(publication.id)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      Archive
                    </button>
                    <button
                      onClick={() => handleDelete(publication.id)}
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

      {/* Publication Form Modal */}
      {showPublicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingPublication ? 'Edit Publication' : 'Create New Publication'}
              </h3>
              <button
                onClick={() => {
                  setShowPublicationForm(false);
                  setEditingPublication(null);
                  setPublicationForm({
                    title: '',
                    description: '',
                    publishDate: '',
                    visibility: 'private',
                    departments: [],
                    notifications: {
                      email: false,
                      sms: false,
                      whatsapp: false
                    }
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Title</label>
                <input
                  type="text"
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm({...publicationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={publicationForm.description}
                  onChange={(e) => setPublicationForm({...publicationForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input
                  type="datetime-local"
                  value={publicationForm.publishDate}
                  onChange={(e) => setPublicationForm({...publicationForm, publishDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={publicationForm.visibility}
                  onChange={(e) => setPublicationForm({...publicationForm, visibility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="private">Private (Admin Only)</option>
                  <option value="department">Department Only</option>
                  <option value="public">Public (All Students)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departments</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={publicationForm.departments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPublicationForm({
                              ...publicationForm,
                              departments: [...publicationForm.departments, dept]
                            });
                          } else {
                            setPublicationForm({
                              ...publicationForm,
                              departments: publicationForm.departments.filter(d => d !== dept)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Settings</label>
                <div className="space-y-2">
                  {Object.entries(publicationForm.notifications).map(([type, enabled]) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setPublicationForm({
                          ...publicationForm,
                          notifications: {
                            ...publicationForm.notifications,
                            [type]: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{type} Notification</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPublicationForm(false);
                    setEditingPublication(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingPublication ? 'Update Publication' : 'Create Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPublication;
