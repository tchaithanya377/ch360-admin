import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDjangoAuth } from '../../contexts/DjangoAuthContext';
import assignmentsApiService from '../../services/assignmentsApiService';
import { LoadingSpinner } from '../LazyComponent';
import {
  FaPlus, FaFilter, FaSearch, FaCalendarAlt, FaPaperPlane, FaCheck, FaTimes, FaLockOpen, FaLock,
  FaUsers, FaGraduationCap, FaChartBar, FaUpload, FaEye, FaClipboardList, FaExclamationTriangle
} from 'react-icons/fa';
import PeerReviewPanel from './PeerReviewPanel';

const Section = ({ title, children, right }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="flex items-center gap-2">{right}</div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Pill = ({ children, color = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${color}`}>{children}</span>
);

const Tab = ({ id, active, icon: Icon, label, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
  >
    <Icon className="h-4 w-4" /> {label}
  </button>
);

const RoleAware = ({ roles, userRoles, children }) => {
  if (!roles || roles.length === 0) return children;
  const allowed = Array.isArray(userRoles) && roles.some((r) => userRoles.includes(r));
  return allowed ? children : null;
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');
const isOverdue = (a) => a?.status === 'PUBLISHED' && a?.due_date && new Date(a.due_date) < new Date();

const FacultyList = ({ filters, onView, onEdit, onPublish, onClose, onAssignSection, onAnalytics }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['assignments-simple', filters],
    queryFn: () => assignmentsApiService.getAssignmentsSimple({ ...filters, status: filters?.status || undefined }),
    staleTime: 15000,
  });

  if (isLoading) return <div className="py-8 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-600 text-sm">Failed: {error.message}</div>;
  const items = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-300">
            <th className="p-2">Title</th>
            <th className="p-2">Type</th>
            <th className="p-2">Max</th>
            <th className="p-2">Due</th>
            <th className="p-2">Status</th>
            <th className="p-2">Section</th>
            <th className="p-2">Course</th>
            <th className="p-2">Department</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((a) => (
            <tr key={a.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-700/50">
              <td className="p-2 font-medium text-gray-900 dark:text-white">{a.title}</td>
              <td className="p-2">{a.assignment_type}</td>
              <td className="p-2">{a.max_marks}</td>
              <td className="p-2 whitespace-nowrap">{formatDate(a.due_date)} {isOverdue(a) && <Pill color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Overdue</Pill>}</td>
              <td className="p-2">
                <Pill color={a.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : a.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                  {a.status}
                </Pill>
              </td>
              <td className="p-2">{a.section_display || a.course_section_name || '—'}</td>
              <td className="p-2">{a.course_code || a.course_name || '—'}</td>
              <td className="p-2">{a.department_name || '—'}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <button className="btn btn-xs" onClick={() => onView(a)} title="View"><FaEye /></button>
                  <button className="btn btn-xs" onClick={() => onEdit(a)} title="Edit"><FaClipboardList /></button>
                  {a.status === 'DRAFT' && (
                    <button className="btn btn-xs text-green-700" onClick={() => onPublish(a)} title="Publish"><FaLockOpen /></button>
                  )}
                  {a.status !== 'CLOSED' && (
                    <button className="btn btn-xs text-orange-700" onClick={() => onClose(a)} title="Close"><FaLock /></button>
                  )}
                  <button className="btn btn-xs" onClick={() => onAssignSection(a)} title="Assign Section"><FaUsers /></button>
                  <button className="btn btn-xs" onClick={() => onAnalytics(a)} title="Analytics"><FaChartBar /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(items || []).length === 0 && (
        <div className="text-sm text-gray-500 p-4">No assignments</div>
      )}
    </div>
  );
};

const StudentList = ({ onView, onSubmit, onPeer, enabled = true }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentsApiService.getMyAssignments(),
    staleTime: 15000,
    enabled,
  });
  if (isLoading) return <div className="py-8 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-600 text-sm">Failed: {error.message}</div>;
  const items = Array.isArray(data) ? data : data?.results || [];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(items || []).map((a) => (
        <div key={a.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">{a.title}</div>
              <div className="text-xs text-gray-500">Due {formatDate(a.due_date)}</div>
            </div>
            <Pill color={a.is_overdue || a.is_late ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
              {a.is_overdue || a.is_late ? 'Overdue' : 'On Track'}
            </Pill>
          </div>
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{a.description || '—'}</div>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-sm" onClick={() => onView(a)}><FaEye className="mr-1" /> View</button>
            <button className="btn btn-sm bg-blue-600 text-white" onClick={() => onSubmit(a)} disabled={a.status !== 'PUBLISHED'}>
              <FaPaperPlane className="mr-1" /> Submit
            </button>
            {a.enable_peer_review && (
              <button className="btn btn-sm" onClick={() => onPeer(a)}>Peer Reviews</button>
            )}
          </div>
        </div>
      ))}
      {(items || []).length === 0 && <div className="text-sm text-gray-500">No assignments</div>}
    </div>
  );
};

const usePublishClose = () => {
  const qc = useQueryClient();
  const publish = useMutation({
    mutationFn: (id) => assignmentsApiService.publishAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments-simple'] });
    }
  });
  const close = useMutation({
    mutationFn: (id) => assignmentsApiService.closeAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments-simple'] });
    }
  });
  return { publish, close };
};

const SimpleCreate = ({ defaults = {}, onCreated }) => {
  const qc = useQueryClient();
  const [payload, setPayload] = useState({
    title: '', description: '', assignment_type: 'HOMEWORK', max_marks: 100,
    due_date: '', status: 'DRAFT', available_from: '', available_until: '', is_active: true,
    academic_year: '', semester: '', department: '', course: '', course_section: '',
    assigned_to_departments: [], assigned_to_courses: [], assigned_to_course_sections: [],
    ...defaults
  });
  const create = useMutation({
    mutationFn: () => assignmentsApiService.createAssignmentSimple(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['assignments-simple'] });
      onCreated?.(res);
    }
  });
  const disabled = !payload.title || !payload.due_date || !payload.assignment_type || !payload.max_marks;
  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input className="input" placeholder="Title" value={payload.title} onChange={(e)=>setPayload({ ...payload, title: e.target.value })} />
        <select className="input" value={payload.assignment_type} onChange={(e)=>setPayload({ ...payload, assignment_type: e.target.value })}>
          <option value="HOMEWORK">HOMEWORK</option>
          <option value="QUIZ">QUIZ</option>
          <option value="LAB">LAB</option>
          <option value="PROJECT">PROJECT</option>
        </select>
        <input className="input" type="number" placeholder="Max Marks" value={payload.max_marks} onChange={(e)=>setPayload({ ...payload, max_marks: Number(e.target.value || 0) })} />
        <input className="input" type="datetime-local" placeholder="Due Date" onChange={(e)=>setPayload({ ...payload, due_date: new Date(e.target.value).toISOString() })} />
      </div>
      <textarea className="input" placeholder="Description" rows={3} value={payload.description} onChange={(e)=>setPayload({ ...payload, description: e.target.value })} />
      <div className="flex justify-end">
        <button className="btn bg-blue-600 text-white" disabled={create.isLoading || disabled} onClick={()=>create.mutate()}>
          {create.isLoading ? <LoadingSpinner /> : <FaPlus className="mr-2" />} Create
        </button>
      </div>
      {create.isError && <div className="text-red-600 text-sm">{create.error?.message}</div>}
    </div>
  );
};

const SubmissionModal = ({ assignment, onClose }) => {
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const upload = useMutation({
    mutationFn: async () => {
      let fileMeta = null;
      if (file) {
        fileMeta = await assignmentsApiService.uploadFile(file, assignment.id, { file_name: file.name });
      }
      const body = { assignment: assignment.id, content, notes, attachment_files: fileMeta ? [fileMeta?.id || fileMeta?.file_url || fileMeta] : [] };
      return assignmentsApiService.submitAssignment(assignment.id, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      onClose?.();
    }
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="font-semibold">Submit: {assignment.title}</div>
          <button className="btn btn-sm" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="p-4 grid gap-3">
          <textarea className="input" rows={5} placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} />
          <textarea className="input" rows={3} placeholder="Notes (optional)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <FaUpload />
              <input type="file" className="hidden" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
              <span className="text-sm">{file ? file.name : 'Attach file'}</span>
            </label>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn bg-blue-600 text-white" disabled={upload.isLoading || !content} onClick={()=>upload.mutate()}>
            {upload.isLoading ? <LoadingSpinner /> : <><FaPaperPlane className="mr-2" /> Submit</>}
          </button>
        </div>
        {upload.isError && <div className="px-4 pb-4 text-red-600 text-sm">{upload.error?.message}</div>}
      </div>
    </div>
  );
};

const AssignSectionModal = ({ assignment, onClose }) => {
  const qc = useQueryClient();
  const [courseSectionId, setCourseSectionId] = useState('');
  const [includeStudents, setIncludeStudents] = useState(true);
  const assign = useMutation({
    mutationFn: () => assignmentsApiService.assignSection(assignment.id, { course_section_id: courseSectionId, include_students: includeStudents }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments-simple'] });
      onClose?.();
    }
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="font-semibold">Assign Section: {assignment?.title}</div>
          <button className="btn btn-sm" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="p-4 grid gap-3">
          <input className="input" placeholder="Course Section UUID" value={courseSectionId} onChange={(e)=>setCourseSectionId(e.target.value)} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeStudents} onChange={(e)=>setIncludeStudents(e.target.checked)} /> Include students
          </label>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn bg-blue-600 text-white" disabled={!courseSectionId || assign.isLoading} onClick={()=>assign.mutate()}>
            {assign.isLoading ? <LoadingSpinner /> : <FaCheck className="mr-2" />} Assign
          </button>
        </div>
        {assign.isError && <div className="px-4 pb-4 text-red-600 text-sm">{assign.error?.message}</div>}
      </div>
    </div>
  );
};

const DetailDrawer = ({ assignment, onClose }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['assignment-detail', assignment?.id],
    queryFn: () => assignmentsApiService.getAssignment(assignment.id),
    enabled: !!assignment,
  });
  const { data: analytics } = useQuery({
    queryKey: ['assignment-analytics', assignment?.id],
    queryFn: () => assignmentsApiService.getAssignmentAnalytics(assignment.id),
    enabled: !!assignment,
    staleTime: 30000,
  });
  const { data: comments } = useQuery({
    queryKey: ['assignment-comments', assignment?.id],
    queryFn: () => assignmentsApiService.getAssignmentComments(assignment.id),
    enabled: !!assignment,
  });
  const [newComment, setNewComment] = useState('');
  const commentMutation = useMutation({
    mutationFn: () => assignmentsApiService.createAssignmentComment(assignment.id, { assignment: assignment.id, content: newComment, comment_type: 'GENERAL', parent_comment: null }),
    onSuccess: () => {
      setNewComment('');
    },
  });
  const qc = useQueryClient();
  if (commentMutation.isSuccess) {
    qc.invalidateQueries({ queryKey: ['assignment-comments', assignment?.id] });
    commentMutation.reset();
  }
  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-[560px] bg-white dark:bg-gray-900 shadow-2xl transition-transform ${assignment ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="font-semibold">Assignment Details</div>
        <button className="btn btn-sm" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="p-4">
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-600 text-sm">{error.message}</div>}
        {data && (
          <div className="grid gap-3 text-sm">
            <div className="text-lg font-semibold">{data.title}</div>
            <div className="text-gray-600 dark:text-gray-300">{data.description}</div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-500">Type:</span> {data.assignment_type}</div>
              <div><span className="text-gray-500">Max Marks:</span> {data.max_marks}</div>
              <div><span className="text-gray-500">Due:</span> {formatDate(data.due_date)}</div>
              <div><span className="text-gray-500">Status:</span> {data.status}</div>
            </div>
            {analytics && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Submission rate:</span> {analytics.submission_rate ?? '—'}%</div>
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Average grade:</span> {analytics.average_grade ?? '—'}</div>
              </div>
            )}
            {Array.isArray(data.files) && data.files.length > 0 && (
              <Section title="Files">
                <ul className="list-disc pl-5">
                  {data.files.map((f) => (
                    <li key={f.id}><a className="link" href={f.file_url} target="_blank" rel="noreferrer">{f.file_name || 'file'}</a></li>
                  ))}
                </ul>
              </Section>
            )}
            <Section title="Comments">
              {(() => { const commentList = Array.isArray(comments) ? comments : (Array.isArray(comments?.results) ? comments.results : (Array.isArray(comments?.items) ? comments.items : [])); return (
              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {commentList.map((c) => (
                  <div key={c.id} className="p-2 rounded border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{formatDate(c.created_at)} by {c.author_name || 'User'}</div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                ))}
                {commentList.length === 0 && <div className="text-xs text-gray-500">No comments</div>}
              </div>
              ); })()}
              <div className="mt-3 flex gap-2">
                <input className="input flex-1" placeholder="Write a comment" value={newComment} onChange={(e)=>setNewComment(e.target.value)} />
                <button className="btn" disabled={!newComment || commentMutation.isLoading} onClick={()=>commentMutation.mutate()}>
                  {commentMutation.isLoading ? <LoadingSpinner /> : 'Post'}
                </button>
              </div>
              {commentMutation.isError && <div className="text-red-600 text-xs mt-1">{commentMutation.error?.message}</div>}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

const SubmissionsPanel = ({ assignment, onClose }) => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['assignment-submissions', assignment?.id],
    queryFn: () => assignmentsApiService.getAssignmentSubmissions(assignment.id),
    enabled: !!assignment,
  });
  const [grading, setGrading] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const grade = useMutation({
    mutationFn: () => assignmentsApiService.gradeSubmission(grading.id, { marks_obtained: Number(marks), feedback }),
    onSuccess: () => { setGrading(null); setMarks(''); setFeedback(''); qc.invalidateQueries({ queryKey: ['assignment-submissions', assignment?.id] }); },
  });
  const max = assignment?.max_marks || 100;
  const overCap = Number(marks) > max;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="font-semibold">Submissions: {assignment?.title}</div>
          <button className="btn btn-sm" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="p-4">
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-red-600 text-sm">{error.message}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="p-2">Student</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Marks</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="p-2">{s.student_name || s.student || '—'}</td>
                    <td className="p-2">{formatDate(s.submission_date)}</td>
                    <td className="p-2">{s.status || 'SUBMITTED'}</td>
                    <td className="p-2">{s.marks_obtained ?? '—'}</td>
                    <td className="p-2">
                      <button className="btn btn-xs" onClick={()=>{ setGrading(s); setMarks(String(s.marks_obtained || '')); setFeedback(s.feedback || ''); }}>Grade</button>
                    </td>
                  </tr>
                ))}
                {Array.isArray(data) && data.length === 0 && (
                  <tr><td className="p-4 text-sm text-gray-500" colSpan={5}>No submissions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {grading && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="font-medium mb-2">Grade Submission</div>
            <div className="grid md:grid-cols-3 gap-3 items-end">
              <input className="input" type="number" placeholder={`Marks (<= ${max})`} value={marks} onChange={(e)=>setMarks(e.target.value)} />
              <input className="input md:col-span-2" placeholder="Feedback" value={feedback} onChange={(e)=>setFeedback(e.target.value)} />
            </div>
            {overCap && (
              <div className="mt-2 text-xs text-red-600 inline-flex items-center gap-1"><FaExclamationTriangle /> Marks cannot exceed max ({max})</div>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <button className="btn" onClick={()=>setGrading(null)}>Cancel</button>
              <button className="btn bg-blue-600 text-white" disabled={grade.isLoading || overCap || marks === ''} onClick={()=>grade.mutate()}>Save Grade</button>
            </div>
            {grade.isError && <div className="text-red-600 text-xs mt-1">{grade.error?.message}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

const PeerPlagPanel = ({ assignment, onClose }) => {
  const qc = useQueryClient();
  const { data: reviews } = useQuery({
    queryKey: ['peer-reviews', assignment?.id],
    queryFn: () => assignmentsApiService.getPeerReviews(assignment.id),
    enabled: !!assignment,
  });
  const assign = useMutation({
    mutationFn: () => assignmentsApiService.assignPeerReviews(assignment.id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['peer-reviews', assignment?.id] }),
  });
  const { data: plag } = useQuery({
    queryKey: ['plagiarism', assignment?.id],
    queryFn: () => assignmentsApiService.getPlagiarismChecks(assignment.id),
    enabled: !!assignment,
    staleTime: 15000,
  });
  const triggerPlag = useMutation({
    mutationFn: () => assignmentsApiService.triggerPlagiarismCheckForAssignment(assignment.id, { trigger: 'MANUAL' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plagiarism', assignment?.id] }),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="font-semibold">Peer Reviews & Plagiarism: {assignment?.title}</div>
          <button className="btn btn-sm" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <Section title="Peer Reviews" right={<button className="btn btn-sm" onClick={()=>assign.mutate()} disabled={assign.isLoading}>Assign</button>}>
            <PeerReviewPanel reviews={Array.isArray(reviews) ? reviews : []} onAssign={()=>assign.mutate()} onSubmitReview={()=>{}} isAssigning={assign.isLoading} isSubmitting={false} />
          </Section>
          <Section title="Plagiarism Checks" right={<button className="btn btn-sm" onClick={()=>triggerPlag.mutate()} disabled={triggerPlag.isLoading}>Run</button>}>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {(Array.isArray(plag) ? plag : []).map((p) => (
                <div key={p.id} className="p-2 border rounded border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500">{formatDate(p.created_at)} • {p.status}</div>
                  <div className="text-sm">Similarity: {p.similarity_percentage ?? '—'}%</div>
                </div>
              ))}
              {Array.isArray(plag) && plag.length === 0 && <div className="text-xs text-gray-500">No checks</div>}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const AssignmentsOnePage = () => {
  const { user } = useDjangoAuth();
  const roles = user?.roles || [];
  const isFaculty = roles.includes('faculty') || roles.includes('Faculty');
  const isStudent = roles.includes('student') || roles.includes('Student');

  const [active, setActive] = useState(isStudent ? 'student' : 'faculty');
  const [viewing, setViewing] = useState(null);
  const [submittingFor, setSubmittingFor] = useState(null);
  const [assigningFor, setAssigningFor] = useState(null);
  const [submissionsFor, setSubmissionsFor] = useState(null);
  const [peerPlagFor, setPeerPlagFor] = useState(null);

  const { publish, close } = usePublishClose();

  const [filters, setFilters] = useState({ status: 'PUBLISHED' });

  const topRight = (
    <div className="flex items-center gap-2">
      <RoleAware roles={["faculty","Faculty","admin"]} userRoles={roles}>
        <button className="btn" onClick={()=>setActive('create')}><FaPlus className="mr-2" /> New</button>
      </RoleAware>
      <div className="hidden sm:flex items-center gap-2">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search title..." onChange={(e)=>setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="input" value={filters.status || ''} onChange={(e)=>setFilters({ ...filters, status: e.target.value || undefined })}>
          <option value="">Any status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <div className="flex items-center gap-2"><FaCalendarAlt />
          <input type="datetime-local" className="input" onChange={(e)=>setFilters({ ...filters, due_after: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          <span className="text-xs text-gray-500">to</span>
          <input type="datetime-local" className="input" onChange={(e)=>setFilters({ ...filters, due_before: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RoleAware roles={["student","Student"]} userRoles={roles}>
              <Tab id="student" active={active==='student'} icon={FaGraduationCap} label="Student" onClick={setActive} />
            </RoleAware>
            <RoleAware roles={["faculty","Faculty","admin"]} userRoles={roles}>
              <Tab id="faculty" active={active==='faculty'} icon={FaClipboardList} label="Faculty" onClick={setActive} />
              <Tab id="create" active={active==='create'} icon={FaPlus} label="Create" onClick={setActive} />
            </RoleAware>
          </div>
        </div>

        {active === 'student' && (
          <Section title="My Assignments" right={null}>
            <StudentList enabled={isStudent} onView={(a)=>setViewing(a)} onSubmit={(a)=>setSubmittingFor(a)} onPeer={(a)=>setViewing(a)} />
          </Section>
        )}

        {active === 'faculty' && (
          <Section title="Assignments" right={topRight}>
            <FacultyList
              filters={filters}
              onView={(a)=>setViewing(a)}
              onEdit={(a)=>setActive('create')}
              onPublish={(a)=>publish.mutate(a.id)}
              onClose={(a)=>close.mutate(a.id)}
              onAssignSection={(a)=>setAssigningFor(a)}
              onAnalytics={(a)=>setSubmissionsFor(a)}
            />
          </Section>
        )}

        {active === 'create' && (
          <Section title="Create Assignment (Simple)">
            <SimpleCreate onCreated={(a)=>{ setActive('faculty'); setViewing(a); }} />
          </Section>
        )}

      </div>

      {viewing && <DetailDrawer assignment={viewing} onClose={()=>setViewing(null)} />}
      {submittingFor && <SubmissionModal assignment={submittingFor} onClose={()=>setSubmittingFor(null)} />}
      {assigningFor && <AssignSectionModal assignment={assigningFor} onClose={()=>setAssigningFor(null)} />}
      {submissionsFor && <SubmissionsPanel assignment={submissionsFor} onClose={()=>setSubmissionsFor(null)} />}
      {peerPlagFor && <PeerPlagPanel assignment={peerPlagFor} onClose={()=>setPeerPlagFor(null)} />}
    </div>
  );
};

export default AssignmentsOnePage;

// Tailwind-ish utility classes for quick UI
// Using existing project styles: define minimal utilities
// .input and .btn are used across project in multiple components, keeping consistency.

