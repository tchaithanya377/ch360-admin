import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

export default function ExamRegistrationsPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [examSession, setExamSession] = useState('');
	const [busyId, setBusyId] = useState(null);
	const [rejectingId, setRejectingId] = useState(null);
	const [rejectionReason, setRejectionReason] = useState('');

	const params = useMemo(() => ({ page, search, ...(examSession? { exam_schedule__exam_session: examSession } : {}) }), [page, search, examSession]);

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await ExamsAPI.examRegistrations.pendingApprovals(params);
			setData(res || { results: [], count: 0 });
		} catch (e) { setError(e?.message || 'Failed to load'); }
		finally { setLoading(false); }
	};

	useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

	const approve = async (id) => {
		if (!confirm('Approve this registration?')) return;
		setBusyId(id);
		try { await ExamsAPI.examRegistrations.approve(id); await load(); }
		catch (e) { alert(e.message || 'Failed to approve'); }
		finally { setBusyId(null); }
	};
	const openReject = (id) => { setRejectingId(id); setRejectionReason(''); };
	const doReject = async () => {
		if (!rejectionReason.trim()) { alert('Please provide a reason'); return; }
		const id = rejectingId; setBusyId(id);
		try { await ExamsAPI.examRegistrations.reject(id, rejectionReason); await load(); setRejectingId(null); }
		catch (e) { alert(e.message || 'Failed to reject'); }
		finally { setBusyId(null); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pending Registration Approvals</h1>
					<p className="text-gray-500 dark:text-gray-400">Approve or reject student exam registrations.</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search student" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<input value={examSession} onChange={(e)=>setExamSession(e.target.value)} placeholder="Session ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<button onClick={()=>setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
			</div>

			<div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<div className="min-w-full overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="text-left p-3">Student</th>
								<th className="text-left p-3">Schedule</th>
								<th className="text-left p-3">Status</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.student?.full_name || row.student?.roll_number || row.student || '-'}</td>
									<td className="p-3">{row.exam_schedule?.title || row.exam_schedule || '-'}</td>
									<td className="p-3">{row.status}</td>
									<td className="p-3 text-right space-x-2">
										<button disabled={busyId===row.id} onClick={()=>approve(row.id)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white disabled:opacity-50">Approve</button>
										<button disabled={busyId===row.id} onClick={()=>openReject(row.id)} className="px-3 py-1.5 rounded-md bg-rose-600 text-white disabled:opacity-50">Reject</button>
									</td>
								</tr>
							))) : (
								<tr><td colSpan="4" className="p-4 text-center text-gray-500">No pending approvals</td></tr>
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

			{rejectingId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
						<div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
							<h3 className="font-semibold">Rejection Reason</h3>
							<button onClick={()=>setRejectingId(null)} className="text-gray-500">✕</button>
						</div>
						<div className="p-4 space-y-3">
							<textarea value={rejectionReason} onChange={(e)=>setRejectionReason(e.target.value)} placeholder="Provide reason" className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
							<div className="pt-2 flex justify-end gap-2">
								<button type="button" onClick={()=>setRejectingId(null)} className="px-4 py-2 rounded-md border">Cancel</button>
								<button onClick={doReject} disabled={busyId===rejectingId} className="px-4 py-2 rounded-md bg-rose-600 text-white disabled:opacity-50">Reject</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
