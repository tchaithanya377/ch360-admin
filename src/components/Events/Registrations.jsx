import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import eventsApiService from '../../services/eventsApiService';

const TYPE_OPTIONS = ['STUDENT','FACULTY','STAFF','GUEST','ALUMNI'];

export default function EventRegistrations() {
  const { id } = useParams();
  const [list, setList] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ attendee_name: '', attendee_email: '', attendee_mobile: '', attendee_type: 'GUEST', user: null, is_waitlisted: false });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await eventsApiService.listRegistrations({ event: id, ordering: '-created_at' });
      setList(Array.isArray(res) ? { results: res, count: res.length } : (res || { results: [], count: 0 }));
    } catch (e) { setError(e.message || 'Failed to load registrations'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    try {
      await eventsApiService.createRegistration({ event: id, ...form, user: form.user || null });
      setForm({ attendee_name: '', attendee_email: '', attendee_mobile: '', attendee_type: 'GUEST', user: null, is_waitlisted: false });
      load();
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  };

  const checkIn = async (rid) => {
    try {
      await eventsApiService.patchRegistration(rid, { checked_in_at: new Date().toISOString() });
      load();
    } catch (e) { alert(e.message || 'Check-in failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registrations</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-3">
        <h2 className="text-lg font-medium">Create Registration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Name" value={form.attendee_name} onChange={e => setForm({ ...form, attendee_name: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          <input placeholder="Email" value={form.attendee_email} onChange={e => setForm({ ...form, attendee_email: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          <input placeholder="Mobile" value={form.attendee_mobile} onChange={e => setForm({ ...form, attendee_mobile: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
          <select value={form.attendee_type} onChange={e => setForm({ ...form, attendee_type: e.target.value })} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input id="wait" type="checkbox" checked={form.is_waitlisted} onChange={e => setForm({ ...form, is_waitlisted: e.target.checked })} />
            <label htmlFor="wait">Waitlist</label>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs">Name</th>
                <th className="px-4 py-2 text-left text-xs">Email</th>
                <th className="px-4 py-2 text-left text-xs">Type</th>
                <th className="px-4 py-2 text-left text-xs">Waitlist</th>
                <th className="px-4 py-2 text-left text-xs">Checked In</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(list.results || []).map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.attendee_name}</td>
                  <td className="px-4 py-2">{r.attendee_email || '-'}</td>
                  <td className="px-4 py-2">{r.attendee_type}</td>
                  <td className="px-4 py-2">{r.is_waitlisted ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => checkIn(r.id)} className="px-2 py-1 text-green-700 hover:underline">Check-in</button>
                  </td>
                </tr>
              ))}
              {!list.results?.length && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">{loading ? 'Loading...' : 'No registrations'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {error && <div className="p-3 m-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
      </div>
    </div>
  );
}


