import React, { useEffect, useState } from 'react';
import eventsApiService from '../../services/eventsApiService';

export default function Categories() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await eventsApiService.listCategories({ ordering: 'name' });
      setList(res?.results || res || []);
    } catch (e) { setError(e.message || 'Failed to load categories'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await eventsApiService.updateCategory(editing.id, form); else await eventsApiService.createCategory(form);
      setForm({ name: '', description: '', is_active: true });
      setEditing(null);
      load();
    } catch (e) { alert(e.message || 'Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await eventsApiService.deleteCategory(id); load(); } catch (e) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-md shadow">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Categories</h1>
          <button onClick={() => { setEditing(null); setForm({ name: '', description: '', is_active: true }); }} className="px-3 py-2 border rounded-md">New</button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs">Name</th>
                <th className="px-3 py-2 text-left text-xs">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(list || []).map(v => (
                <tr key={v.id}>
                  <td className="px-3 py-2">{v.name}</td>
                  <td className="px-3 py-2">{v.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => { setEditing(v); setForm({ name: v.name || '', description: v.description || '', is_active: !!v.is_active }); }} className="px-2 py-1 text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => remove(v.id)} className="ml-2 px-2 py-1 text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!list?.length && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{loading ? 'Loading...' : 'No categories'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <div className="p-3 m-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-3">
        <h2 className="text-lg font-medium">{editing ? 'Edit Category' : 'New Category'}</h2>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
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


