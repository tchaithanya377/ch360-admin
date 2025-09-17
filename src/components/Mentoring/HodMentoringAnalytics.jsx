import React, { useEffect, useMemo, useState } from 'react';
import { MentorshipsApi } from '../../services/mentoringApi';
import FiltersBar from './shared/FiltersBar';
import RiskBadge from './shared/RiskBadge';

export default function HodMentoringAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await MentorshipsApi.analyticsSummary({});
      setData(summary);
    } catch (e) { setError(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mentoring Analytics</h1>

      <FiltersBar />

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{error.status === 403 ? 'Insufficient permissions' : error.message}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-semibold">{data?.total ?? '-'}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-semibold">{data?.active ?? '-'}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Critical (76-100)</div>
          <div className="text-2xl font-semibold text-red-600">{data?.risk_distribution?.critical_76_100 ?? '-'}</div>
        </div>
        <div className="p-4 rounded border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Low (0-25)</div>
          <div className="text-2xl font-semibold text-green-600">{data?.risk_distribution?.low_0_25 ?? '-'}</div>
        </div>
      </div>

      <div className="p-4 rounded border bg-white shadow-sm">
        <div className="font-medium mb-2">By Mentor</div>
        <div className="grid gap-2">
          {(data?.by_mentor || []).map(row => (
            <div key={row.mentor__name} className="flex items-center justify-between text-sm">
              <div className="font-medium">{row.mentor__name}</div>
              <div className="text-gray-600">{row.count} mentorships • avg risk <RiskBadge score={Math.round(row.avg_risk || 0)} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded border bg-white shadow-sm">
        <div className="font-medium mb-2">Top critical mentees</div>
        <div className="text-sm text-gray-500">Use dashboard for deep links.</div>
      </div>
    </div>
  );
}


