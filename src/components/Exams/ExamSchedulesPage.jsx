import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

const EXAM_TYPES = ['THEORY','PRACTICAL','VIVA','ONLINE'];
const STATUS_OPTIONS = ['SCHEDULED','ONGOING','COMPLETED','CANCELLED'];

export default function ExamSchedulesPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [ordering, setOrdering] = useState('exam_date');
	const [filters, setFilters] = useState({ exam_session: '', exam_type: '', status: '', is_online: '', course: '' });
	const [actionBusy, setActionBusy] = useState(null);

	const params = useMemo(() => ({ page, search, ordering, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v!=='')) }), [page, search, ordering, filters]);

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await ExamsAPI.examSchedules.list(params);
			setData(res || { results: [], count: 0 });
		} catch (e) { setError(e?.message || 'Failed to load'); }
		finally { setLoading(false); }
	};

	useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

	const doStart = async (id) => {
		if (!confirm('Start this exam?')) return;
		setActionBusy(id);
		try {
			await ExamsAPI.examSchedules.startExam(id);
			await load();
		} catch (e) { alert(e.message || 'Failed to start'); }
		finally { setActionBusy(null); }
	};
	const doEnd = async (id) => {
		if (!confirm('End this exam?')) return;
		setActionBusy(id);
		try {
			await ExamsAPI.examSchedules.endExam(id);
			await load();
		} catch (e) { alert(e.message || 'Failed to end'); }
		finally { setActionBusy(null); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Schedules</h1>
					<p className="text-gray-500 dark:text-gray-400">List, filter, and control exam schedules.</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title/course" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<input value={filters.exam_session} onChange={(e)=>setFilters(f=>({...f, exam_session:e.target.value}))} placeholder="Session ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<input value={filters.course} onChange={(e)=>setFilters(f=>({...f, course:e.target.value}))} placeholder="Course ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<select value={filters.exam_type} onChange={(e)=>setFilters(f=>({...f, exam_type:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">All Types</option>
					{EXAM_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
				</select>
				<select value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Any Status</option>
					{STATUS_OPTIONS.map(s=> <option key={s} value={s}>{s}</option>)}
				</select>
				<select value={filters.is_online} onChange={(e)=>setFilters(f=>({...f, is_online:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Mode: Any</option>
					<option value="true">Online</option>
					<option value="false">Offline</option>
				</select>
				<select value={ordering} onChange={(e)=>setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="exam_date">Date ↑</option>
					<option value="-exam_date">Date ↓</option>
					<option value="start_time">Start Time ↑</option>
					<option value="-start_time">Start Time ↓</option>
					<option value="created_at">Created ↑</option>
					<option value="-created_at">Created ↓</option>
				</select>
				<button onClick={()=>setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
			</div>

			<div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<div className="min-w-full overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="text-left p-3">Title</th>
								<th className="text-left p-3">Type</th>
								<th className="text-left p-3">Date</th>
								<th className="text-left p-3">Time</th>
								<th className="text-left p-3">Status</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.title || row.course?.title || '-'}</td>
									<td className="p-3">{row.exam_type}</td>
									<td className="p-3">{row.exam_date}</td>
									<td className="p-3">{row.start_time} - {row.end_time}</td>
									<td className="p-3"><span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800">{row.status}</span></td>
									<td className="p-3 text-right space-x-2">
										<button disabled={actionBusy===row.id} onClick={()=>doStart(row.id)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white disabled:opacity-50">Start</button>
										<button disabled={actionBusy===row.id} onClick={()=>doEnd(row.id)} className="px-3 py-1.5 rounded-md bg-rose-600 text-white disabled:opacity-50">End</button>
									</td>
								</tr>
							))) : (
								<tr><td colSpan="6" className="p-4 text-center text-gray-500">No schedules found</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 rounded-md border disabled:opacity-50">Prev</button>
				<div className="text-sm text-gray-500">Page {page}</div>
				<button onClick={()=>setPage(p=>p+1)} className="px-3 py-2 rounded-md border">Next</button>
			</div>
		</div>
	);
}
