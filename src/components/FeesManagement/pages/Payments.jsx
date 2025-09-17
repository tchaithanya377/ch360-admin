import React, { useEffect, useState } from 'react';
import { FeesAPI } from '../../../services/feesApiService';

export default function Payments() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ payment_method: '', status: '', 'student_fee__academic_year': '', search: '', ordering: '-payment_date', page: 1 });
  const [range, setRange] = useState({ start_date: '', end_date: '' });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await FeesAPI.listPayments(filters);
      const items = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setData(items);
      setCount(res?.count ?? items.length);
    } catch (e) { setError(e.data || e.message); }
    finally { setLoading(false); }
  };

  const fetchByRange = async () => {
    if (!range.start_date || !range.end_date) return;
    setLoading(true); setError(null);
    try {
      const items = await FeesAPI.listPaymentsByDateRange(range.start_date, range.end_date);
      const list = Array.isArray(items?.results) ? items.results : Array.isArray(items) ? items : [];
      setData(list);
      setCount(items?.count ?? list.length);
    } catch (e) { setError(e.data || e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t); }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Method</label>
          <select className="border rounded px-2 py-1" value={filters.payment_method}
                  onChange={e => setFilters(f => ({ ...f, payment_method: e.target.value, page: 1 }))}>
            <option value="">All</option>
            {['CASH','CHEQUE','BANK_TRANSFER','ONLINE','CARD','UPI','OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Status</label>
          <select className="border rounded px-2 py-1" value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All</option>
            {['PENDING','COMPLETED','FAILED','CANCELLED','REFUNDED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Academic Year</label>
          <input className="border rounded px-2 py-1" placeholder="YYYY-YYYY" value={filters['student_fee__academic_year']}
                 onChange={e => setFilters(f => ({ ...f, ['student_fee__academic_year']: e.target.value, page: 1 }))} />
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
            <option value="-payment_date">Payment Date (desc)</option>
            <option value="payment_date">Payment Date</option>
            <option value="amount">Amount</option>
            <option value="created_at">Created</option>
          </select>
        </div>
        <button className="ml-auto bg-blue-600 text-white px-3 py-2 rounded" onClick={fetchData}>Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Start Date</label>
          <input type="date" className="border rounded px-2 py-1" value={range.start_date} onChange={e => setRange(r => ({ ...r, start_date: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End Date</label>
          <input type="date" className="border rounded px-2 py-1" value={range.end_date} onChange={e => setRange(r => ({ ...r, end_date: e.target.value }))} />
        </div>
        <button className="bg-indigo-600 text-white px-3 py-2 rounded" onClick={fetchByRange}>Filter by Range</button>
      </div>

      {error && <div className="text-red-600 text-sm">{String(error)}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="overflow-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Receipt</th>
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Method</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Payment Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td className="p-2 border">{row.receipt_number}</td>
                  <td className="p-2 border">{row.student_label || row.student_fee?.student?.roll_number}</td>
                  <td className="p-2 border">{row.amount}</td>
                  <td className="p-2 border">{row.payment_method}</td>
                  <td className="p-2 border">{row.status}</td>
                  <td className="p-2 border">{row.payment_date}</td>
                  <td className="p-2 border">
                    {row.status !== 'COMPLETED' && (
                      <button className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                              onClick={async () => { await FeesAPI.markPaymentCompleted(row.id); fetchData(); }}>
                        Mark Completed
                      </button>
                    )}
                  </td>
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


