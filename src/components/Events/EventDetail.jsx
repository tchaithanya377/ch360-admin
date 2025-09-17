import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import eventsApiService from '../../services/eventsApiService';

const TabButton = ({ active, children, onClick }) => (
  <button onClick={onClick} className={`px-3 py-2 rounded-md ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'}`}>{children}</button>
);

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState('overview');
  const [registrations, setRegistrations] = useState({ results: [], count: 0 });

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const ev = await eventsApiService.getEvent(id);
      setEvent(ev);
    } catch (e) {
      setError(e.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const rs = await eventsApiService.listRegistrations({ event: id, ordering: '-created_at' });
      setRegistrations(Array.isArray(rs) ? { results: rs, count: rs.length } : (rs || { results: [], count: 0 }));
    } catch {}
  };

  useEffect(() => { refresh(); }, [id]);
  useEffect(() => { if (tab === 'registrations') loadRegistrations(); }, [tab]);

  const now = new Date();
  const isOngoing = event && new Date(event.start_at) <= now && now <= new Date(event.end_at);
  const isFuture = event && now < new Date(event.start_at);

  const publish = () => eventsApiService.patchEvent(id, { status: 'PUBLISHED' }).then(refresh);
  const cancel = () => eventsApiService.patchEvent(id, { status: 'CANCELLED' }).then(refresh);
  const complete = () => eventsApiService.patchEvent(id, { status: 'COMPLETED' }).then(refresh);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Event Detail</h1>
          {event && (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span>{new Date(event.start_at).toLocaleString()} → {new Date(event.end_at).toLocaleString()}</span>
              {isOngoing && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Ongoing</span>}
              {isFuture && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Upcoming</span>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/events/${id}/edit`)} className="px-3 py-2 border rounded-md">Edit</button>
          <button onClick={publish} className="px-3 py-2 bg-green-600 text-white rounded-md">Publish</button>
          <button onClick={complete} className="px-3 py-2 bg-blue-600 text-white rounded-md">Complete</button>
          <button onClick={cancel} className="px-3 py-2 bg-red-600 text-white rounded-md">Cancel</button>
        </div>
      </div>

      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-md shadow">
        <div className="flex gap-2 p-3 border-b dark:border-gray-700">
          <TabButton active={tab==='overview'} onClick={() => setTab('overview')}>Overview</TabButton>
          <TabButton active={tab==='registrations'} onClick={() => setTab('registrations')}>Registrations</TabButton>
          <TabButton active={tab==='analytics'} onClick={() => setTab('analytics')}>Analytics</TabButton>
        </div>
        <div className="p-4">
          {tab === 'overview' && event && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Title</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">{event.title}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div>{event.category_name || event.category}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Venue</div>
                <div>{event.venue_name || event.venue}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div><span className="px-2 py-1 text-xs rounded-full bg-gray-100">{event.status}</span></div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Description</div>
                <div className="whitespace-pre-wrap">{event.description}</div>
              </div>
            </div>
          )}

          {tab === 'registrations' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium">Registrations ({registrations.count})</h2>
                <Link to={`/admin/events/${id}/registrations`} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Manage</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs">Name</th>
                      <th className="px-4 py-2 text-left text-xs">Email</th>
                      <th className="px-4 py-2 text-left text-xs">Type</th>
                      <th className="px-4 py-2 text-left text-xs">Checked In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(registrations.results || []).slice(0,10).map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-2">{r.attendee_name}</td>
                        <td className="px-4 py-2">{r.attendee_email || '-'}</td>
                        <td className="px-4 py-2">{r.attendee_type}</td>
                        <td className="px-4 py-2">{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                    {!registrations.results?.length && (
                      <tr><td className="px-4 py-4 text-center text-gray-500" colSpan={4}>No registrations</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'analytics' && event && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-gray-500">Capacity</div>
                <div className="text-2xl font-semibold">{event.max_attendees || 0}</div>
              </div>
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-gray-500">Public</div>
                <div className="text-2xl font-semibold">{event.is_public ? 'Yes' : 'No'}</div>
              </div>
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-2xl font-semibold">{event.status}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


