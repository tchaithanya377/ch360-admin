import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, SelectLoaders, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function AssignmentsPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState('start_date');
  const [filters, setFilters] = useState({ vehicle: '', driver: '', route: '', is_active: '' });
  const [options, setOptions] = useState({ vehicles: [], drivers: [], routes: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ vehicle: '', driver: '', route: '', start_date: '', end_date: '', is_active: true });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, ordering, ...filters }), [page, ordering, filters]);

  useEffect(() => {
    let mounted = true;
    const loadFilters = async () => {
      try {
        const [v, d, r] = await Promise.all([
          SelectLoaders.vehicles(),
          SelectLoaders.drivers(),
          SelectLoaders.routes(),
        ]);
        if (mounted) setOptions({ vehicles: v.results, drivers: d.results, routes: r.results });
      } catch {}
    };
    loadFilters();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.assignments.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  const openCreate = () => { setEditId(null); setForm({ vehicle: '', driver: '', route: '', start_date: '', end_date: '', is_active: true }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (a) => { setEditId(a.id); setForm({ vehicle: a.vehicle || '', driver: a.driver || '', route: a.route || '', start_date: a.start_date || '', end_date: a.end_date || '', is_active: !!a.is_active }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        vehicle: Number(form.vehicle),
        driver: form.driver ? Number(form.driver) : null,
        route: Number(form.route),
        start_date: form.start_date,
        end_date: form.end_date || null,
        is_active: !!form.is_active,
      };
      if (editId) await TransportAPI.assignments.update(editId, payload); else await TransportAPI.assignments.create(payload);
      const res = await TransportAPI.assignments.list(params);
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
    if (!confirm('Delete this assignment?')) return;
    try {
      await TransportAPI.assignments.remove(id);
      const res = await TransportAPI.assignments.list(params);
      setData(res);
    } catch (e) {
      alert(isStaffWriteError(e) ? 'Insufficient permissions. Staff only operation.' : (e.message || 'Delete failed'));
    }
  };

  return (
    <>
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Vehicle</label>
          <select value={filters.vehicle} onChange={(e) => setFilters(f => ({ ...f, vehicle: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">All</option>
            {options.vehicles.map(v => <option key={v.id} value={v.id}>{v.number_plate}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Driver</label>
          <select value={filters.driver} onChange={(e) => setFilters(f => ({ ...f, driver: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">All</option>
            {options.drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Route</label>
          <select value={filters.route} onChange={(e) => setFilters(f => ({ ...f, route: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">All</option>
            {options.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Active</label>
          <select value={filters.is_active} onChange={(e) => setFilters(f => ({ ...f, is_active: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">Any</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Ordering</label>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="start_date">Start Date ↑</option>
            <option value="-start_date">Start Date ↓</option>
            <option value="end_date">End Date ↑</option>
            <option value="-end_date">End Date ↓</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} assignments</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Assignment</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Vehicle</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Route</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2">{a.vehicle}</td>
                <td className="p-2">{a.driver ?? '-'}</td>
                <td className="p-2">{a.route}</td>
                <td className="p-2">{a.start_date}</td>
                <td className="p-2">{a.end_date ?? '-'}</td>
                <td className="p-2">{a.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">Delete</button>
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
    <Modal open={modalOpen} title={editId ? 'Edit Assignment' : 'Add Assignment'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Vehicle</label>
          <select value={form.vehicle} onChange={(e) => setForm(f => ({ ...f, vehicle: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {options.vehicles.map(v => <option key={v.id} value={v.id}>{v.number_plate}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Driver (optional)</label>
          <select value={form.driver} onChange={(e) => setForm(f => ({ ...f, driver: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">None</option>
            {options.drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Route</label>
          <select value={form.route} onChange={(e) => setForm(f => ({ ...f, route: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {options.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Start Date</label>
          <input type="date" value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">End Date</label>
          <input type="date" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="a-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          <label htmlFor="a-active" className="text-sm">Active</label>
        </div>
      </form>
    </Modal>
    </>
  );
}


