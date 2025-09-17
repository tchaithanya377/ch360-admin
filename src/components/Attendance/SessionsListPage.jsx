import React, { useEffect, useMemo, useState } from 'react';
import AttendanceService from '../../services/attendanceApiService';
import { useNavigate } from 'react-router-dom';

const Badge = ({ children, color = 'blue' }) => (
  <span className={`px-2 py-0.5 text-xs rounded-full bg-${color}-100 text-${color}-700`}>{children}</span>
);

const SessionsListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ date: '', section: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await AttendanceService.listSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      const matchesDate = filter.date ? s.date === filter.date : true;
      const matchesSection = filter.section ? String(s.course_section).includes(filter.section) : true;
      return matchesDate && matchesSection;
    });
  }, [sessions, filter]);

  const onDelete = async (id) => {
    if (!confirm('Delete this session?')) return;
    try {
      await AttendanceService.deleteSession(id);
      await load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Attendance Sessions</h1>
          <p className="text-sm text-gray-500">Manage sessions and take attendance</p>
        </div>
        <button
          onClick={() => navigate('/attendance/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + New Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="date"
          value={filter.date}
          onChange={(e) => setFilter(f => ({ ...f, date: e.target.value }))}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          placeholder="Filter by course section"
          value={filter.section}
          onChange={(e) => setFilter(f => ({ ...f, section: e.target.value }))}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="flex gap-2">
          <button onClick={load} className="px-4 py-2 rounded-md border hover:bg-gray-50">Refresh</button>
          <button onClick={() => setFilter({ date: '', section: '' })} className="px-4 py-2 rounded-md border hover:bg-gray-50">Clear</button>
        </div>
      </div>

      {error && <div className="p-3 rounded-md bg-red-50 text-red-700">{error}</div>}
      {loading ? (
        <div className="p-6 text-gray-500">Loading sessions...</div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/20">
                  <td className="px-4 py-3 text-sm">{s.date}</td>
                  <td className="px-4 py-3 text-sm">{s.start_time} - {s.end_time}</td>
                  <td className="px-4 py-3 text-sm">{s.course_section}</td>
                  <td className="px-4 py-3 text-sm">{s.room || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge color={s.is_cancelled ? 'red' : 'green'}>{s.is_cancelled ? 'Cancelled' : 'Active'}</Badge>
                      <Badge color="indigo">{Array.isArray(s.records) ? s.records.length : 0}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => navigate(`/attendance/${s.id}`)} className="px-3 py-1.5 rounded-md border hover:bg-gray-50">View</button>
                      <button onClick={() => navigate(`/attendance/${s.id}/edit`)} className="px-3 py-1.5 rounded-md border hover:bg-gray-50">Edit</button>
                      <button onClick={() => onDelete(s.id)} className="px-3 py-1.5 rounded-md border text-red-600 hover:bg-red-50">Delete</button>
                      <button onClick={async () => { await AttendanceService.generateRecords(s.id); await load(); }} className="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Generate records</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No sessions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsListPage;


