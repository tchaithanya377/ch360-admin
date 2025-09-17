import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function DriversPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('created_at');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', license_number: '', license_expiry: '', is_active: true, user: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, search, ordering }), [page, search, ordering]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.drivers.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  const openCreate = () => { setEditId(null); setForm({ full_name: '', phone: '', license_number: '', license_expiry: '', is_active: true, user: '' }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (d) => { setEditId(d.id); setForm({ full_name: d.full_name || '', phone: d.phone || '', license_number: d.license_number || '', license_expiry: d.license_expiry || '', is_active: !!d.is_active, user: d.user || '' }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        license_number: form.license_number,
        license_expiry: form.license_expiry || null,
        is_active: !!form.is_active,
        user: form.user || null,
      };
      if (editId) await TransportAPI.drivers.update(editId, payload); else await TransportAPI.drivers.create(payload);
      const res = await TransportAPI.drivers.list(params);
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
    if (!confirm('Delete this driver?')) return;
    try {
      await TransportAPI.drivers.remove(id);
      const res = await TransportAPI.drivers.list(params);
      setData(res);
    } catch (e) {
      alert(isStaffWriteError(e) ? 'Insufficient permissions. Staff only operation.' : (e.message || 'Delete failed'));
    }
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drivers" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
          <option value="full_name">Name ↑</option>
          <option value="-full_name">Name ↓</option>
          <option value="license_expiry">License Expiry ↑</option>
          <option value="-license_expiry">License Expiry ↓</option>
          <option value="created_at">Created ↑</option>
          <option value="-created_at">Created ↓</option>
        </select>
        <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} drivers</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Driver</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Full Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">License</th>
              <th className="p-2">Expiry</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(d => (
              <tr key={d.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2 font-medium">{d.full_name}</td>
                <td className="p-2">{d.phone}</td>
                <td className="p-2">{d.license_number}</td>
                <td className="p-2">{d.license_expiry}</td>
                <td className="p-2">{d.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(d)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">Delete</button>
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
    <Modal open={modalOpen} title={editId ? 'Edit Driver' : 'Add Driver'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Full Name</label>
          <input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">License Number</label>
          <input value={form.license_number} onChange={(e) => setForm(f => ({ ...f, license_number: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">License Expiry</label>
          <input type="date" value={form.license_expiry} onChange={(e) => setForm(f => ({ ...f, license_expiry: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="d-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          <label htmlFor="d-active" className="text-sm">Active</label>
        </div>
      </form>
    </Modal>
    </>
  );
}


