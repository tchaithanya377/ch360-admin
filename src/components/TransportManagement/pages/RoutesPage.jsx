import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TransportAPI } from '../../../services/transportApiService';

export default function RoutesPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');

  const params = useMemo(() => ({ page, search, ordering }), [page, search, ordering]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await TransportAPI.routes.list(params);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [params]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search routes" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
          <option value="name">Name ↑</option>
          <option value="-name">Name ↓</option>
          <option value="created_at">Created ↑</option>
          <option value="-created_at">Created ↓</option>
        </select>
        <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Distance (km)</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-2 font-medium">{r.name}</td>
                <td className="p-2">{r.distance_km ?? '-'}</td>
                <td className="p-2">{r.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <Link to={`detail/${r.id}`} className="text-blue-600 hover:underline">View</Link>
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
  );
}


