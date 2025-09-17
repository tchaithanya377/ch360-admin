import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

export default function ExamResultsPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [scheduleId, setScheduleId] = useState('');
	const [isPublished, setIsPublished] = useState('');
	const [busyId, setBusyId] = useState(null);

	const params = useMemo(() => ({ page, search, ...(scheduleId? { exam_registration__exam_schedule: scheduleId } : {}), ...(isPublished!=='' ? { is_published: isPublished } : {}) }), [page, search, scheduleId, isPublished]);

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await ExamsAPI.examResults.list(params);
			setData(res || { results: [], count: 0 });
		} catch (e) { setError(e?.message || 'Failed to load'); }
		finally { setLoading(false); }
	};

	useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

	const publish = async (id) => {
		if (!confirm('Publish this result?')) return;
		setBusyId(id);
		try { await ExamsAPI.examResults.publish(id); await load(); }
		catch (e) { alert(e.message || 'Failed to publish'); }
		finally { setBusyId(null); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Results</h1>
					<p className="text-gray-500 dark:text-gray-400">Review and publish results.</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search student" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<input value={scheduleId} onChange={(e)=>setScheduleId(e.target.value)} placeholder="Schedule ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<select value={isPublished} onChange={(e)=>setIsPublished(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Published: Any</option>
					<option value="true">Published</option>
					<option value="false">Unpublished</option>
				</select>
				<button onClick={()=>setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
			</div>

			<div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<div className="min-w-full overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="text-left p-3">Student</th>
								<th className="text-left p-3">Marks</th>
								<th className="text-left p-3">Grade</th>
								<th className="text-left p-3">Published</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.exam_registration?.student?.full_name || '-'}</td>
									<td className="p-3">{row.marks_obtained} / {row.total_marks}</td>
									<td className="p-3">{row.grade || '-'}</td>
									<td className="p-3">{row.is_published ? 'Yes' : 'No'}</td>
									<td className="p-3 text-right space-x-2">
										{!row.is_published && <button disabled={busyId===row.id} onClick={()=>publish(row.id)} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white disabled:opacity-50">Publish</button>}
									</td>
								</tr>
							))) : (
								<tr><td colSpan="5" className="p-4 text-center text-gray-500">No results found</td></tr>
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
