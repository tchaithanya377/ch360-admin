import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import eventsApiService from '../../services/eventsApiService';

const STATUS_OPTIONS = ['DRAFT','PUBLISHED','CANCELLED','COMPLETED'];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`inline-flex items-center h-6 rounded-full w-11 transition ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
  >
    <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

export default function EventsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('page_size') || 10);
  const ordering = searchParams.get('ordering') || 'start_at';
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const venue = searchParams.get('venue') || '';
  const is_public = searchParams.get('is_public') === 'true' ? true : searchParams.get('is_public') === 'false' ? false : '';
  const upcoming = searchParams.get('upcoming') === 'true';
  const status = (searchParams.getAll('status') || []);
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';

  const setParam = (key, value) => {
    const sp = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) sp.delete(key); else sp.set(key, value);
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const toggleMulti = (key, val) => {
    const sp = new URLSearchParams(searchParams);
    const current = sp.getAll(key);
    if (current.includes(val)) {
      const next = current.filter(v => v !== val);
      sp.delete(key);
      next.forEach(v => sp.append(key, v));
    } else {
      sp.append(key, val);
    }
    sp.set('page', '1');
    setSearchParams(sp);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, cats, vens] = await Promise.all([
        eventsApiService.listEvents({
          page,
          page_size: pageSize,
          ordering,
          search: search || undefined,
          category: category || undefined,
          venue: venue || undefined,
          is_public: is_public !== '' ? is_public : undefined,
          start: start || undefined,
          end: end || undefined,
          upcoming: upcoming ? 'true' : undefined,
          ...(status.length ? { status } : {}),
        }),
        eventsApiService.listCategories({ is_active: true, ordering: 'name' }),
        eventsApiService.listVenues({ is_active: true, ordering: 'name' }),
      ]);
      setData(Array.isArray(listRes) ? { results: listRes, count: listRes.length } : (listRes || { results: [], count: 0 }));
      setCategories(cats?.results || cats || []);
      setVenues(vens?.results || vens || []);
    } catch (e) {
      setError(e.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [page, pageSize, ordering, search, category, venue, is_public, start, end, upcoming, searchParams.toString()]);

  const onSort = (field) => {
    const dir = ordering === field ? `-${field}` : field;
    setParam('ordering', dir);
  };

  const rows = data.results || [];
  const total = data.count || rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Events</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/events/new')} className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">New Event</button>
          <button onClick={() => navigate('/admin/events/venues')} className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-md">Venues</button>
          <button onClick={() => navigate('/admin/events/categories')} className="px-3 py-2 bg-white dark:bg-gray-800 border rounded-md">Categories</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 bg-white dark:bg-gray-800 p-4 rounded-md shadow">
        <input value={search} onChange={e => setParam('search', e.target.value)} placeholder="Search title/description" className="col-span-2 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <select value={category} onChange={e => setParam('category', e.target.value)} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={venue} onChange={e => setParam('venue', e.target.value)} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900">
          <option value="">All Venues</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm">Public</span>
          <Toggle checked={is_public === true} onChange={(val) => setParam('is_public', val ? 'true' : '')} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Upcoming</span>
          <Toggle checked={upcoming} onChange={(val) => setParam('upcoming', val ? 'true' : '')} />
        </div>
        <input type="datetime-local" value={start} onChange={e => setParam('start', e.target.value)} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
        <input type="datetime-local" value={end} onChange={e => setParam('end', e.target.value)} className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('start_at')}>Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('end_at')}>End</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Public</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{ev.title}</div>
                    <div className="text-xs text-gray-500">{ev.description?.slice(0,80)}</div>
                  </td>
                  <td className="px-4 py-3">{ev.category_name || ev.category}</td>
                  <td className="px-4 py-3">{ev.venue_name || ev.venue}</td>
                  <td className="px-4 py-3">{new Date(ev.start_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(ev.end_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ev.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      ev.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      ev.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{ev.status}</span>
                  </td>
                  <td className="px-4 py-3">{ev.is_public ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => navigate(`/admin/events/${ev.id}`)} className="px-2 py-1 text-indigo-600 hover:underline">View</button>
                      <button onClick={() => navigate(`/admin/events/${ev.id}/edit`)} className="px-2 py-1 text-gray-700 hover:underline">Edit</button>
                      <button onClick={() => eventsApiService.patchEvent(ev.id, { status: 'PUBLISHED' }).then(fetchAll)} className="px-2 py-1 text-green-700 hover:underline">Publish</button>
                      <button onClick={() => eventsApiService.patchEvent(ev.id, { status: 'CANCELLED' }).then(fetchAll)} className="px-2 py-1 text-red-700 hover:underline">Cancel</button>
                      <button onClick={() => eventsApiService.deleteEvent(ev.id).then(fetchAll)} className="px-2 py-1 text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">{loading ? 'Loading...' : 'No events found'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={() => setParam('page', String(page-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <span className="text-sm">Page {page} / {totalPages}</span>
            <button disabled={page>=totalPages} onClick={() => setParam('page', String(page+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            <select value={pageSize} onChange={e => setParam('page_size', e.target.value)} className="px-2 py-1 border rounded">
              {[10,20,30,50].map(s => <option key={s} value={s}>{s}/page</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
    </div>
  );
}


