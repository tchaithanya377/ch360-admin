import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt
} from 'react-icons/fa';

const SyllabusTopicsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [syllabusFilter, setSyllabusFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [syllabi, setSyllabi] = useState([]);
  const [formData, setFormData] = useState({
    syllabus: '',
    week_number: '',
    title: '',
    description: '',
    learning_outcomes: '',
    readings: '',
    activities: '',
    hours_allocated: '3',
    order: '0'
  });

  const queryClient = useQueryClient();

  // Fetch syllabi for dropdown
  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        const response = await academicApiService.getSyllabi();
        setSyllabi(response.results || []);
      } catch (error) {
        console.error('Error fetching syllabi:', error);
      }
    };
    fetchSyllabi();
  }, []);

  // Fetch syllabus topics
  const { data: topicsData, isLoading, error } = useQuery({
    queryKey: ['syllabus-topics', searchTerm, syllabusFilter, weekFilter],
    queryFn: () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (syllabusFilter) params.syllabus = syllabusFilter;
      if (weekFilter) params.week_number = weekFilter;
      return academicApiService.getSyllabusTopics(params);
    }
  });

  // Create topic mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createSyllabusTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabus-topics']);
      setShowModal(false);
      resetForm();
    }
  });

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateSyllabusTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabus-topics']);
      setShowModal(false);
      setEditingTopic(null);
      resetForm();
    }
  });

  // Delete topic mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteSyllabusTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabus-topics']);
    }
  });

  const resetForm = () => {
    setFormData({
      syllabus: '',
      week_number: '',
      title: '',
      description: '',
      learning_outcomes: '',
      readings: '',
      activities: '',
      hours_allocated: '3',
      order: '0'
    });
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      syllabus: topic.syllabus,
      week_number: (topic.week_number ?? '').toString(),
      title: topic.title,
      description: topic.description,
      learning_outcomes: topic.learning_outcomes || '',
      readings: topic.readings || '',
      activities: topic.activities || '',
      hours_allocated: (topic.hours_allocated ?? '3').toString(),
      order: (topic.order ?? '0').toString()
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      syllabus: parseInt(formData.syllabus),
      week_number: parseInt(formData.week_number),
      hours_allocated: parseInt(formData.hours_allocated),
      order: parseInt(formData.order)
    };

    if (editingTopic) {
      updateMutation.mutate({ id: editingTopic.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      deleteMutation.mutate(id);
    }
  };

  const getSyllabusTitle = (syllabusId) => {
    const syllabus = syllabi.find(s => s.id === syllabusId);
    return syllabus ? `Syllabus ${syllabus.id}` : 'Unknown Syllabus';
  };

  const topics = topicsData?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading topics</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaGraduationCap className="h-8 w-8 mr-3 text-purple-600" />
                Syllabus Topics Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage individual syllabus topics and weekly content
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Topic
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Syllabus
              </label>
              <select
                value={syllabusFilter}
                onChange={(e) => setSyllabusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Syllabi</option>
                {syllabi.map((syllabus) => (
                  <option key={syllabus.id} value={syllabus.id}>
                    Syllabus {syllabus.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week Number
              </label>
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Weeks</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSyllabusFilter('');
                  setWeekFilter('');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Topics Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Syllabus Topics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Syllabus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {topic.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {topic.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getSyllabusTitle(topic.syllabus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      Week {topic.week_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {topic.hours_allocated} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(topic)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Edit topic"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete topic"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="View details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {topics.length === 0 && (
          <div className="text-center py-12">
            <FaGraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No topics found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first syllabus topic.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Topic
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Syllabus
                    </label>
                    <select
                      required
                      value={formData.syllabus}
                      onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">---------</option>
                      {syllabi.map((syllabus) => (
                        <option key={syllabus.id} value={syllabus.id}>
                          Syllabus {syllabus.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Week number</label>
                    <input type="number" required min="1" max="16" value={formData.week_number} onChange={(e)=>setFormData({ ...formData, week_number:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Week number in the semester" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Topic title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Topic description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning outcomes</label>
                    <textarea rows={3} value={formData.learning_outcomes} onChange={(e)=>setFormData({ ...formData, learning_outcomes:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Specific learning outcomes for this topic" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Readings</label>
                    <textarea rows={3} value={formData.readings} onChange={(e)=>setFormData({ ...formData, readings:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Required readings for this topic" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activities</label>
                    <textarea rows={3} value={formData.activities} onChange={(e)=>setFormData({ ...formData, activities:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Learning activities and assignments" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration hours</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={formData.hours_allocated}
                        onChange={(e) => setFormData({ ...formData, hours_allocated: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="3"
                      />
                      <p className="text-xs text-gray-500 mt-1">Duration in hours</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                      <input type="number" min="0" value={formData.order} onChange={(e)=>setFormData({ ...formData, order:e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      <p className="text-xs text-gray-500 mt-1">Order within the week</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTopic(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTopic ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusTopicsManagement;
