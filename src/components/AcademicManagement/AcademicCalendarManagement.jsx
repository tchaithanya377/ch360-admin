import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

const AcademicCalendarManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    academic_year: '',
    semester: '',
    is_academic_day: false
  });

  const queryClient = useQueryClient();

  // Auto-open modal if ?add=1 is present
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === '1') {
        setShowModal(true);
      }
    } catch (_) {}
  }, []);

  // Fetch academic calendar events
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['academic-calendar', searchTerm, eventTypeFilter, semesterFilter],
    queryFn: () => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (eventTypeFilter) params.event_type = eventTypeFilter;
      if (semesterFilter) params.semester = semesterFilter;
      return academicApiService.getAcademicCalendar(params);
    }
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createAcademicCalendarEvent(data),
    onSuccess: (response) => {
      console.log('✅ Academic calendar event created successfully:', response);
      queryClient.invalidateQueries(['academic-calendar']);
      setShowModal(false);
      resetForm();
      // You could add a toast notification here
    },
    onError: (error) => {
      console.error('❌ Failed to create academic calendar event:', error);
      console.error('Error details:', error.message);
      // You could add error toast notification here
    }
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateAcademicCalendarEvent(id, data),
    onSuccess: (response) => {
      console.log('✅ Academic calendar event updated successfully:', response);
      queryClient.invalidateQueries(['academic-calendar']);
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
    },
    onError: (error) => {
      console.error('❌ Failed to update academic calendar event:', error);
      console.error('Error details:', error.message);
    }
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteAcademicCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['academic-calendar']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: '',
      start_date: '',
      end_date: '',
      academic_year: '',
      semester: '',
      is_academic_day: false
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.academic_year.trim()) {
      errors.academic_year = 'Academic year is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!formData.semester || formData.semester.trim() === '') {
      errors.semester = 'Semester is required';
    }
    
    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      errors.end_date = 'End date cannot be before start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date,
      academic_year: event.academic_year,
      semester: event.semester,
      is_academic_day: !!event.is_academic_day
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }
    
    const submitData = { ...formData };

    // Handle empty semester field - API requires a valid value, not null
    if (!submitData.semester || submitData.semester.trim() === '') {
      submitData.semester = '1'; // Default to Semester 1 if not selected
    }

    // Handle empty event_type field
    if (!submitData.event_type || submitData.event_type.trim() === '') {
      submitData.event_type = 'ACADEMIC'; // Default to ACADEMIC if not selected
    }

    // Log the data being sent to API for testing
    console.log('Submitting academic calendar event with data:', submitData);
    console.log('Event type:', submitData.event_type);
    console.log('Semester:', submitData.semester);
    console.log('All required fields present:', {
      title: !!submitData.title,
      description: !!submitData.description,
      academic_year: !!submitData.academic_year,
      start_date: !!submitData.start_date,
      semester: !!submitData.semester,
      event_type: !!submitData.event_type
    });

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  const events = eventsData?.results || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Loading Events</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we fetch your academic calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-2xl mb-6">
              <FaTimesCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Events</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FaCalendarAlt className="h-8 w-8 text-white" />
                </div>
            <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Academic Calendar
              </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Manage academic events, holidays, and important dates
              </p>
            </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FaCalendarAlt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Academic Days</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {events.filter(e => e.is_academic_day).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <FaClock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {events.filter(e => new Date(e.start_date) > new Date()).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                <FaPlus className="h-5 w-5 mr-2" />
                Add New Event
              </button>
              <button
                onClick={() => {
                  setFormData({
                    title: 'Test Academic Event',
                    description: 'This is a test event for API validation',
                    event_type: 'ACADEMIC',
                    start_date: new Date().toISOString().slice(0, 10),
                    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                    academic_year: '2024-2025',
                    semester: '1',
                    is_academic_day: true
                  });
                  setShowModal(true);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
              >
                🧪 Test Form
            </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <FaFilter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Events</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Search Events
              </label>
              <div className="relative">
                <FaSearch className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Event Type
              </label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Event Types</option>
                <option value="ACADEMIC">📚 Academic</option>
                <option value="HOLIDAY">🎉 Holiday</option>
                <option value="EXAM">📝 Exam</option>
                <option value="EVENT">🎪 Event</option>
                <option value="DEADLINE">⏰ Deadline</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setEventTypeFilter('');
                  setSemesterFilter('');
                }}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const getEventTypeIcon = (type) => {
              switch (type) {
                case 'ACADEMIC': return '📚';
                case 'HOLIDAY': return '🎉';
                case 'EXAM': return '📝';
                case 'EVENT': return '🎪';
                case 'DEADLINE': return '⏰';
                default: return '📅';
              }
            };

            const getEventTypeColor = (type) => {
              switch (type) {
                case 'ACADEMIC': return 'from-blue-500 to-blue-600';
                case 'HOLIDAY': return 'from-green-500 to-green-600';
                case 'EXAM': return 'from-red-500 to-red-600';
                case 'EVENT': return 'from-purple-500 to-purple-600';
                case 'DEADLINE': return 'from-orange-500 to-orange-600';
                default: return 'from-gray-500 to-gray-600';
              }
            };

            return (
            <div
              key={event.id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
                {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-gradient-to-r ${getEventTypeColor(event.event_type)} rounded-xl shadow-lg`}>
                      <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                    </div>
                <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {event.academic_year} • Semester {event.semester}
                  </p>
                </div>
                  </div>
                  
                  {event.is_academic_day && (
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                      <FaCheckCircle className="h-3 w-3" />
                      <span className="text-xs font-semibold">Academic Day</span>
                </div>
                  )}
              </div>

                {/* Event Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                {event.description}
              </p>

                {/* Event Dates */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <FaClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  {event.end_date && event.end_date !== event.start_date && (
                      <>
                        <span className="text-gray-400">to</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(event.end_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </>
                  )}
                </div>
              </div>

                {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                      className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Edit event"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                      className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Delete event"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
                  
                <button
                    className="p-3 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
                  title="View details"
                >
                  <FaEye className="h-4 w-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl mb-8">
                <FaCalendarAlt className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Events Found
            </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Start building your academic calendar by creating your first event. 
                You can add holidays, exams, deadlines, and more.
            </p>
              <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FaPlus className="h-5 w-5 mr-2" />
                  Create First Event
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      title: 'Test Academic Event',
                      description: 'This is a test event for API validation',
                      event_type: 'ACADEMIC',
                      start_date: new Date().toISOString().slice(0, 10),
                      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                      academic_year: '2024-2025',
                      semester: '1',
                      is_academic_day: true
                    });
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  🧪 Try Test Form
            </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <FaCalendarAlt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {editingEvent ? 'Update event details' : 'Add a new academic calendar event'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                >
                  <FaTimesCircle className="h-6 w-6" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Event Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                      placeholder="Enter event title..."
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-600 flex items-center">
                        <FaTimesCircle className="h-4 w-4 mr-1" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Event Type
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select event type...</option>
                      <option value="ACADEMIC">📚 Academic</option>
                      <option value="HOLIDAY">🎉 Holiday</option>
                      <option value="EXAM">📝 Exam</option>
                      <option value="EVENT">🎪 Event</option>
                      <option value="DEADLINE">⏰ Deadline</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.start_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.start_date && (
                        <p className="text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="h-4 w-4 mr-1" />
                          {formErrors.start_date}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, start_date: new Date().toISOString().slice(0,10) })}
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          Set Today
                        </button>
                        <span>Server time: +5.5 hours</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        End Date <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.end_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.end_date && (
                        <p className="text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="h-4 w-4 mr-1" />
                          {formErrors.end_date}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, end_date: new Date().toISOString().slice(0,10) })}
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          Set Today
                        </button>
                        <span>Server time: +5.5 hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none ${
                        formErrors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                      placeholder="Describe the event details..."
                    />
                    {formErrors.description && (
                      <p className="text-sm text-red-600 flex items-center">
                        <FaTimesCircle className="h-4 w-4 mr-1" />
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academic_year}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.academic_year ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                        placeholder="e.g., 2024-2025"
                      />
                      {formErrors.academic_year && (
                        <p className="text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="h-4 w-4 mr-1" />
                          {formErrors.academic_year}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Semester
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className={`w-full border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.semester ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select semester...</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                      {formErrors.semester && (
                        <p className="text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="h-4 w-4 mr-1" />
                          {formErrors.semester}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <input
                        id="isAcademicDay"
                        type="checkbox"
                        checked={!!formData.is_academic_day}
                        onChange={(e) => setFormData({ ...formData, is_academic_day: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                      />
                      <div>
                        <label htmlFor="isAcademicDay" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                          Academic Day
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Check if this is a regular academic day with classes
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 rounded-b-3xl">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingEvent(null);
                        resetForm();
                      }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                  form="event-form"
                      disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaPlus className="h-4 w-4" />
                      <span>{editingEvent ? 'Update Event' : 'Create Event'}</span>
                    </div>
                  )}
                    </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendarManagement;
