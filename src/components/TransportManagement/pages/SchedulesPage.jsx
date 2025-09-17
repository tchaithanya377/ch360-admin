import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function SchedulesPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ assignment: '', day_of_week: '' });
  const [ordering, setOrdering] = useState('day_of_week');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ assignment: '', day_of_week: '', departure_time: '', return_time: '', effective_from: '', effective_to: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, ordering, ...filters }), [page, ordering, filters]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.schedules.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  const openCreate = () => { setEditId(null); setForm({ assignment: '', day_of_week: '', departure_time: '', return_time: '', effective_from: '', effective_to: '' }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ assignment: s.assignment || '', day_of_week: s.day_of_week ?? '', departure_time: s.departure_time || '', return_time: s.return_time || '', effective_from: s.effective_from || '', effective_to: s.effective_to || '' }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        assignment: Number(form.assignment),
        day_of_week: Number(form.day_of_week),
        departure_time: form.departure_time,
        return_time: form.return_time || null,
        effective_from: form.effective_from,
        effective_to: form.effective_to || null,
      };
      if (editId) await TransportAPI.schedules.update(editId, payload); else await TransportAPI.schedules.create(payload);
      const res = await TransportAPI.schedules.list(params);
      setData(res);
      setModalOpen(false);
    } catch (e) {
      if (isAuthError(e)) setSubmitError('Authentication required. Please log in again.');
      else if (isStaffWriteError(e)) setSubmitError('Insufficient permissions. Staff only operation.');
      else if (e.status === 400 && e.payload) {
        const msg = Object.entries(e.payload).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
        setSubmitError(msg || e.message);
      } else setSubmitError(e.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await TransportAPI.schedules.remove(id);
      const res = await TransportAPI.schedules.list(params);
      setData(res);
    } catch (e) {
      alert(isStaffWriteError(e) ? 'Insufficient permissions. Staff only operation.' : (e.message || 'Delete failed'));
    }
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Assignment</label>
          <input value={filters.assignment} onChange={(e) => setFilters(f => ({ ...f, assignment: e.target.value }))} placeholder="Assignment ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Day</label>
          <select value={filters.day_of_week} onChange={(e) => setFilters(f => ({ ...f, day_of_week: e.target.value }))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">Any</option>
            {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Ordering</label>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="day_of_week">Day ↑</option>
            <option value="-day_of_week">Day ↓</option>
            <option value="departure_time">Departure ↑</option>
            <option value="-departure_time">Departure ↓</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} schedules</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Schedule</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Assignment</th>
              <th className="p-2">Day</th>
              <th className="p-2">Departure</th>
              <th className="p-2">Return</th>
              <th className="p-2">Effective From</th>
              <th className="p-2">Effective To</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2">{s.assignment}</td>
                <td className="p-2">{s.day_of_week}</td>
                <td className="p-2">{s.departure_time}</td>
                <td className="p-2">{s.return_time ?? '-'}</td>
                <td className="p-2">{s.effective_from}</td>
                <td className="p-2">{s.effective_to ?? '-'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center gap-2">
        <button disabled={!data.previous} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
        <span className="text-sm">Page {page}</span>
        <button disabled={!data.next} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
        <span className="text-xs text-gray-500">Total: {data.count}</span>
      </div>
    </div>
    <Modal open={modalOpen} title={editId ? 'Edit Schedule' : 'Add Schedule'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Assignment</label>
          <input value={form.assignment} onChange={(e) => setForm(f => ({ ...f, assignment: e.target.value }))} placeholder="Assignment ID" className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Day of Week (0-6)</label>
          <select value={form.day_of_week} onChange={(e) => setForm(f => ({ ...f, day_of_week: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Departure Time</label>
          <input type="time" step="1" value={form.departure_time} onChange={(e) => setForm(f => ({ ...f, departure_time: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Return Time</label>
          <input type="time" step="1" value={form.return_time} onChange={(e) => setForm(f => ({ ...f, return_time: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Effective From</label>
          <input type="date" value={form.effective_from} onChange={(e) => setForm(f => ({ ...f, effective_from: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Effective To</label>
          <input type="date" value={form.effective_to} onChange={(e) => setForm(f => ({ ...f, effective_to: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
      </form>
    </Modal>
    </>
  );
}


