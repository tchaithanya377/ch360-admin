import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import eventsApiService from '../../services/eventsApiService';

const DEFAULT_TZ = 'Asia/Kolkata';
const STATUSES = ['DRAFT','PUBLISHED','CANCELLED','COMPLETED'];

export default function EventForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    start_at: '',
    end_at: '',
    timezone_str: DEFAULT_TZ,
    max_attendees: 0,
    is_public: true,
    status: 'DRAFT',
  });

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.start_at) errs.start_at = 'Start time is required';
    if (!form.end_at) errs.end_at = 'End time is required';
    if (form.start_at && form.end_at && new Date(form.end_at) <= new Date(form.start_at)) errs.end_at = 'End must be after start';
    if (form.max_attendees < 0) errs.max_attendees = 'Must be >= 0';
    if (!form.status) errs.status = 'Status is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, vens, ev] = await Promise.all([
        eventsApiService.listCategories({ is_active: true, ordering: 'name' }),
        eventsApiService.listVenues({ is_active: true, ordering: 'name' }),
        isEdit ? eventsApiService.getEvent(id) : Promise.resolve(null),
      ]);
      setCategories(cats?.results || cats || []);
      setVenues(vens?.results || vens || []);
      if (ev) {
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || '',
          venue: ev.venue || '',
          start_at: ev.start_at ? ev.start_at.slice(0,16) : '',
          end_at: ev.end_at ? ev.end_at.slice(0,16) : '',
          timezone_str: ev.timezone_str || DEFAULT_TZ,
          max_attendees: ev.max_attendees ?? 0,
          is_public: !!ev.is_public,
          status: ev.status || 'DRAFT',
        });
      }
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
      };
      if (isEdit) {
        await eventsApiService.updateEvent(id, payload);
      } else {
        await eventsApiService.createEvent(payload);
      }
      navigate('/admin/events');
    } catch (e) {
      try {
        const json = JSON.parse(e.message);
        if (json && typeof json === 'object') setFieldErrors(json);
      } catch {}
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          {fieldErrors.title && <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue</label>
            <select value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
              <option value="">Select venue</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start At</label>
            <input type="datetime-local" value={form.start_at} onChange={e => setForm({ ...form, start_at: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
            {fieldErrors.start_at && <p className="text-sm text-red-600 mt-1">{fieldErrors.start_at}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End At</label>
            <input type="datetime-local" value={form.end_at} onChange={e => setForm({ ...form, end_at: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
            {fieldErrors.end_at && <p className="text-sm text-red-600 mt-1">{fieldErrors.end_at}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <input value={form.timezone_str} onChange={e => setForm({ ...form, timezone_str: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Attendees</label>
            <input type="number" value={form.max_attendees} onChange={e => setForm({ ...form, max_attendees: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
            {fieldErrors.max_attendees && <p className="text-sm text-red-600 mt-1">{fieldErrors.max_attendees}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="is_public" type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
          <label htmlFor="is_public">Public event</label>
        </div>

        {error && <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}


