import React, { useEffect, useState } from 'react';
import eventsApiService from '../../services/eventsApiService';

export default function Venues() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', postal_code: '', country: '', capacity: 0, is_active: true });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await eventsApiService.listVenues({ ordering: 'name' });
      setList(res?.results || res || []);
    } catch (e) { setError(e.message || 'Failed to load venues'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await eventsApiService.updateVenue(editing.id, form); else await eventsApiService.createVenue(form);
      setForm({ name: '', address: '', city: '', state: '', postal_code: '', country: '', capacity: 0, is_active: true });
      setEditing(null);
      load();
    } catch (e) { alert(e.message || 'Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this venue?')) return;
    try { await eventsApiService.deleteVenue(id); load(); } catch (e) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-md shadow">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Venues</h1>
          <button onClick={() => { setEditing(null); setForm({ name: '', address: '', city: '', state: '', postal_code: '', country: '', capacity: 0, is_active: true }); }} className="px-3 py-2 border rounded-md">New</button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs">Name</th>
                <th className="px-3 py-2 text-left text-xs">City</th>
                <th className="px-3 py-2 text-left text-xs">State</th>
                <th className="px-3 py-2 text-left text-xs">Capacity</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(list || []).map(v => (
                <tr key={v.id}>
                  <td className="px-3 py-2">{v.name}</td>
                  <td className="px-3 py-2">{v.city}</td>
                  <td className="px-3 py-2">{v.state}</td>
                  <td className="px-3 py-2">{v.capacity}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => { setEditing(v); setForm({ name: v.name || '', address: v.address || '', city: v.city || '', state: v.state || '', postal_code: v.postal_code || '', country: v.country || '', capacity: v.capacity || 0, is_active: !!v.is_active }); }} className="px-2 py-1 text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => remove(v.id)} className="ml-2 px-2 py-1 text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!list?.length && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">{loading ? 'Loading...' : 'No venues'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <div className="p-3 m-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-3">
        <h2 className="text-lg font-medium">{editing ? 'Edit Venue' : 'New Venue'}</h2>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Postal Code" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          <input placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        </div>
        <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <div className="flex items-center gap-2">
          <input id="is_active" type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <label htmlFor="is_active">Active</label>
        </div>
        <div className="flex justify-end">
          <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
}


