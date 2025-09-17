import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApiService } from '../../services/academicApiService';
import { LoadingSpinner } from '../LazyComponent';

const defaultForm = {
  student_batch: '',
  course: '',
  course_section: '',
  academic_year: '',
  semester: '',
  status: '',
  auto_enroll_new_students: false,
  notes: ''
};

const BatchEnrollmentsManagement = () => {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null); // id to show
  const [formData, setFormData] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    program: '',
    batch: '',
    course: '',
    academic_year: '',
    semester: '',
    status: '',
    auto_enroll_new_students: ''
  });
  const [ordering, setOrdering] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const listParams = useMemo(() => ({
    search: searchTerm || undefined,
    page,
    ordering: ordering || undefined,
    student_batch__department: filters.department || undefined,
    student_batch__academic_program: filters.program || undefined,
    student_batch: filters.batch || undefined,
    course: filters.course || undefined,
    academic_year: filters.academic_year || undefined,
    semester: filters.semester || undefined,
    status: filters.status || undefined,
    auto_enroll_new_students: filters.auto_enroll_new_students || undefined,
  }), [searchTerm, page, ordering, filters]);

  // List
  const { data: batchEnrollments, isLoading, error } = useQuery({
    queryKey: ['batchEnrollments', listParams],
    queryFn: () => academicApiService.getBatchEnrollments(listParams),
    keepPreviousData: true,
    staleTime: 60_000,
  });

  // Detail
  const { data: detail } = useQuery({
    queryKey: ['batchEnrollmentDetail', showDetail],
    queryFn: () => showDetail ? academicApiService.getBatchEnrollmentDetail(showDetail) : Promise.resolve(null),
    enabled: !!showDetail,
  });

  // Select sources
  const { data: batchesData, isLoading: isBatchesLoading, error: batchesError } = useQuery({
    queryKey: ['studentBatches'],
    queryFn: () => academicApiService.getStudentBatches({ is_active: 'true', page_size: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  // Normalize student batches from different possible API shapes (placed before usage)
  const studentBatches = useMemo(() => {
    const raw = batchesData;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.items)) return raw.items;
    return [];
  }, [batchesData]);

  const { data: coursesData } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: () => academicApiService.getCourses({ search: '', page_size: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: sectionsData, refetch: refetchSections } = useQuery({
    queryKey: ['sections', formData.course, formData.student_batch],
    queryFn: () => academicApiService.getCourseSections({ course: formData.course, student_batch: formData.student_batch, is_active: true, page_size: 50 }),
    enabled: !!formData.course && !!formData.student_batch,
  });

  // Resolve selected batch and filter courses to the batch's academic program
  const selectedBatch = useMemo(() => {
    return studentBatches.find(b => String(b.id) === String(formData.student_batch));
  }, [studentBatches, formData.student_batch]);

  const filteredCourses = useMemo(() => {
    const all = coursesData?.results || [];
    if (!selectedBatch) return all;

    const batchProgramCandidates = [
      selectedBatch.academic_program,
      selectedBatch.program_id,
      selectedBatch.program,
      selectedBatch.academic_program_id,
      selectedBatch.academic_program_code,
      selectedBatch.program_code,
    ].filter(Boolean).map(String);

    if (batchProgramCandidates.length === 0) return all;

    const normalizeToArray = (v) => {
      if (v == null) return [];
      if (Array.isArray(v)) return v;
      return [v];
    };

    return all.filter(c => {
      const courseProgramValues = [
        ...normalizeToArray(c.academic_programs),
        ...normalizeToArray(c.programs),
        ...normalizeToArray(c.program_ids),
        c.academic_program,
        c.program,
        c.program_id,
        c.academic_program_id,
        c.program_code,
        c.academic_program_code,
      ].filter(Boolean).map(String);
      if (courseProgramValues.length === 0) return true; // if course doesn't specify, don't hide it
      return courseProgramValues.some(v => batchProgramCandidates.includes(v));
    });
  }, [coursesData, selectedBatch]);

  // (studentBatches moved above to satisfy initialization order)

  // Discover valid status choices (OPTIONS)
  const { data: optionsData } = useQuery({
    queryKey: ['batchEnrollmentOptions'],
    queryFn: () => academicApiService.getBatchEnrollmentOptions(),
    staleTime: 10 * 60 * 1000,
  });
  const statusChoices = useMemo(() => {
    const choices = optionsData?.statusChoices || [];
    // Normalize to { value, label }
    if (Array.isArray(choices) && choices.length > 0) {
      return choices.map(c => ({ value: String(c.value), label: c.display_name || c.display || String(c.value) }));
    }
    // Fallback to safe defaults if OPTIONS not available
    return [
      { value: 'ACTIVE', label: 'ACTIVE' },
      { value: 'INACTIVE', label: 'INACTIVE' },
      { value: 'COMPLETED', label: 'COMPLETED' },
      { value: 'CANCELLED', label: 'CANCELLED' },
    ];
  }, [optionsData]);

  // Create/Update/Delete
  const createMutation = useMutation({
    mutationFn: (data) => academicApiService.createBatchEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['batchEnrollments']);
      setShowForm(false);
      setFormData(defaultForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicApiService.updateBatchEnrollment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['batchEnrollments']);
      setSelected(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => academicApiService.deleteBatchEnrollment(id),
    onSuccess: () => queryClient.invalidateQueries(['batchEnrollments'])
  });

  const enrollNowMutation = useMutation({
    mutationFn: (id) => academicApiService.enrollStudentsToBatch(id),
    onSuccess: () => queryClient.invalidateQueries(['batchEnrollmentDetail', showDetail])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const allowedStatuses = statusChoices.map(s => String(s.value));
    const normalizedStatus = typeof formData.status === 'string' ? String(formData.status) : '';
    // Backward compatibility mapping from old UI values to backend values
    const statusMap = {
      pending: 'ACTIVE',
      active: 'ACTIVE',
      inactive: 'INACTIVE',
      in_progress: 'ACTIVE',
      completed: 'COMPLETED',
      failed: 'CANCELLED',
      cancelled: 'CANCELLED',
      canceled: 'CANCELLED',
    };
    const mappedStatus = statusMap[normalizedStatus.toLowerCase?.() || ''] || normalizedStatus;
    const payload = {
      student_batch: Number(formData.student_batch),
      course: Number(formData.course),
      course_section: formData.course_section ? Number(formData.course_section) : undefined,
      academic_year: formData.academic_year || undefined,
      semester: formData.semester || undefined,
      // Only include status if backend is likely to accept it; otherwise let server default
      ...(allowedStatuses.includes(mappedStatus) ? { status: mappedStatus } : {}),
      auto_enroll_new_students: !!formData.auto_enroll_new_students,
      notes: formData.notes || ''
    };
    if (selected) {
      updateMutation.mutate({ id: selected.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (enr) => {
    setSelected(enr);
    setFormData({
      student_batch: (typeof enr.student_batch === 'object' ? enr.student_batch?.id : enr.student_batch) || '',
      course: (typeof enr.course === 'object' ? enr.course?.id : enr.course) || '',
      course_section: enr.course_section?.id || enr.course_section || '',
      academic_year: enr.academic_year || '',
      semester: enr.semester || '',
      status: enr.status || 'PENDING',
      auto_enroll_new_students: !!enr.auto_enroll_new_students,
      notes: enr.notes || ''
    });
    setShowForm(true);
    setTimeout(() => refetchSections(), 0);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading batch enrollments: {error.message}</div>;

  const results = batchEnrollments?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Enrollments Management</h1>
          <p className="text-gray-600 mt-2">Enroll entire batches to courses and manage results</p>
        </div>
        <button onClick={() => { setSelected(null); setFormData(defaultForm); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">New</button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="px-3 py-2 border rounded" placeholder="Search batch/course" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value); setPage(1);}} />
          <select className="px-3 py-2 border rounded" value={filters.department} onChange={(e)=>setFilters(v=>({...v, department:e.target.value}))}>
            <option value="">Dept</option>
            {(batchesData?.results||[]).map(b=> (
              <option key={`dept-${b.id}`} value={b.department || b.department_id}>{b.department_name || b.department}</option>
            ))}
          </select>
          <select className="px-3 py-2 border rounded" value={filters.program} onChange={(e)=>setFilters(v=>({...v, program:e.target.value}))}>
            <option value="">Program</option>
            {(batchesData?.results||[]).map(b=> (
              <option key={`prog-${b.id}`} value={b.academic_program || b.program_id}>{b.academic_program_name || b.program_name}</option>
            ))}
          </select>
          <select className="px-3 py-2 border rounded" value={filters.batch} onChange={(e)=>setFilters(v=>({...v, batch:e.target.value}))}>
            <option value="">Batch</option>
            {(batchesData?.results||[]).map(b=> (
              <option key={b.id} value={b.id}>{b.batch_name || b.name}</option>
            ))}
          </select>
          <select className="px-3 py-2 border rounded" value={filters.course} onChange={(e)=>setFilters(v=>({...v, course:e.target.value}))}>
            <option value="">Course</option>
            {(coursesData?.results||[]).map(c=> (
              <option key={c.id} value={c.id}>{c.code ? `${c.code} — ${c.title || c.name}` : (c.title || c.name)}</option>
            ))}
          </select>
          <select className="px-3 py-2 border rounded" value={filters.status} onChange={(e)=>setFilters(v=>({...v, status:e.target.value}))}>
            <option value="">Status</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
        <div className="mt-3 flex gap-3">
          <select className="px-3 py-2 border rounded" value={ordering} onChange={(e)=>setOrdering(e.target.value)}>
            <option value="">Sort</option>
            <option value="-enrollment_date">Newest</option>
            <option value="student_batch__batch_name">Batch</option>
            <option value="course__code">Course Code</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={filters.auto_enroll_new_students === 'true'} onChange={(e)=>setFilters(v=>({...v, auto_enroll_new_students: e.target.checked ? 'true' : ''}))} />
            Auto-enroll only
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Program/Dept</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AY</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sem</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Auto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrolled/Total (%)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map(enr => {
                const sb = enr.student_batch || {};
                const crs = enr.course || {};
                const section = typeof enr.course_section === 'object' ? enr.course_section?.name : enr.course_section;
                const enrolled = enr.enrolled_students_count ?? enr.enrolled_count ?? 0;
                const total = enr.batch_students_count ?? sb.students_count ?? 0;
                const pct = enr.enrollment_percentage ?? (total ? Math.round((enrolled/total)*100) : 0);
                return (
                  <tr key={enr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{sb.batch_name || sb.name || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{(sb.academic_program_name || sb.program_name || '—') + ' / ' + (sb.department_name || sb.department || '—')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{crs.code ? `${crs.code} — ${crs.title || crs.name}` : (crs.title || crs.name || '—')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{section || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{enr.academic_year || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{enr.semester || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm"><span className="px-2 py-1 rounded text-xs bg-gray-100">{enr.status || 'PENDING'}</span></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{enr.auto_enroll_new_students ? <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Auto</span> : ''}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{enrolled}/{total} ({pct}%)</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{enr.created_by || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                      <button className="text-blue-600 hover:underline" onClick={()=>setShowDetail(enr.id)}>View</button>
                      <button className="text-indigo-600 hover:underline" onClick={()=>handleEdit(enr)}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={()=>{ if (window.confirm('Delete this batch enrollment?')) deleteMutation.mutate(enr.id); }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Drawer */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex">
          <div className="ml-auto w-full max-w-xl bg-white h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selected ? 'Edit' : 'Create'} Batch Enrollment</h2>
              <button className="text-gray-500" onClick={()=>{setShowForm(false); setSelected(null); setFormData(defaultForm);}}>Close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Batch</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={formData.student_batch}
                  onChange={(e)=>{
                    const value = e.target.value;
                    const selectedBatch = studentBatches.find(b => String(b.id) === String(value));
                    setFormData(v=>({
                      ...v,
                      student_batch: value,
                      academic_year: v.academic_year || selectedBatch?.academic_year_display || selectedBatch?.academic_year || v.academic_year,
                      semester: v.semester || selectedBatch?.semester || v.semester,
                      // Reset course and section when batch changes to avoid invalid combinations
                      course: '',
                      course_section: '',
                    }));
                    setTimeout(()=>refetchSections(),0);
                  }}
                  required
                >
                  <option value="">{isBatchesLoading ? 'Loading batches…' : 'Select batch'}</option>
                  {(!isBatchesLoading && studentBatches.length === 0) && (
                    <option value="" disabled>No active batches found</option>
                  )}
                  {studentBatches.map(b=> (
                    <option key={b.id} value={b.id} title={`${b.academic_program_code || ''} • AY ${b.academic_year_display || b.academic_year || ''} • Sem ${b.semester || '-'}`}>
                      {(b.batch_name || b.name || `Batch ${b.id}`) + (b.academic_year || b.academic_year_display || b.semester ? ` — AY ${b.academic_year_display || b.academic_year || ''} • Sem ${b.semester || '-'}` : '')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <select className="w-full px-3 py-2 border rounded" value={formData.course} onChange={(e)=>{setFormData(v=>({...v, course:e.target.value})); setTimeout(()=>refetchSections(),0);}} required>
                  <option value="">Select course</option>
                  {filteredCourses.map(c=> (
                    <option key={c.id} value={c.id}>{c.code ? `${c.code} — ${c.title || c.name}` : (c.title || c.name)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Section (optional)</label>
                <select className="w-full px-3 py-2 border rounded" value={formData.course_section} onChange={(e)=>setFormData(v=>({...v, course_section:e.target.value}))} disabled={!formData.student_batch || !formData.course}>
                  <option value="">None</option>
                  {(sectionsData?.results||[]).map(s=> (
                    <option key={s.id} value={s.id}>{s.name || s.section_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                  <input className="w-full px-3 py-2 border rounded" value={formData.academic_year} onChange={(e)=>setFormData(v=>({...v, academic_year:e.target.value}))} placeholder="2024-2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input className="w-full px-3 py-2 border rounded" value={formData.semester} onChange={(e)=>setFormData(v=>({...v, semester:e.target.value}))} placeholder="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full px-3 py-2 border rounded" value={formData.status} onChange={(e)=>setFormData(v=>({...v, status:e.target.value}))}>
                    <option value="">Default</option>
                    {statusChoices.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" className="h-4 w-4" checked={!!formData.auto_enroll_new_students} onChange={(e)=>setFormData(v=>({...v, auto_enroll_new_students:e.target.checked}))} />
                  Auto-enroll new students
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full px-3 py-2 border rounded" rows={3} value={formData.notes} onChange={(e)=>setFormData(v=>({...v, notes:e.target.value}))} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={()=>{setShowForm(false); setSelected(null); setFormData(defaultForm);}}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={createMutation.isPending || updateMutation.isPending}>{selected ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail view */}
      {showDetail && detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex">
          <div className="ml-auto w-full max-w-3xl bg-white h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Batch Enrollment Detail</h2>
              <button className="text-gray-500" onClick={()=>setShowDetail(null)}>Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Batch:</span> {detail.student_batch?.batch_name || detail.student_batch?.name}</div>
              <div><span className="text-gray-500">Course:</span> {detail.course?.code ? `${detail.course.code} — ${detail.course.title || detail.course.name}` : (detail.course?.title || detail.course?.name)}</div>
              <div><span className="text-gray-500">Section:</span> {typeof detail.course_section === 'object' ? (detail.course_section?.name) : (detail.course_section || '—')}</div>
              <div><span className="text-gray-500">AY/Sem:</span> {detail.academic_year} / {detail.semester}</div>
              <div><span className="text-gray-500">Status:</span> {detail.status}</div>
              <div><span className="text-gray-500">Auto-enroll:</span> {detail.auto_enroll_new_students ? 'Yes' : 'No'}</div>
              <div><span className="text-gray-500">Enrolled:</span> {detail.enrolled_students_count} / {detail.batch_students_count} ({detail.enrollment_percentage}%)</div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={()=>{ if(window.confirm('Enroll all students now?')) enrollNowMutation.mutate(detail.id); }}>Enroll students now</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={()=>{ setShowDetail(null); handleEdit(detail); }}>Edit</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={()=>{ if(window.confirm('Delete this batch enrollment?')) { setShowDetail(null); deleteMutation.mutate(detail.id);} }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchEnrollmentsManagement;
