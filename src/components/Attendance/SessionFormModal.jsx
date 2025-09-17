import React, { useEffect, useState } from 'react';
import AttendanceService from '../../services/attendanceApiService';
import academicApiService from '../../services/academicApiService';
import { useNavigate, useParams } from 'react-router-dom';

const initialState = {
  course_section: '',
  timetable: '',
  date: '',
  start_time: '',
  end_time: '',
  room: '',
  is_cancelled: false,
  notes: ''
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
    {children}
  </label>
);

const SessionFormModal = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        const data = await AttendanceService.getSession(id);
        setValues({
          course_section: data.course_section ?? '',
          timetable: data.timetable ?? '',
          date: data.date ?? '',
          start_time: data.start_time ?? '',
          end_time: data.end_time ?? '',
          room: data.room ?? '',
          is_cancelled: Boolean(data.is_cancelled),
          notes: data.notes ?? ''
        });
      } catch (e) {
        setErrors({ form: e.message });
      }
    };
    load();
  }, [id, isEdit]);

  useEffect(() => {
    const loadRefs = async () => {
      setLoadingRefs(true);
      try {
        const [coursesRes, sectionsRes] = await Promise.all([
          academicApiService.getCourses({ page_size: 200 }).catch(() => ({ results: [] })),
          academicApiService.getCourseSections({ is_active: 'true', page_size: 200, ordering: 'course__code' }).catch(() => ({ results: [] })),
        ]);
        const courseResults = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.results || []);
        const sectionResults = Array.isArray(sectionsRes) ? sectionsRes : (sectionsRes?.results || []);
        setCourses(courseResults);
        setSections(sectionResults);
      } finally {
        setLoadingRefs(false);
      }
    };
    loadRefs();
  }, []);

  // If editing: ensure we back-fill course/sections/timetables linked to existing values
  useEffect(() => {
    const hydrateForEdit = async () => {
      if (!isEdit) return;
      try {
        if (values.course_section) {
          const section = await academicApiService.getCourseSection(values.course_section).catch(() => null);
          const courseId = section?.course?.id || section?.course || '';
          if (courseId) {
            setSelectedCourse(String(courseId));
            const secs = await academicApiService.getCourseSections({ course: courseId, is_active: 'true', page_size: 200 }).catch(() => ({ results: [] }));
            const secResults = Array.isArray(secs) ? secs : (secs?.results || []);
            setSections(secResults);
          }
          // Load timetables for this section
          const times = await academicApiService.getTimetables({ course_section: values.course_section, is_active: 'true', ordering: 'day_of_week,start_time', page_size: 200 }).catch(() => ({ results: [] }));
          const timeResults = Array.isArray(times) ? times : (times?.results || []);
          setTimetables(timeResults);
        }
      } catch {}
    };
    hydrateForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, values.course_section]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const payload = {
      course_section: Number(values.course_section),
      timetable: values.timetable ? Number(values.timetable) : null,
      date: values.date,
      start_time: values.start_time,
      end_time: values.end_time,
      room: values.room,
      is_cancelled: Boolean(values.is_cancelled),
      notes: values.notes
    };
    try {
      if (isEdit) {
        await AttendanceService.updateSession(id, payload);
        navigate(`/attendance/${id}`);
      } else {
        const created = await AttendanceService.createSession(payload);
        navigate(`/attendance/${created.id}?new=1`);
      }
    } catch (e) {
      if (e.status === 400 && e.data) setErrors(e.data);
      else setErrors({ form: e.message || 'Save failed' });
    } finally {
      setLoading(false);
    }
  };

  const onChangeCourse = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    // Reset dependent fields
    setValues(v => ({ ...v, course_section: '', timetable: '' }));
    setTimetables([]);
    if (!courseId) { setSections([]); return; }
    try {
      const secs = await academicApiService.getCourseSections({ course: courseId, is_active: 'true', ordering: 'course__code', page_size: 200 }).catch(() => ({ results: [] }));
      const secResults = Array.isArray(secs) ? secs : (secs?.results || []);
      setSections(secResults);
    } catch { setSections([]); }
  };

  const onChangeSection = async (e) => {
    const sectionId = e.target.value;
    setValues(v => ({ ...v, course_section: sectionId, timetable: '' }));
    setTimetables([]);
    if (!sectionId) return;
    try {
      const times = await academicApiService.getTimetables({ course_section: sectionId, is_active: 'true', ordering: 'day_of_week,start_time', page_size: 200 }).catch(() => ({ results: [] }));
      const timeResults = Array.isArray(times) ? times : (times?.results || []);
      setTimetables(timeResults);
    } catch { setTimetables([]); }
  };

  const onChangeTimetable = (e) => {
    const timetableId = e.target.value;
    setValues(v => ({ ...v, timetable: timetableId }));
    const t = timetables.find(tt => String(tt.id) === String(timetableId));
    if (t) {
      setValues(v => ({
        ...v,
        start_time: t.start_time || v.start_time,
        end_time: t.end_time || v.end_time,
        room: t.room || v.room,
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{isEdit ? 'Edit Session' : 'Create Session'}</h2>
      </div>
      {errors.form && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{String(errors.form)}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <Field label="Course">
          <select value={selectedCourse} onChange={onChangeCourse} className="mt-1 w-full px-3 py-2 rounded-md border">
            <option value="" disabled>{loadingRefs ? 'Loading courses...' : 'Select course'}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code ? `${c.code} — ${c.title || c.name || ''}` : (c.title || c.name || `Course #${c.id}`)}</option>
            ))}
          </select>
        </Field>
        <Field label="Course Section">
          <select name="course_section" value={values.course_section} onChange={onChangeSection} required className="mt-1 w-full px-3 py-2 rounded-md border">
            <option value="" disabled>{loadingRefs ? 'Loading sections...' : 'Select section'}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{
                s?.display_name || s?.name || s?.title || s?.label || s?.section_name || (s?.course?.code && s?.section ? `${s.course.code}-${s.section}` : `Section #${s?.id}`)
              }</option>
            ))}
          </select>
          {errors.course_section && <p className="text-xs text-red-600 mt-1">{String(errors.course_section)}</p>}
        </Field>
        <Field label="Timetable (optional)">
          <select name="timetable" value={values.timetable} onChange={onChangeTimetable} className="mt-1 w-full px-3 py-2 rounded-md border">
            <option value="">None</option>
            {timetables.map((t) => (
              <option key={t.id} value={t.id}>{
                t?.name || t?.title || t?.label || `${t.day_of_week_display || t.day_of_week || ''} ${t.start_time || ''}-${t.end_time || ''} ${t.room ? `• ${t.room}` : ''}`.trim() || `Timetable #${t?.id}`
              }</option>
            ))}
          </select>
          {errors.timetable && <p className="text-xs text-red-600 mt-1">{String(errors.timetable)}</p>}
        </Field>
        <Field label="Date">
          <input type="date" name="date" value={values.date} onChange={onChange} required className="mt-1 w-full px-3 py-2 rounded-md border" />
          {errors.date && <p className="text-xs text-red-600 mt-1">{String(errors.date)}</p>}
        </Field>
        <Field label="Start Time">
          <input type="time" name="start_time" value={values.start_time} onChange={onChange} required className="mt-1 w-full px-3 py-2 rounded-md border" />
          {errors.start_time && <p className="text-xs text-red-600 mt-1">{String(errors.start_time)}</p>}
        </Field>
        <Field label="End Time">
          <input type="time" name="end_time" value={values.end_time} onChange={onChange} required className="mt-1 w-full px-3 py-2 rounded-md border" />
          {errors.end_time && <p className="text-xs text-red-600 mt-1">{String(errors.end_time)}</p>}
        </Field>
        <Field label="Room">
          <input name="room" value={values.room} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-md border" />
          {errors.room && <p className="text-xs text-red-600 mt-1">{String(errors.room)}</p>}
        </Field>
        <Field label="Cancelled?">
          <input type="checkbox" name="is_cancelled" checked={values.is_cancelled} onChange={onChange} className="mt-1 h-5 w-5" />
          {errors.is_cancelled && <p className="text-xs text-red-600 mt-1">{String(errors.is_cancelled)}</p>}
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes">
            <textarea name="notes" value={values.notes} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-md border" rows={3} />
            {errors.notes && <p className="text-xs text-red-600 mt-1">{String(errors.notes)}</p>}
          </Field>
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/attendance')} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Session')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionFormModal;


