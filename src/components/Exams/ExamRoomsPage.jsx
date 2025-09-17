import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

const ROOM_TYPES = ['HALL','CLASSROOM','LAB','AUDITORIUM'];

export default function ExamRoomsPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [ordering, setOrdering] = useState('building');
	const [filters, setFilters] = useState({ room_type: '', building: '', floor: '', is_accessible: '', is_active: '' });
	const [availRoomId, setAvailRoomId] = useState(null);
	const [availRange, setAvailRange] = useState({ start: '', end: '' });
	const [availability, setAvailability] = useState(null);
	const [checking, setChecking] = useState(false);

	const params = useMemo(() => ({ page, search, ordering, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v!=='')) }), [page, search, ordering, filters]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true); setError('');
			try {
				const res = await ExamsAPI.examRooms.list(params);
				if (mounted) setData(res || { results: [], count: 0 });
			} catch (e) { if (mounted) setError(e?.message || 'Failed to load'); }
			finally { if (mounted) setLoading(false); }
		};
		load();
		return () => { mounted = false; };
	}, [params]);

	const openAvailability = (roomId) => { setAvailRoomId(roomId); setAvailRange({ start: '', end: '' }); setAvailability(null); };
	const checkAvailability = async () => {
		if (!availRange.start || !availRange.end) { alert('Select start and end date'); return; }
		setChecking(true);
		try {
			const res = await ExamsAPI.examRooms.availability(availRoomId, { start_date: availRange.start, end_date: availRange.end });
			setAvailability(res || {});
		} catch (e) { alert(e.message || 'Failed to check availability'); }
		finally { setChecking(false); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Rooms</h1>
					<p className="text-gray-500 dark:text-gray-400">Rooms list and availability.</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name/building" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<select value={filters.room_type} onChange={(e)=>setFilters(f=>({...f, room_type:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">All Types</option>
					{ROOM_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
				</select>
				<input value={filters.building} onChange={(e)=>setFilters(f=>({...f, building:e.target.value}))} placeholder="Building" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-40" />
				<input value={filters.floor} onChange={(e)=>setFilters(f=>({...f, floor:e.target.value}))} placeholder="Floor" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-28" />
				<select value={filters.is_accessible} onChange={(e)=>setFilters(f=>({...f, is_accessible:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Accessible: Any</option>
					<option value="true">Accessible</option>
					<option value="false">Not Accessible</option>
				</select>
				<select value={filters.is_active} onChange={(e)=>setFilters(f=>({...f, is_active:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Active: Any</option>
					<option value="true">Active</option>
					<option value="false">Inactive</option>
				</select>
				<select value={ordering} onChange={(e)=>setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="building">Building ↑</option>
					<option value="-building">Building ↓</option>
					<option value="floor">Floor ↑</option>
					<option value="-floor">Floor ↓</option>
					<option value="name">Name ↑</option>
					<option value="-name">Name ↓</option>
					<option value="capacity">Capacity ↑</option>
					<option value="-capacity">Capacity ↓</option>
				</select>
				<button onClick={()=>setPage(1)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Apply</button>
			</div>

			<div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<div className="min-w-full overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
							<tr>
								<th className="text-left p-3">Name</th>
								<th className="text-left p-3">Building</th>
								<th className="text-left p-3">Floor</th>
								<th className="text-left p-3">Type</th>
								<th className="text-left p-3">Capacity</th>
								<th className="text-left p-3">Active</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="7" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.name}</td>
									<td className="p-3">{row.building || '-'}</td>
									<td className="p-3">{row.floor ?? '-'}</td>
									<td className="p-3">{row.room_type}</td>
									<td className="p-3">{row.capacity}</td>
									<td className="p-3">{row.is_active ? 'Yes' : 'No'}</td>
									<td className="p-3 text-right space-x-2">
										<button onClick={()=>openAvailability(row.id)} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white">Availability</button>
									</td>
								</tr>
							))) : (
								<tr><td colSpan="7" className="p-4 text-center text-gray-500">No rooms found</td></tr>
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

			{availRoomId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-xl rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
						<div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
							<h3 className="font-semibold">Room Availability</h3>
							<button onClick={()=>setAvailRoomId(null)} className="text-gray-500">✕</button>
						</div>
						<div className="p-4 space-y-3">
							<div className="flex gap-2 items-end">
								<input type="date" value={availRange.start} onChange={(e)=>setAvailRange(r=>({...r,start:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="date" value={availRange.end} onChange={(e)=>setAvailRange(r=>({...r,end:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<button onClick={checkAvailability} disabled={checking} className="px-3 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50">Check</button>
							</div>
							{availability && (
								<div className="text-sm">
									<pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{JSON.stringify(availability, null, 2)}</pre>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
