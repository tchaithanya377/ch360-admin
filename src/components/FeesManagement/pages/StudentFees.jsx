import React, { useEffect, useState } from 'react';
import { FeesAPI } from '../../../services/feesApiService';

export default function StudentFees() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', academic_year: '', 'fee_structure_detail__fee_structure__grade_level': '', search: '', ordering: 'due_date', page: 1 });
  const [kpis, setKpis] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [res, summary] = await Promise.all([
        FeesAPI.listStudentFees(filters),
        FeesAPI.getStudentFeesSummary()
      ]);
      const items = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setData(items);
      setCount(res?.count ?? items.length);
      setKpis(summary || null);
    } catch (e) { setError(e.data || e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis && Object.entries(kpis).map(([k, v]) => (
          <div key={k} className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs text-gray-600">{k}</div>
            <div className="text-lg font-semibold">{String(v)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Status</label>
          <select className="border rounded px-2 py-1" value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All</option>
            {['PENDING','PAID','PARTIAL','OVERDUE','WAIVED','CANCELLED'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Academic Year</label>
          <input className="border rounded px-2 py-1" placeholder="YYYY-YYYY" value={filters.academic_year}
                 onChange={e => setFilters(f => ({ ...f, academic_year: e.target.value, page: 1 }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Grade</label>
          <input className="border rounded px-2 py-1" value={filters['fee_structure_detail__fee_structure__grade_level']}
                 onChange={e => setFilters(f => ({ ...f, ['fee_structure_detail__fee_structure__grade_level']: e.target.value, page: 1 }))} />
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
            <option value="due_date">Due Date</option>
            <option value="amount_due">Amount Due</option>
            <option value="amount_paid">Amount Paid</option>
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
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Due</th>
                <th className="p-2 border">Paid</th>
                <th className="p-2 border">Balance</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className={row.is_overdue ? 'bg-red-50' : ''}>
                  <td className="p-2 border">{row.student_label || row.student?.roll_number}</td>
                  <td className="p-2 border">{row.fee_category_label || row.fee_structure_detail?.fee_category?.name}</td>
                  <td className="p-2 border">{row.amount_due}</td>
                  <td className="p-2 border">{row.amount_paid}</td>
                  <td className="p-2 border">{row.balance_amount}</td>
                  <td className="p-2 border">{row.status}</td>
                  <td className="p-2 border">{row.due_date}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td className="p-4 text-center" colSpan={7}>No data</td></tr>
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


