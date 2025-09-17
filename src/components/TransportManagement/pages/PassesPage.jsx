import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, SelectLoaders, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function PassesPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ user: '', route: '', pass_type: '', is_active: '' });
  const [ordering, setOrdering] = useState('valid_from');
  const [options, setOptions] = useState({ routes: [], stops: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ user: '', route: '', start_stop: '', end_stop: '', pass_type: 'STUDENT', valid_from: '', valid_to: '', price: '', is_active: true });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, ordering, ...filters }), [page, ordering, filters]);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      try {
        const r = await SelectLoaders.routes();
        if (mounted) setOptions(o => ({ ...o, routes: r.results }));
      } catch {}
    };
    loadOptions();
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.passes.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  // When route changes in form, optionally constrain stops to that route
  useEffect(() => {
    let active = true;
    const fetchRouteStops = async () => {
      if (!form.route) { setOptions(o => ({ ...o, stops: [] })); return; }
      try {
        const route = await TransportAPI.routes.retrieve(form.route);
        if (!active) return;
        const ordered = (route.route_stops || []).sort((a, b) => a.order_index - b.order_index);
        const stops = ordered.map(rs => rs.stop).filter(Boolean);
        setOptions(o => ({ ...o, stops }));
      } catch { setOptions(o => ({ ...o, stops: [] })); }
    };
    fetchRouteStops();
    return () => { active = false; };
  }, [form.route]);

  const openCreate = () => { setEditId(null); setForm({ user: '', route: '', start_stop: '', end_stop: '', pass_type: 'STUDENT', valid_from: '', valid_to: '', price: '', is_active: true }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ user: p.user || '', route: p.route || '', start_stop: p.start_stop || '', end_stop: p.end_stop || '', pass_type: p.pass_type || 'STUDENT', valid_from: p.valid_from || '', valid_to: p.valid_to || '', price: p.price || '', is_active: !!p.is_active }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        user: Number(form.user),
        route: Number(form.route),
        start_stop: Number(form.start_stop),
        end_stop: Number(form.end_stop),
        pass_type: form.pass_type,
        valid_from: form.valid_from,
        valid_to: form.valid_to,
        price: Number(form.price),
        is_active: !!form.is_active,
      };
      if (editId) await TransportAPI.passes.update(editId, payload); else await TransportAPI.passes.create(payload);
      const res = await TransportAPI.passes.list(params);
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
    if (!confirm('Delete this pass?')) return;
    try {
      await TransportAPI.passes.remove(id);
      const res = await TransportAPI.passes.list(params);
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
          <label className="block text-xs mb-1">User</label>
          <input value={filters.user} onChange={(e) => setFilters(f => ({ ...f, user: e.target.value }))} placeholder="User ID" className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Route</label>
          <input value={filters.route} onChange={(e) => setFilters(f => ({ ...f, route: e.target.value }))} placeholder="Route ID" className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Type</label>
          <select value={filters.pass_type} onChange={(e) => setFilters(f => ({ ...f, pass_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
            <option value="">Any</option>
            <option value="STUDENT">STUDENT</option>
            <option value="STAFF">STAFF</option>
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
            <option value="valid_from">Valid From ↑</option>
            <option value="-valid_from">Valid From ↓</option>
            <option value="valid_to">Valid To ↑</option>
            <option value="-valid_to">Valid To ↓</option>
            <option value="price">Price ↑</option>
            <option value="-price">Price ↓</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} passes</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Pass</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">User</th>
              <th className="p-2">Route</th>
              <th className="p-2">Start → End</th>
              <th className="p-2">Type</th>
              <th className="p-2">Valid</th>
              <th className="p-2">Price</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2">{p.user}</td>
                <td className="p-2">{p.route}</td>
                <td className="p-2">{p.start_stop} → {p.end_stop}</td>
                <td className="p-2">{p.pass_type}</td>
                <td className="p-2">{p.valid_from} → {p.valid_to}</td>
                <td className="p-2">{p.price}</td>
                <td className="p-2">{p.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
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
    <Modal open={modalOpen} title={editId ? 'Edit Transport Pass' : 'Add Transport Pass'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">User ID</label>
          <input value={form.user} onChange={(e) => setForm(f => ({ ...f, user: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Route</label>
          <select value={form.route} onChange={(e) => setForm(f => ({ ...f, route: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {options.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Start Stop</label>
          <select value={form.start_stop} onChange={(e) => setForm(f => ({ ...f, start_stop: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {options.stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">End Stop</label>
          <select value={form.end_stop} onChange={(e) => setForm(f => ({ ...f, end_stop: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="">Select…</option>
            {options.stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Pass Type</label>
          <select value={form.pass_type} onChange={(e) => setForm(f => ({ ...f, pass_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required>
            <option value="STUDENT">STUDENT</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Valid From</label>
          <input type="date" value={form.valid_from} onChange={(e) => setForm(f => ({ ...f, valid_from: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Valid To</label>
          <input type="date" value={form.valid_to} onChange={(e) => setForm(f => ({ ...f, valid_to: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Price</label>
          <input type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="p-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          <label htmlFor="p-active" className="text-sm">Active</label>
        </div>
      </form>
    </Modal>
    </>
  );
}


