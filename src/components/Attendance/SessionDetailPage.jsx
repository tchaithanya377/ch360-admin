import React, { useEffect, useMemo, useState } from 'react';
import AttendanceService from '../../services/attendanceApiService';
import { useNavigate, useParams } from 'react-router-dom';

const STATUS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const StatusPills = ({ value, onChange, disabled }) => {
  const base = 'px-2 py-1 rounded-md text-xs font-medium border';
  const mk = (s) => `${base} ${value === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`;
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS.map(s => (
        <button key={s} type="button" disabled={disabled} onClick={() => onChange(s)} className={mk(s)}>{s}</button>
      ))}
    </div>
  );
};

const RecordRow = ({ row, disabled, onPatch }) => {
  const [local, setLocal] = useState(row);
  useEffect(() => { setLocal(row); }, [row]);

  const update = (patch) => {
    const newVal = { ...local, ...patch };
    setLocal(newVal);
    onPatch(newVal);
  };

  const name = row.full_name || row.student_name || row.student_roll || row.student_display || String(row.student);

  return (
    <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-900/20">
      <td className="px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
            {String(name).slice(0,1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="font-medium text-gray-800 dark:text-gray-100">{name}</div>
            {row.roll_number && <div className="text-xs text-gray-500">{row.roll_number}</div>}
          </div>
        </div>
      </td>
      <td className="px-4 py-2 text-sm">
        <StatusPills value={local.status || 'PRESENT'} onChange={(v) => update({ status: v })} disabled={disabled} />
      </td>
      <td className="px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <input type="datetime-local"
            value={local.check_in_time ? local.check_in_time.replace('Z','') : ''}
            onChange={(e) => update({ check_in_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
            disabled={disabled}
            className="flex-1 px-2 py-1.5 rounded-md border" />
          <button type="button" onClick={() => update({ check_in_time: new Date().toISOString() })} disabled={disabled}
            className="px-2 py-1 rounded-md border text-xs hover:bg-gray-50">Now</button>
          <button type="button" onClick={() => update({ check_in_time: null })} disabled={disabled}
            className="px-2 py-1 rounded-md border text-xs hover:bg-gray-50">Clear</button>
        </div>
      </td>
      <td className="px-4 py-2 text-sm">
        <input
          value={local.remarks || ''}
          onChange={(e) => update({ remarks: e.target.value })}
          disabled={disabled}
          className="w-full px-2 py-1.5 rounded-md border"
          placeholder="Remarks (optional)" />
      </td>
    </tr>
  );
};

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingIds, setSavingIds] = useState(new Set());
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await AttendanceService.getSession(id);
      setSession(data);
      const mapped = (Array.isArray(data.records) ? data.records : []).map(r => ({ ...r }));
      setRows(mapped);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const generateIfEmpty = async () => {
    if (!session) return;
    if ((session.records || []).length > 0) return;
    await AttendanceService.generateRecords(session.id);
    await load();
  };

  const disabled = Boolean(session?.is_cancelled);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => {
      const name = (r.full_name || r.student_name || r.student_roll || r.student_display || String(r.student) || '').toLowerCase();
      return name.includes(q);
    });
  }, [rows, query]);

  const bulkSet = async (status) => {
    const updates = rows.map(r => ({ ...r, status }));
    setRows(updates);
    // batch PATCH sequentially with debounce-like
    for (const r of updates) {
      try {
        setSavingIds(prev => new Set(prev).add(r.id));
        await AttendanceService.patchRecord(r.id, { status });
      } catch (e) {
        // ignore per-row errors here
      } finally {
        setSavingIds(prev => { const n = new Set(prev); n.delete(r.id); return n; });
      }
    }
  };

  const onRowPatch = async (row) => {
    if (!row.id) {
      try {
        const created = await AttendanceService.createRecord({
          session: session.id,
          student: row.student,
          status: row.status,
          check_in_time: row.check_in_time || null,
          remarks: row.remarks || ''
        });
        setRows(prev => prev.map(p => (p.student === row.student ? created : p)));
      } catch (e) {
        if (e.status === 400) await load();
      }
      return;
    }
    try {
      setSavingIds(prev => new Set(prev).add(row.id));
      await AttendanceService.patchRecord(row.id, {
        status: row.status,
        check_in_time: row.check_in_time || null,
        remarks: row.remarks || ''
      });
    } catch (e) {
      // revert by reloading row
      await load();
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(row.id); return n; });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Session Detail</h1>
          {session && session.is_cancelled && (
            <p className="text-sm text-red-600">This session is cancelled. Editing disabled.</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student..." className="px-3 py-2 rounded-md border" />
          <button onClick={() => navigate('/attendance')} className="px-4 py-2 rounded-md border">Back</button>
          {!disabled && (
            <>
              <button onClick={() => bulkSet('PRESENT')} className="px-3 py-2 rounded-md bg-emerald-600 text-white">All PRESENT</button>
              <button onClick={() => bulkSet('ABSENT')} className="px-3 py-2 rounded-md bg-red-600 text-white">All ABSENT</button>
              <button onClick={() => bulkSet('LATE')} className="px-3 py-2 rounded-md bg-yellow-500 text-white">All LATE</button>
              <button onClick={() => bulkSet('EXCUSED')} className="px-3 py-2 rounded-md bg-blue-600 text-white">All EXCUSED</button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-gray-500">Loading...</div>
      ) : session ? (
        <div className="space-y-4">
          {(session.records || []).length === 0 && !disabled && (
            <div className="p-4 rounded-md bg-indigo-50 text-indigo-800 flex items-center justify-between">
              <span>No records generated yet for this session.</span>
              <button onClick={generateIfEmpty} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Generate records</button>
            </div>
          )}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRows.map(r => (
                  <RecordRow key={r.id || r.student} row={r} disabled={disabled || savingIds.has(r.id)} onPatch={onRowPatch} />
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 text-red-600">{error || 'Session not found'}</div>
      )}
    </div>
  );
};

export default SessionDetailPage;


