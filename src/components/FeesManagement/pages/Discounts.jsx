import React, { useEffect, useState } from 'react';
import { FeesAPI } from '../../../services/feesApiService';

export default function Discounts() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ discount_type: '', is_active: '', search: '', ordering: '-created_at', page: 1 });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await FeesAPI.listDiscounts(filters);
      const items = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setData(items);
      setCount(res?.count ?? items.length);
    } catch (e) { setError(e.data || e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Type</label>
          <input className="border rounded px-2 py-1" value={filters.discount_type}
                 onChange={e => setFilters(f => ({ ...f, discount_type: e.target.value, page: 1 }))} />
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
            <option value="-created_at">Created (desc)</option>
            <option value="amount">Amount</option>
            <option value="valid_until">Valid Until</option>
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
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">%</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td className="p-2 border">{row.student_label || row.student_fee?.student?.roll_number}</td>
                  <td className="p-2 border">{row.discount_type}</td>
                  <td className="p-2 border">{row.amount}</td>
                  <td className="p-2 border">{row.percentage}</td>
                  <td className="p-2 border">{String(row.is_active)}</td>
                  <td className="p-2 border">{row.valid_until}</td>
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


