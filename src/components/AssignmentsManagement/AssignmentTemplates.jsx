import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaList,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaCopy,
  FaEye,
  FaFileAlt
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentTemplates = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    instructions: '',
    max_points: 100,
    due_date_offset_days: 7,
    category: '',
    is_active: true
  });
  const [editTemplate, setEditTemplate] = useState({
    name: '',
    description: '',
    instructions: '',
    max_points: 100,
    due_date_offset_days: 7,
    category: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['assignment-templates'],
    queryFn: () => assignmentsApiService.getTemplates(),
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['assignment-categories'],
    queryFn: () => assignmentsApiService.getCategories(),
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (templateData) => assignmentsApiService.createTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-templates']);
      setIsCreating(false);
      setNewTemplate({
        name: '',
        description: '',
        instructions: '',
        max_points: 100,
        due_date_offset_days: 7,
        category: '',
        is_active: true
      });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assignmentsApiService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-templates']);
      setEditingId(null);
      setEditTemplate({
        name: '',
        description: '',
        instructions: '',
        max_points: 100,
        due_date_offset_days: 7,
        category: '',
        is_active: true
      });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId) => assignmentsApiService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-templates']);
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    createMutation.mutate(newTemplate);
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setEditTemplate({
      name: template.name,
      description: template.description || '',
      instructions: template.instructions || '',
      max_points: template.max_points || 100,
      due_date_offset_days: template.due_date_offset_days || 7,
      category: template.category || '',
      is_active: template.is_active !== false
    });
  };

  const handleUpdate = () => {
    if (!editTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    updateMutation.mutate({ id: editingId, data: editTemplate });
  };

  const handleDelete = (templateId, templateName) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTemplate({
      name: '',
      description: '',
      instructions: '',
      max_points: 100,
      due_date_offset_days: 7,
      category: '',
      is_active: true
    });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewTemplate({
      name: '',
      description: '',
      instructions: '',
      max_points: 100,
      due_date_offset_days: 7,
      category: '',
      is_active: true
    });
  };

  const handleView = (template) => {
    setViewingId(template.id);
  };

  const handleCloseView = () => {
    setViewingId(null);
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
            Error Loading Templates
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load assignment templates'}
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
                Assignment Templates
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create and manage reusable assignment templates
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Create Template Form */}
        {isCreating && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
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
                  value={newTemplate.max_points}
                  onChange={(e) => setNewTemplate({ ...newTemplate, max_points: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date Offset (days)
                </label>
                <input
                  type="number"
                  value={newTemplate.due_date_offset_days}
                  onChange={(e) => setNewTemplate({ ...newTemplate, due_date_offset_days: parseInt(e.target.value) || 7 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Enter template description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate({ ...newTemplate, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Enter assignment instructions"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.is_active}
                    onChange={(e) => setNewTemplate({ ...newTemplate, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Template
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
                <span>Create Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              {editingId === template.id ? (
                // Edit Form
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={editTemplate.name}
                      onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editTemplate.category}
                      onChange={(e) => setEditTemplate({ ...editTemplate, category: e.target.value })}
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={editTemplate.max_points}
                      onChange={(e) => setEditTemplate({ ...editTemplate, max_points: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date Offset (days)
                    </label>
                    <input
                      type="number"
                      value={editTemplate.due_date_offset_days}
                      onChange={(e) => setEditTemplate({ ...editTemplate, due_date_offset_days: parseInt(e.target.value) || 7 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editTemplate.description}
                      onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={2}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={editTemplate.instructions}
                      onChange={(e) => setEditTemplate({ ...editTemplate, instructions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editTemplate.is_active}
                        onChange={(e) => setEditTemplate({ ...editTemplate, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active Template
                      </span>
                    </label>
                  </div>
                  <div className="flex justify-end space-x-2">
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(template)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View template"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Edit template"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete template"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Max Points:</span>
                      <span className="font-medium">{template.max_points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Due Date Offset:</span>
                      <span className="font-medium">{template.due_date_offset_days} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                      <FaList className="h-4 w-4 mr-2" />
                      <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates?.length === 0 && (
          <div className="text-center py-12">
            <FaList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Templates Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first assignment template to streamline assignment creation
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>
        )}

        {/* View Template Modal */}
        {viewingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Template Details
                  </h2>
                  <button
                    onClick={handleCloseView}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                {(() => {
                  const template = templates?.find(t => t.id === viewingId);
                  if (!template) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {template.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Max Points:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{template.max_points}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Due Date Offset:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{template.due_date_offset_days} days</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            template.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {template.instructions && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions:</h4>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {template.instructions}
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

export default AssignmentTemplates;

