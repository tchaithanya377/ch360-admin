import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaClipboardList,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import { toast } from 'react-toastify';

const AssignmentCategories = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#3B82F6' });
  const [editCategory, setEditCategory] = useState({ name: '', description: '', color: '#3B82F6' });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['assignment-categories'],
    queryFn: () => assignmentsApiService.getCategories(),
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (categoryData) => assignmentsApiService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-categories']);
      setIsCreating(false);
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assignmentsApiService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-categories']);
      setEditingId(null);
      setEditCategory({ name: '', description: '', color: '#3B82F6' });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (categoryId) => assignmentsApiService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignment-categories']);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    createMutation.mutate(newCategory);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditCategory({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
  };

  const handleUpdate = () => {
    if (!editCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    updateMutation.mutate({ id: editingId, data: editCategory });
  };

  const handleDelete = (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCategory({ name: '', description: '', color: '#3B82F6' });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewCategory({ name: '', description: '', color: '#3B82F6' });
  };

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', class: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
    { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
    { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' },
  ];

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
            Error Loading Categories
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load assignment categories'}
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
                Assignment Categories
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Organize your assignments by creating and managing categories
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Category</span>
            </button>
          </div>
        </div>

        {/* Create Category Form */}
        {isCreating && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        newCategory.color === color.value ? 'ring-2 ring-gray-400' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter category description (optional)"
                />
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
                <span>Create Category</span>
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              {editingId === category.id ? (
                // Edit Form
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setEditCategory({ ...editCategory, color: color.value })}
                          className={`w-6 h-6 rounded-full ${color.class} ${
                            editCategory.color === color.value ? 'ring-2 ring-gray-400' : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editCategory.description}
                      onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={2}
                    />
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
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit category"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete category"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <FaClipboardList className="h-4 w-4 mr-2" />
                    <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories?.length === 0 && (
          <div className="text-center py-12">
            <FaClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first assignment category to organize your assignments
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <FaPlus className="h-4 w-4" />
              <span>Create Category</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCategories;

