import React, { useEffect, useMemo, useState } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import studentApiService from '../services/studentApiService';

const SuperuserStudentList = () => {
  const { user, isAuthenticated } = useDjangoAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const isSuperuser = useMemo(() => {
    return !!user && (user.is_superuser || user.is_staff);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !isSuperuser) return;
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApiService.getStudents({
          search: search || undefined,
          status: status || undefined,
          page,
          page_size: pageSize,
        });
        const list = Array.isArray(data) ? data : (data?.results || data || []);
        setStudents(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [isAuthenticated, isSuperuser, search, status, page, pageSize]);

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Please log in.</div>
      </div>
    );
  }

  if (!isSuperuser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">Access restricted to superusers.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search by name or email"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
          />
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
          >
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{s.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{s.email || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{s.phone || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' :
                        s.status === 'inactive' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{s.status || 'unknown'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm">Page {page}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperuserStudentList;


