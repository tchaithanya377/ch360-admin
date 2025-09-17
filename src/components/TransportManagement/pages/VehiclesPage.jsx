import React, { useEffect, useMemo, useState } from 'react';
import { TransportAPI, isAuthError, isStaffWriteError } from '../../../services/transportApiService';
import Modal from '../components/Modal.jsx';

export default function VehiclesPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('created_at');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ number_plate: '', registration_number: '', make: '', model: '', capacity: '', year_of_manufacture: '', is_active: true });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => ({ page, search, ordering }), [page, search, ordering]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.vehicles.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  const openCreate = () => { setEditId(null); setForm({ number_plate: '', registration_number: '', make: '', model: '', capacity: '', year_of_manufacture: '', is_active: true }); setSubmitError(''); setModalOpen(true); };
  const openEdit = (v) => { setEditId(v.id); setForm({ number_plate: v.number_plate, registration_number: v.registration_number, make: v.make || '', model: v.model || '', capacity: v.capacity || '', year_of_manufacture: v.year_of_manufacture || '', is_active: !!v.is_active }); setSubmitError(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        number_plate: form.number_plate,
        registration_number: form.registration_number,
        make: form.make || null,
        model: form.model || null,
        capacity: Number(form.capacity),
        year_of_manufacture: form.year_of_manufacture ? Number(form.year_of_manufacture) : null,
        is_active: !!form.is_active,
      };
      if (editId) {
        await TransportAPI.vehicles.update(editId, payload);
      } else {
        await TransportAPI.vehicles.create(payload);
      }
      const res = await TransportAPI.vehicles.list(params);
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
    if (!confirm('Delete this vehicle?')) return;
    try {
      await TransportAPI.vehicles.remove(id);
      const res = await TransportAPI.vehicles.list(params);
      setData(res);
    } catch (e) {
      alert(isStaffWriteError(e) ? 'Insufficient permissions. Staff only operation.' : (e.message || 'Delete failed'));
    }
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicles" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
          <option value="number_plate">Number Plate ↑</option>
          <option value="-number_plate">Number Plate ↓</option>
          <option value="capacity">Capacity ↑</option>
          <option value="-capacity">Capacity ↓</option>
          <option value="created_at">Created ↑</option>
          <option value="-created_at">Created ↓</option>
        </select>
        <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{data.count} vehicles</div>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-green-600 text-white">Add Vehicle</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Number Plate</th>
              <th className="p-2">Registration</th>
              <th className="p-2">Capacity</th>
              <th className="p-2">Active</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(v => (
              <tr key={v.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2 font-medium">{v.number_plate}</td>
                <td className="p-2">{v.registration_number}</td>
                <td className="p-2">{v.capacity}</td>
                <td className="p-2">{v.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2">{new Date(v.created_at).toLocaleString()}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(v)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Delete</button>
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
    <Modal open={modalOpen} title={editId ? 'Edit Vehicle' : 'Add Vehicle'} onClose={closeModal} footer={(
      <>
        <button onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
        <button disabled={submitting} onClick={handleSubmit} className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
      </>
    )}>
      {submitError && <div className="mb-2 text-sm text-red-600">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Number Plate</label>
          <input value={form.number_plate} onChange={(e) => setForm(f => ({ ...f, number_plate: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Registration Number</label>
          <input value={form.registration_number} onChange={(e) => setForm(f => ({ ...f, registration_number: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Make</label>
          <input value={form.make} onChange={(e) => setForm(f => ({ ...f, make: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Model</label>
          <input value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-xs mb-1">Capacity</label>
          <input type="number" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Year of Manufacture</label>
          <input type="number" value={form.year_of_manufacture} onChange={(e) => setForm(f => ({ ...f, year_of_manufacture: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="v-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          <label htmlFor="v-active" className="text-sm">Active</label>
        </div>
      </form>
    </Modal>
    </>
  );
}


