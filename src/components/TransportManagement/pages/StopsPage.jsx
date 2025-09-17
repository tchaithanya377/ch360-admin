import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function StopsPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', landmark: '', latitude: '', longitude: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, search, ordering }), [page, search, ordering]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.stops.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  const openCreate = () => { setEditId(null); setForm({ name: '', landmark: '', latitude: '', longitude: '' }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ name: s.name || '', landmark: s.landmark || '', latitude: s.latitude ?? '', longitude: s.longitude ?? '' }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        name: form.name,
        landmark: form.landmark,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };
      if (editId) await TransportAPI.stops.update(editId, payload); else await TransportAPI.stops.create(payload);
      const res = await TransportAPI.stops.list(params);
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
    if (!confirm('Delete this stop?')) return;
    try {
      await TransportAPI.stops.remove(id);
      const res = await TransportAPI.stops.list(params);
      setData(res);
    } catch (e) {
      alert(isStaffWriteError(e) ? 'Insufficient permissions. Staff only operation.' : (e.message || 'Delete failed'));
    }
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stops" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
          <option value="name">Name ↑</option>
          <option value="-name">Name ↓</option>
          <option value="created_at">Created ↑</option>
          <option value="-created_at">Created ↓</option>
        </select>
        <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} stops</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Stop</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Landmark</th>
              <th className="p-2">Latitude</th>
              <th className="p-2">Longitude</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.landmark}</td>
                <td className="p-2">{s.latitude ?? '-'}</td>
                <td className="p-2">{s.longitude ?? '-'}</td>
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
    <Modal open={modalOpen} title={editId ? 'Edit Stop' : 'Add Stop'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Name</label>
          <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Landmark</label>
          <input value={form.landmark} onChange={(e) => setForm(f => ({ ...f, landmark: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Latitude</label>
          <input type="number" step="any" value={form.latitude} onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Longitude</label>
          <input type="number" step="any" value={form.longitude} onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
      </form>
    </Modal>
    </>
  );
}


