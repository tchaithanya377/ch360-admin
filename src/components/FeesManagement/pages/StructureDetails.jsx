import React, { useEffect, useState } from 'react';
import { FeesAPI } from '../../../services/feesApiService';

export default function StructureDetails() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ fee_structure: '', fee_category: '', frequency: '', is_optional: '', search: '', ordering: 'amount', page: 1 });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await FeesAPI.listStructureDetails(filters);
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
          <label className="block text-sm text-gray-600">Structure ID</label>
          <input className="border rounded px-2 py-1" value={filters.fee_structure}
                 onChange={e => setFilters(f => ({ ...f, fee_structure: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Category ID</label>
          <input className="border rounded px-2 py-1" value={filters.fee_category}
                 onChange={e => setFilters(f => ({ ...f, fee_category: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Frequency</label>
          <select className="border rounded px-2 py-1" value={filters.frequency}
                  onChange={e => setFilters(f => ({ ...f, frequency: e.target.value, page: 1 }))}>
            <option value="">All</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="QUARTERLY">QUARTERLY</option>
            <option value="SEMESTER">SEMESTER</option>
            <option value="ANNUAL">ANNUAL</option>
            <option value="ONE_TIME">ONE_TIME</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Optional</label>
          <select className="border rounded px-2 py-1" value={filters.is_optional}
                  onChange={e => setFilters(f => ({ ...f, is_optional: e.target.value, page: 1 }))}>
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
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
            <option value="amount">Amount</option>
            <option value="due_date">Due Date</option>
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
                <th className="p-2 border">Structure</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Frequency</th>
                <th className="p-2 border">Optional</th>
                <th className="p-2 border">Due Date</th>
                <th className="p-2 border">Late Fee Amount</th>
                <th className="p-2 border">Late Fee %</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td className="p-2 border">{row.fee_structure?.name || row.fee_structure_name}</td>
                  <td className="p-2 border">{row.fee_category?.name || row.fee_category_name}</td>
                  <td className="p-2 border">{row.amount}</td>
                  <td className="p-2 border">{row.frequency}</td>
                  <td className="p-2 border">{String(row.is_optional)}</td>
                  <td className="p-2 border">{row.due_date}</td>
                  <td className="p-2 border">{row.late_fee_amount}</td>
                  <td className="p-2 border">{row.late_fee_percentage}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td className="p-4 text-center" colSpan={8}>No data</td></tr>
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


