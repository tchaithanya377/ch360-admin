import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaFileAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaPlay,
  FaStop,
  FaCalendarAlt,
  FaUser,
  FaClipboardList,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentsCRUD = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    max_points: 100,
    due_date: '',
    category: '',
    template: '',
    is_published: false
  });
  const [editAssignment, setEditAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    max_points: 100,
    due_date: '',
    category: '',
    template: '',
    is_published: false
  });

  const queryClient = useQueryClient();

  // Fetch assignments
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['assignments', { search: searchTerm, status: statusFilter, category: categoryFilter }],
    queryFn: () => assignmentsApiService.getAssignments({
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined
    }),
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['assignment-categories'],
    queryFn: () => assignmentsApiService.getCategories(),
  });

  // Fetch templates for dropdown
  const { data: templates } = useQuery({
    queryKey: ['assignment-templates'],
    queryFn: () => assignmentsApiService.getTemplates(),
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: (assignmentData) => assignmentsApiService.createAssignment(assignmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      setIsCreating(false);
      setNewAssignment({
        title: '',
        description: '',
        instructions: '',
        max_points: 100,
        due_date: '',
        category: '',
        template: '',
        is_published: false
      });
      toast.success('Assignment created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create assignment: ${error.message}`);
    },
  });

  // Update assignment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assignmentsApiService.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      setEditingId(null);
      setEditAssignment({
        title: '',
        description: '',
        instructions: '',
        max_points: 100,
        due_date: '',
        category: '',
        template: '',
        is_published: false
      });
      toast.success('Assignment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update assignment: ${error.message}`);
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: (assignmentId) => assignmentsApiService.deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete assignment: ${error.message}`);
    },
  });

  // Publish assignment mutation
  const publishMutation = useMutation({
    mutationFn: (assignmentId) => assignmentsApiService.publishAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment published successfully');
    },
    onError: (error) => {
      toast.error(`Failed to publish assignment: ${error.message}`);
    },
  });

  // Close assignment mutation
  const closeMutation = useMutation({
    mutationFn: (assignmentId) => assignmentsApiService.closeAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment closed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to close assignment: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newAssignment.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }
    if (!newAssignment.due_date) {
      toast.error('Due date is required');
      return;
    }
    createMutation.mutate(newAssignment);
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setEditAssignment({
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      max_points: assignment.max_points || 100,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      category: assignment.category || '',
      template: assignment.template || '',
      is_published: assignment.is_published || false
    });
  };

  const handleUpdate = () => {
    if (!editAssignment.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }
    if (!editAssignment.due_date) {
      toast.error('Due date is required');
      return;
    }
    updateMutation.mutate({ id: editingId, data: editAssignment });
  };

  const handleDelete = (assignmentId, assignmentTitle) => {
    if (window.confirm(`Are you sure you want to delete the assignment "${assignmentTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate(assignmentId);
    }
  };

  const handlePublish = (assignmentId) => {
    publishMutation.mutate(assignmentId);
  };

  const handleClose = (assignmentId) => {
    closeMutation.mutate(assignmentId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAssignment({
      title: '',
      description: '',
      instructions: '',
      max_points: 100,
      due_date: '',
      category: '',
      template: '',
      is_published: false
    });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewAssignment({
      title: '',
      description: '',
      instructions: '',
      max_points: 100,
      due_date: '',
      category: '',
      template: '',
      is_published: false
    });
  };

  const handleView = (assignment) => {
    setViewingId(assignment.id);
  };

  const handleCloseView = () => {
    setViewingId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Assignments
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load assignments'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assignments
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create and manage assignments for your courses
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create Assignment Form */}
        {isCreating && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newAssignment.category}
                  onChange={(e) => setNewAssignment({ ...newAssignment, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template
                </label>
                <select
                  value={newAssignment.template}
                  onChange={(e) => setNewAssignment({ ...newAssignment, template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a template</option>
                  {templates?.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Points
                </label>
                <input
                  type="number"
                  value={newAssignment.max_points}
                  onChange={(e) => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Enter assignment description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Enter assignment instructions"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAssignment.is_published}
                    onChange={(e) => setNewAssignment({ ...newAssignment, is_published: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelCreate}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="h-4 w-4" />
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaSave className="h-4 w-4" />
                )}
                <span>Create Assignment</span>
              </button>
            </div>
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments?.results?.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              {editingId === assignment.id ? (
                // Edit Form
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignment Title *
                      </label>
                      <input
                        type="text"
                        value={editAssignment.title}
                        onChange={(e) => setEditAssignment({ ...editAssignment, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={editAssignment.due_date}
                        onChange={(e) => setEditAssignment({ ...editAssignment, due_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={editAssignment.category}
                        onChange={(e) => setEditAssignment({ ...editAssignment, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select a category</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Points
                      </label>
                      <input
                        type="number"
                        value={editAssignment.max_points}
                        onChange={(e) => setEditAssignment({ ...editAssignment, max_points: parseInt(e.target.value) || 100 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editAssignment.description}
                        onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={editAssignment.instructions}
                        onChange={(e) => setEditAssignment({ ...editAssignment, instructions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaCheck className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FaFileAlt className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="h-4 w-4" />
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaUser className="h-4 w-4" />
                            <span>Max Points: {assignment.max_points}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      {isOverdue(assignment.due_date) && assignment.status === 'published' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {assignment.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
                      <FaClipboardList className="h-4 w-4" />
                      <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(assignment)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View assignment"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Edit assignment"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      {assignment.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(assignment.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="Publish assignment"
                        >
                          <FaPlay className="h-4 w-4" />
                        </button>
                      )}
                      {assignment.status === 'published' && (
                        <button
                          onClick={() => handleClose(assignment.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          title="Close assignment"
                        >
                          <FaStop className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(assignment.id, assignment.title)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete assignment"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {assignments?.results?.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first assignment to get started
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Assignment</span>
            </button>
          </div>
        )}

        {/* View Assignment Modal */}
        {viewingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Assignment Details
                  </h2>
                  <button
                    onClick={handleCloseView}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                {(() => {
                  const assignment = assignments?.results?.find(a => a.id === viewingId);
                  if (!assignment) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {assignment.title}
                        </h3>
                        {assignment.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Max Points:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{assignment.max_points}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {new Date(assignment.due_date).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {assignment.instructions && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions:</h4>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {assignment.instructions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsCRUD;

