import React, { useEffect, useState } from 'react';
import { FeesAPI } from '../../../services/feesApiService';

export default function FeeStructures() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ academic_year: '', grade_level: '', is_active: '', search: '', ordering: 'academic_year', page: 1 });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await FeesAPI.listStructures(filters);
      const items = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setData(items);
      setCount(res?.count ?? items.length);
    } catch (e) {
      setError(e.data || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Year</label>
          <input className="border rounded px-2 py-1" placeholder="YYYY-YYYY" value={filters.academic_year}
                 onChange={e => setFilters(f => ({ ...f, academic_year: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Grade</label>
          <input className="border rounded px-2 py-1" placeholder="e.g. 10" value={filters.grade_level}
                 onChange={e => setFilters(f => ({ ...f, grade_level: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Active</label>
          <select className="border rounded px-2 py-1" value={filters.is_active}
                  onChange={e => setFilters(f => ({ ...f, is_active: e.target.value, page: 1 }))}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Search</label>
          <input className="border rounded px-2 py-1" value={filters.search}
                 onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Ordering</label>
          <select className="border rounded px-2 py-1" value={filters.ordering}
                  onChange={e => setFilters(f => ({ ...f, ordering: e.target.value }))}>
            <option value="academic_year">Academic Year</option>
            <option value="grade_level">Grade</option>
            <option value="created_at">Created</option>
          </select>
        </div>
        <button className="ml-auto bg-blue-600 text-white px-3 py-2 rounded" onClick={fetchData}>Refresh</button>
      </div>

      {error && <div className="text-red-600 text-sm">{String(error)}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="overflow-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Academic Year</th>
                <th className="p-2 border">Grade</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Total Amount</th>
                <th className="p-2 border">Items</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td className="p-2 border">{row.name}</td>
                  <td className="p-2 border">{row.academic_year}</td>
                  <td className="p-2 border">{row.grade_level}</td>
                  <td className="p-2 border">{String(row.is_active)}</td>
                  <td className="p-2 border">{row.total_amount}</td>
                  <td className="p-2 border">{row.fee_details_count}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td className="p-4 text-center" colSpan={6}>No data</td></tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <div>Total: {count}</div>
            <div className="space-x-2">
              <button className="px-2 py-1 border rounded" disabled={filters.page <= 1}
                      onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}>Prev</button>
              <button className="px-2 py-1 border rounded"
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


