import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { FaPlus, FaEdit, FaTrash, FaTimesCircle, FaListUl } from 'react-icons/fa';

const CourseSectionsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchLoadError, setBatchLoadError] = useState('');

  // list filters and paging
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    student_batch: '',
    section_type: '',
    faculty: '',
    is_active: '', // '' | 'true' | 'false'
    ordering: '',
    page: 1,
    page_size: 10,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const isRequiredFilled = (v) => v !== undefined && v !== null && String(v).trim() !== '';
  const validateClient = () => {
    const errs = {};
    if (!isRequiredFilled(formData.course)) errs.course = 'Course is required';
    if (!isRequiredFilled(formData.student_batch)) errs.student_batch = 'Student batch is required';
    if (!isRequiredFilled(formData.section_type)) errs.section_type = 'Section type is required';
    if (!isRequiredFilled(formData.faculty)) errs.faculty = 'Faculty is required';
    const maxVal = formData.max_students === '' ? null : parseInt(formData.max_students);
    const curVal = formData.current_enrollment === '' ? 0 : parseInt(formData.current_enrollment);
    if (maxVal !== null && (isNaN(maxVal) || maxVal <= 0)) errs.max_students = 'Must be a number > 0';
    if (isNaN(curVal) || curVal < 0) errs.current_enrollment = 'Must be a number ≥ 0';
    if (maxVal !== null && !isNaN(curVal) && curVal > maxVal) errs.current_enrollment = 'Cannot exceed Max students';
    return errs;
  };
  const [formData, setFormData] = useState({
    course: '',
    section_number: '',
    section_type: 'LECTURE',
    academic_year: '',
    semester: '',
    student_batch: '',
    faculty: '',
    max_students: '',
    current_enrollment: 0,
    is_active: true,
    notes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === '1') setShowModal(true);
  }, []);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const safeJson = async (promise) => {
          try { const res = await promise; return res; } catch { return { results: [] }; }
        };

        const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [coursesRes, facultyRes, batchesRes] = await Promise.all([
          academicApiService.getCourses({ page_size: 1000 }),
          safeJson(fetch('/api/v1/faculty/', { headers: { 'Content-Type': 'application/json', ...authHeaders } }).then(r => r.json())),
          // Use students API client
          (async () => {
            const json = await academicApiService.getStudentBatches({ page_size: 50 });
            console.log('[StudentBatches] via service', json);
            return json;
          })(),
        ]);
        setCourses(Array.isArray(coursesRes.results) ? coursesRes.results : []);
        setFaculty(Array.isArray(facultyRes.results) ? facultyRes.results : []);
        let batchResults = Array.isArray(batchesRes?.results) ? batchesRes.results
          : Array.isArray(batchesRes?.items) ? batchesRes.items
          : (Array.isArray(batchesRes) ? batchesRes : []);
        // Fallback: if empty, try minimal call
        if (batchResults.length === 0) {
          try {
            const j2 = await academicApiService.getStudentBatches();
            if (j2) {
              if (Array.isArray(j2.results)) batchResults = j2.results;
              else if (Array.isArray(j2.items)) batchResults = j2.items;
              else if (Array.isArray(j2)) batchResults = j2;
            }
          } catch (_) {}
        }
        setBatches(batchResults);
        setBatchLoadError(batchResults.length === 0 ? 'No batches available from the server.' : '');
      } catch (e) {
        console.error('Failed loading references', e);
        setBatchLoadError('Failed to load student batches');
      }
    };
    loadRefs();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['course-sections', filters],
    queryFn: () => academicApiService.getCourseSections({
      search: filters.search || undefined,
      course: filters.course || undefined,
      student_batch: filters.student_batch || undefined,
      section_type: filters.section_type || undefined,
      faculty: filters.faculty || undefined,
      is_active: filters.is_active || undefined,
      ordering: filters.ordering || undefined,
      page: filters.page,
      page_size: filters.page_size,
    }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => academicApiService.createCourseSection(payload),
    onSuccess: () => { queryClient.invalidateQueries(['course-sections']); setShowModal(false); reset(); setFieldErrors({}); },
    onError: (err) => {
      // Extract field-level errors if present
      const msg = err?.message || '';
      const parsed = {};
      msg.split(';').forEach(pair => {
        const [k, v] = pair.split(':');
        if (k && v) parsed[k.trim()] = v.trim();
      });
      setFieldErrors(parsed);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => academicApiService.updateCourseSection(id, payload),
    onSuccess: () => { queryClient.invalidateQueries(['course-sections']); setShowModal(false); setEditing(null); reset(); setFieldErrors({}); },
    onError: (err) => {
      const msg = err?.message || '';
      const parsed = {};
      msg.split(';').forEach(pair => {
        const [k, v] = pair.split(':');
        if (k && v) parsed[k.trim()] = v.trim();
      });
      setFieldErrors(parsed);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteCourseSection(id),
    onSuccess: () => queryClient.invalidateQueries(['course-sections'])
  });

  const reset = () => setFormData({
    course: '', section_number: '', section_type: 'LECTURE', academic_year: '', semester: '',
    student_batch: '', faculty: '', max_students: '', current_enrollment: 0, is_active: true, notes: ''
  });

  const onEdit = (row) => {
    setEditing(row);
    setFormData({
      course: (typeof row.course === 'object' && row.course) ? row.course.id : row.course,
      section_number: row.section_number || '', section_type: row.section_type || 'LECTURE',
      academic_year: row.academic_year || '', semester: row.semester || '',
      student_batch: (typeof row.student_batch === 'object' && row.student_batch) ? row.student_batch.id : (row.student_batch || ''),
      faculty: (typeof row.faculty === 'object' && row.faculty) ? row.faculty.id : (row.faculty || ''),
      max_students: row.max_students != null ? String(row.max_students) : '', current_enrollment: row.current_enrollment || 0,
      is_active: row.is_active !== false, notes: row.notes || ''
    });
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length) {
      setFieldErrors(clientErrs);
      return;
    }
    // Prevent decreasing below current enrollment
    if (formData.max_students && parseInt(formData.max_students) < (parseInt(formData.current_enrollment) || 0)) {
      setFieldErrors({ max_students: 'Cannot be less than current enrollment' });
      return;
    }
    // Only send the fields the API expects
    const payload = {
      course: parseInt(formData.course || '0') || undefined,
      student_batch: formData.student_batch ? parseInt(formData.student_batch) : undefined,
      section_type: formData.section_type || 'LECTURE',
      faculty: formData.faculty ? formData.faculty : null,
      max_students: formData.max_students ? parseInt(formData.max_students) : null,
      current_enrollment: formData.current_enrollment ? parseInt(formData.current_enrollment) : 0,
      is_active: !!formData.is_active,
      notes: formData.notes || '',
    };
    if (editing) updateMutation.mutate({ id: editing.id, payload });
    else createMutation.mutate(payload);
  };

  const rows = data?.results || [];
  
  // Safety check to ensure rows is an array
  if (!Array.isArray(rows)) {
    console.error('Expected rows to be an array, got:', typeof rows, rows);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FaTimesCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Data Format Error</h3>
              <p className="mt-1 text-sm text-red-700">Invalid data format received from server</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return (<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div></div>);
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex"><FaTimesCircle className="h-5 w-5 text-red-400" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Error loading course sections</h3><p className="mt-1 text-sm text-red-700">{error.message}</p></div></div>
    </div>
  );

  const totalCount = data?.count || rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / (filters.page_size || 10)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaListUl className="h-8 w-8 mr-3 text-violet-600" /> Course Sections
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage course sections and capacity</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-violet-600 hover:bg-violet-700">
            <FaPlus className="h-4 w-4 mr-2" /> Add Course Section
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            value={filters.search}
            onChange={(e)=>{ setFilters({ ...filters, search: e.target.value, page: 1 }); }}
            placeholder="Search course, batch, faculty..."
            className="md:col-span-2 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select value={filters.course} onChange={(e)=>setFilters({ ...filters, course: e.target.value, page:1 })} className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
            <option value="">All Courses</option>
            {courses.map(c => (<option key={c.id} value={c.id}>{c.code} - {c.title}</option>))}
          </select>
          <select value={filters.student_batch} onChange={(e)=>setFilters({ ...filters, student_batch: e.target.value, page:1 })} className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
            <option value="">All Batches</option>
            {batches.map(b => (<option key={b.id} value={b.id}>{b.batch_name || b.name || `Batch ${b.id}`}</option>))}
          </select>
          <select value={filters.section_type} onChange={(e)=>setFilters({ ...filters, section_type: e.target.value, page:1 })} className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
            <option value="">All Types</option>
            <option value="LECTURE">Lecture</option>
            <option value="LAB">Lab</option>
            <option value="TUTORIAL">Tutorial</option>
            <option value="SEMINAR">Seminar</option>
            <option value="WORKSHOP">Workshop</option>
          </select>
          <select value={filters.faculty} onChange={(e)=>setFilters({ ...filters, faculty: e.target.value, page:1 })} className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
            <option value="">All Faculty</option>
            {faculty.map(f => (<option key={f.id} value={f.id}>{f.name || `${f.first_name} ${f.last_name}`}</option>))}
          </select>
          <select value={filters.is_active} onChange={(e)=>setFilters({ ...filters, is_active: e.target.value, page:1 })} className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700">
            <option value="">Active: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div className="md:col-span-6 flex items-center gap-2">
            <button onClick={()=>setFilters({ ...filters, ordering: 'course__code', page:1 })} className={`px-3 py-1 text-xs rounded border ${filters.ordering==='course__code'?'bg-violet-600 text-white':'border-gray-300'}`}>Sort by Course</button>
            <button onClick={()=>setFilters({ ...filters, ordering: 'student_batch__batch_name', page:1 })} className={`px-3 py-1 text-xs rounded border ${filters.ordering==='student_batch__batch_name'?'bg-violet-600 text-white':'border-gray-300'}`}>Sort by Batch</button>
            <button onClick={()=>setFilters({ ...filters, ordering: '-updated_at', page:1 })} className={`px-3 py-1 text-xs rounded border ${filters.ordering==='-updated_at'?'bg-violet-600 text-white':'border-gray-300'}`}>Newest Updated</button>
            <button onClick={()=>setFilters({ search:'', course:'', student_batch:'', section_type:'', faculty:'', is_active:'', ordering:'', page:1, page_size:10 })} className="ml-auto px-3 py-1 text-xs rounded border border-gray-300">Clear</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {batchLoadError && (
            <div className="px-4 py-2 bg-yellow-50 text-yellow-800 text-sm border-b border-yellow-200">
              {batchLoadError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Max</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map(row => {
                  // Safety check to ensure row is an object with required properties
                  if (!row || typeof row !== 'object') {
                    console.warn('Invalid row data:', row);
                    return null;
                  }
                  
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (!row.course) return '-';
                          if (typeof row.course === 'object') {
                            return `${row.course.code || ''} - ${row.course.title || ''}`.trim() || `Course ${row.course.id}`;
                          }
                          const course = courses.find(c => c.id === row.course);
                          return course ? `${course.code} - ${course.title}` : `Course ID: ${row.course}`;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          if (!row.student_batch) return '-';
                          if (typeof row.student_batch === 'object') {
                            const b = row.student_batch;
                            return b.batch_name || `Batch ${b.id}`;
                          }
                          const batch = batches.find(b => b.id === row.student_batch);
                          return batch ? (batch.batch_name || batch.name || `Batch ${batch.id}`) : `Batch ID: ${row.student_batch}`;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.section_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{(row.section_type || '').toLowerCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.academic_year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.semester || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.max_students ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.current_enrollment ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{
                        row.available_seats != null
                          ? row.available_seats
                          : (row.max_students == null ? '∞' : Math.max(0, (row.max_students || 0) - (row.current_enrollment || 0)))
                      }</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => onEdit(row)} className="text-violet-600 hover:text-violet-900 mr-3"><FaEdit /></button>
                        <button onClick={() => deleteMutation.mutate(row.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">Page {filters.page} of {totalPages} • {totalCount} items</div>
            <div className="flex items-center gap-2">
              <button disabled={filters.page<=1} onClick={()=>setFilters({ ...filters, page: 1 })} className="px-3 py-1 text-sm border rounded disabled:opacity-50">First</button>
              <button disabled={!data?.previous && filters.page<=1} onClick={()=>setFilters({ ...filters, page: Math.max(1, filters.page-1) })} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
              <select value={filters.page_size} onChange={(e)=>setFilters({ ...filters, page_size: parseInt(e.target.value), page:1 })} className="px-2 py-1 text-sm border rounded">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button disabled={!data?.next && filters.page>=totalPages} onClick={()=>setFilters({ ...filters, page: filters.page+1 })} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              <button disabled={!data?.next && filters.page>=totalPages} onClick={()=>setFilters({ ...filters, page: totalPages })} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Last</button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaListUl className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{editing ? 'Edit Course Section' : 'Add Course Section'}</h3>
                      <p className="text-blue-100 text-sm">Manage course section details and capacity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowModal(false); setEditing(null); reset(); }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={onSubmit} className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Course: <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={formData.course} 
                        onChange={(e) => setFormData({...formData, course: e.target.value})} 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.title}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.course && (<div className="mt-1 text-xs text-red-600">{fieldErrors.course}</div>)}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Section Number: <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.section_number} 
                        onChange={(e) => setFormData({...formData, section_number: e.target.value})} 
                        required 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="e.g., A, B, 01, 02" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Student Batch:
                      </label>
                      <div className="space-y-2">
                        {/* Backend currently doesn't support search; remove text search input */}
                        <select
                          value={formData.student_batch}
                          onChange={(e) => setFormData({ ...formData, student_batch: e.target.value })}
                          className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">{batches.length ? 'Select a batch...' : 'No batches found'}</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id} title={`${b.academic_program_code || ''} • AY ${b.academic_year_display || b.academic_year || ''} • Sem ${b.semester || '-'} • Sec ${b.section || '-'}`}>
                              {b.batch_name || b.name || `Batch ${b.id}`}
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-gray-500">Student batch assigned to this section</div>
                        {fieldErrors.student_batch && (<div className="mt-1 text-xs text-red-600">{fieldErrors.student_batch}</div>)}
                        {(() => {
                          const b = batches.find(x => String(x.id) === String(formData.student_batch));
                          if (!b) return null;
                          return (
                            <div className="text-xs text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                              <div className="font-medium">{b.batch_name}</div>
                              <div className="opacity-80">AY {b.academic_year_display || b.academic_year} • Sem {b.semester || '-'} • Sec {b.section || '-'}</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Section Type:
                      </label>
                      <select 
                        value={formData.section_type} 
                        onChange={(e) => setFormData({...formData, section_type: e.target.value || 'LECTURE'})} 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="LECTURE">📚 Lecture</option>
                        <option value="LAB">🔬 Lab</option>
                        <option value="TUTORIAL">💡 Tutorial</option>
                        <option value="SEMINAR">🎤 Seminar</option>
                        <option value="WORKSHOP">🛠️ Workshop</option>
                      </select>
                      {fieldErrors.section_type && (<div className="mt-1 text-xs text-red-600">{fieldErrors.section_type}</div>)}
                    </div>

                    {/* Removed Academic Year & Semester (derived from batch) */}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Faculty:
                      </label>
                      <select 
                        value={formData.faculty} 
                        onChange={(e) => setFormData({...formData, faculty: e.target.value})} 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select faculty member...</option>
                        {faculty.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name || `${f.first_name} ${f.last_name}`}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.faculty && (<div className="mt-1 text-xs text-red-600">{fieldErrors.faculty}</div>)}
                    </div>
                  </div>
                </div>

                {/* Capacity Settings Section */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Capacity Settings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Max students is optional. Leave blank for unlimited capacity.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Max Students:
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        value={formData.max_students} 
                        onChange={(e) => setFormData({...formData, max_students: e.target.value})} 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                        placeholder="Maximum students for this section (optional)" 
                      />
                      {fieldErrors.max_students && (
                        <div className="mt-1 text-xs text-red-600">{fieldErrors.max_students}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Current Enrollment:
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        value={formData.current_enrollment} 
                        onChange={(e) => setFormData({...formData, current_enrollment: e.target.value})} 
                        className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                        placeholder="Current number of enrolled students (optional)" 
                      />
                      {fieldErrors.current_enrollment && (<div className="mt-1 text-xs text-red-600">{fieldErrors.current_enrollment}</div>)}
                    </div>
                  </div>

                  {/* Live available seats */}
                  <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-700 border border-green-200 dark:border-green-700 text-sm flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Available seats</span>
                    <span className="text-green-700 dark:text-green-300 font-semibold">
                      {formData.max_students === '' || formData.max_students === null ? '∞' : Math.max(0, (parseInt(formData.max_students || '0') || 0) - (parseInt(String(formData.current_enrollment || '0')) || 0))}
                    </span>
                  </div>
                </div>

                {/* Status Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Status
                  </h4>
                  
                  <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                    <input 
                      id="isActive" 
                      type="checkbox" 
                      checked={formData.is_active} 
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Is Active
                    </label>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes:
                  </label>
                  <textarea 
                    rows={4} 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                    placeholder="Additional notes" 
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); setEditing(null); reset(); }} 
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending || Object.keys(validateClient()).length > 0} 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editing ? 'Update Section' : 'Create Section'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSectionsManagement;


