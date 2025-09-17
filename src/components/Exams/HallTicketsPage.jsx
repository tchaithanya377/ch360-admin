import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

export default function HallTicketsPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({ status: '', exam_room: '', exam_registration__exam_schedule: '' });
	const [busyId, setBusyId] = useState(null);

	const params = useMemo(() => ({ page, search, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v!=='')) }), [page, search, filters]);

	const load = async () => {
		setLoading(true); setError('');
		try {
			const res = await ExamsAPI.hallTickets.list(params);
			setData(res || { results: [], count: 0 });
		} catch (e) { setError(e?.message || 'Failed to load'); }
		finally { setLoading(false); }
	};

	useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

	const issue = async (id) => {
		setBusyId(id);
		try { await ExamsAPI.hallTickets.issue(id); await load(); }
		catch (e) { alert(e.message || 'Failed to issue'); }
		finally { setBusyId(null); }
	};
	const printTicket = async (id) => {
		setBusyId(id);
		try { await ExamsAPI.hallTickets.print(id); alert('Print requested'); }
		catch (e) { alert(e.message || 'Failed to print'); }
		finally { setBusyId(null); }
	};
	const downloadPdf = async (id) => {
		setBusyId(id);
		try {
			const res = await ExamsAPI.hallTickets.downloadPdf(id);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url; a.download = `hall-ticket-${id}.pdf`; a.click();
			URL.revokeObjectURL(url);
		} catch (e) { alert(e.message || 'Failed to download'); }
		finally { setBusyId(null); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Hall Tickets</h1>
					<p className="text-gray-500 dark:text-gray-400">Issue, print, and download hall tickets.</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by ticket/student" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<input value={filters.exam_room} onChange={(e)=>setFilters(f=>({...f, exam_room:e.target.value}))} placeholder="Room ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<input value={filters.exam_registration__exam_schedule} onChange={(e)=>setFilters(f=>({...f, exam_registration__exam_schedule:e.target.value}))} placeholder="Schedule ID" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-44" />
				<select value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Any Status</option>
					<option value="ISSUED">ISSUED</option>
					<option value="PENDING">PENDING</option>
				</select>
				<button onClick={()=>setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
			</div>

			<div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<div className="min-w-full overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="text-left p-3">Ticket</th>
								<th className="text-left p-3">Student</th>
								<th className="text-left p-3">Room</th>
								<th className="text-left p-3">Status</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.ticket_number}</td>
									<td className="p-3">{row.exam_registration?.student?.full_name || '-'}</td>
									<td className="p-3">{row.exam_room || '-'}</td>
									<td className="p-3">{row.status}</td>
									<td className="p-3 text-right space-x-2">
										<button disabled={busyId===row.id} onClick={()=>issue(row.id)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white disabled:opacity-50">Issue</button>
										<button disabled={busyId===row.id} onClick={()=>printTicket(row.id)} className="px-3 py-1.5 rounded-md bg-gray-700 text-white disabled:opacity-50">Print</button>
										<button disabled={busyId===row.id} onClick={()=>downloadPdf(row.id)} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white disabled:opacity-50">PDF</button>
									</td>
								</tr>
							))) : (
								<tr><td colSpan="5" className="p-4 text-center text-gray-500">No hall tickets found</td></tr>
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
