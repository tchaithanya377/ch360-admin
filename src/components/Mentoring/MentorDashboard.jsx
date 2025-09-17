import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MentorshipsApi, ActionItemsApi } from '../../services/mentoringApi';
import { useDjangoAuth } from '../../contexts/DjangoAuthContext';
import RiskBadge from './shared/RiskBadge';
import FiltersBar from './shared/FiltersBar';

export default function MentorDashboard() {
  const { user, isAuthenticated, hasRole } = useDjangoAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ results: [], next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState([]);

  const query = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return params;
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!(hasRole('Mentor') || hasRole('HOD') || hasRole('Admin'))) return;
    const controller = new AbortController();
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const list = await MentorshipsApi.list({ ...query, is_active: query.is_active ?? 'true' });
        const results = Array.isArray(list) ? list : (list.results || []);
        const next = Array.isArray(list) ? null : list.next;
        const previous = Array.isArray(list) ? null : list.previous;
        setData({ results, next, previous });

        // Open action items due soon (7 days)
        const now = new Date();
        const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const items = [];
        await Promise.all(results.slice(0, 10).map(async (m) => {
          try {
            const resp = await ActionItemsApi.list({ mentorship: m.id, status: 'OPEN' });
            const arr = Array.isArray(resp) ? resp : (resp.results || []);
            arr.forEach(ai => {
              if (ai.due_date && new Date(ai.due_date) <= soon) items.push({ ...ai, mentorship: m });
            });
          } catch {}
        }));
        setOpenItems(items);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => controller.abort();
  }, [isAuthenticated, hasRole, query]);

  const loadMore = async () => {
    if (!data.next) return;
    try {
      setLoading(true);
      const list = await MentorshipsApi.list(data.next);
      const results = Array.isArray(list) ? list : (list.results || []);
      const next = Array.isArray(list) ? null : list.next;
      setData(prev => ({ ...prev, results: [...prev.results, ...results], next }));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const computeRisk = async (id) => {
    try {
      await MentorshipsApi.computeRisk(id);
      // naive revalidation
      const list = await MentorshipsApi.list(query);
      const results = Array.isArray(list) ? list : (list.results || []);
      const next = Array.isArray(list) ? null : list.next;
      const previous = Array.isArray(list) ? null : list.previous;
      setData({ results, next, previous });
    } catch (e) {
      setError(e);
    }
  };

  const riskBuckets = useMemo(() => {
    const buckets = { low: 0, mid: 0, high: 0, critical: 0 };
    data.results.forEach(m => {
      const s = m.risk_score || 0;
      if (s <= 25) buckets.low++; else if (s <= 50) buckets.mid++; else if (s <= 75) buckets.high++; else buckets.critical++;
    });
    return buckets;
  }, [data.results]);

  const friendlyError = error ? (error.status === 403 ? 'Insufficient permissions' : error.status === 401 ? 'Please login again' : error.message) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
      </div>

      {/* Risk header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Low (0-25)</div>
          <div className="text-2xl font-semibold text-green-600">{riskBuckets.low}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Mid (26-50)</div>
          <div className="text-2xl font-semibold text-yellow-600">{riskBuckets.mid}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">High (51-75)</div>
          <div className="text-2xl font-semibold text-orange-600">{riskBuckets.high}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Critical (76-100)</div>
          <div className="text-2xl font-semibold text-red-600">{riskBuckets.critical}</div>
        </div>
      </div>

      {/* Due soon items */}
      {openItems.length > 0 && (
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="font-medium mb-2">Action Items due soon</div>
          <div className="grid gap-2">
            {openItems.slice(0, 6).map(ai => (
              <div key={ai.id} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  <span className="text-gray-600">{ai.title}</span>
                  <span className="text-gray-400"> • {ai.mentorship?.student_name || ai.mentorship?.student}</span>
                </div>
                <div className="text-gray-500">{ai.due_date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded border bg-white shadow-sm">
        <div className="mb-4">
          <FiltersBar />
        </div>

        {friendlyError && (
          <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 mb-3">{friendlyError}</div>
        )}

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">Student</th>
                <th className="py-2 pr-3">Risk</th>
                <th className="py-2 pr-3">AY / Grade / Sec</th>
                <th className="py-2 pr-3">Active Projects</th>
                <th className="py-2 pr-3">Next Meeting</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map(m => (
                <tr key={m.id} className="border-t">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{m.student_name || m.student}</div>
                    <div className="text-gray-500">{m.mentor_name || m.mentor}</div>
                  </td>
                  <td className="py-2 pr-3"><RiskBadge score={m.risk_score || 0} /></td>
                  <td className="py-2 pr-3 text-gray-600">{m.academic_year || '-'} / {m.grade_level || '-'} / {m.section || '-'}</td>
                  <td className="py-2 pr-3">{Array.isArray(m.projects) ? m.projects.filter(p => p.status !== 'COMPLETED').length : '-'}</td>
                  <td className="py-2 pr-3">{Array.isArray(m.meetings) && m.meetings.length > 0 ? m.meetings[0].scheduled_at : '-'}</td>
                  <td className="py-2 pr-3 space-x-2">
                    <button className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200" onClick={() => navigate(`/mentor/mentorships/${m.id}`)}>View</button>
                    <button className="px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200" onClick={() => computeRisk(m.id)}>Compute Risk</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">{loading ? 'Loading…' : ''}</div>
          {data.next && (
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border" onClick={loadMore}>Load more</button>
          )}
        </div>
      </div>
    </div>
  );
}


