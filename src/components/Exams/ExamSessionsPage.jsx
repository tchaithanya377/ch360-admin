import React, { useEffect, useMemo, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';

const defaultForm = {
	name: '',
	session_type: 'MID_SEM',
	academic_year: '',
	semester: 1,
	start_date: '',
	end_date: '',
	registration_start: '',
	registration_end: '',
	status: 'DRAFT',
	description: '',
	is_active: true,
};

const SESSION_TYPES = ['MID_SEM','END_SEM','SUPPLEMENTARY','SPECIAL'];
const STATUS_OPTIONS = ['DRAFT','PUBLISHED','ONGOING','COMPLETED','CANCELLED'];

export default function ExamSessionsPage() {
	const [data, setData] = useState({ results: [], count: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({ session_type: '', academic_year: '', semester: '', status: '', is_active: '' });
	const [ordering, setOrdering] = useState('start_date');
	const [modalOpen, setModalOpen] = useState(false);
	const [editId, setEditId] = useState(null);
	const [form, setForm] = useState(defaultForm);
	const [submitError, setSubmitError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const params = useMemo(() => ({ page, search, ordering, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v!=='')) }), [page, search, ordering, filters]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true); setError('');
			try {
				const res = await ExamsAPI.examSessions.list(params);
				if (mounted) setData(res || { results: [], count: 0 });
			} catch (e) { if (mounted) setError(e?.message || 'Failed to load'); }
			finally { if (mounted) setLoading(false); }
		};
		load();
		return () => { mounted = false; };
	}, [params]);

	const openCreate = () => { setEditId(null); setForm(defaultForm); setSubmitError(''); setModalOpen(true); };
	const openEdit = (obj) => {
		setEditId(obj.id);
		setForm({
			name: obj.name || '',
			session_type: obj.session_type || 'MID_SEM',
			academic_year: obj.academic_year || '',
			semester: Number(obj.semester) || 1,
			start_date: obj.start_date || '',
			end_date: obj.end_date || '',
			registration_start: obj.registration_start || '',
			registration_end: obj.registration_end || '',
			status: obj.status || 'DRAFT',
			description: obj.description || '',
			is_active: !!obj.is_active,
		});
		setSubmitError('');
		setModalOpen(true);
	};
	const closeModal = () => setModalOpen(false);

	const validate = () => {
		if (!form.name.trim()) return 'Name is required';
		if (!form.academic_year.trim()) return 'Academic year is required';
		if (!form.start_date || !form.end_date) return 'Start and end dates are required';
		if (new Date(form.end_date) < new Date(form.start_date)) return 'End date must be after start date';
		if (form.registration_start && form.registration_end && (new Date(form.registration_end) < new Date(form.registration_start))) return 'Registration end must be after start';
		return '';
	};

	const handleSubmit = async (e) => {
		e.preventDefault(); setSubmitting(true); setSubmitError('');
		const msg = validate(); if (msg) { setSubmitError(msg); setSubmitting(false); return; }
		const payload = {
			name: form.name,
			session_type: form.session_type,
			academic_year: form.academic_year,
			semester: Number(form.semester),
			start_date: form.start_date,
			end_date: form.end_date,
			registration_start: form.registration_start || null,
			registration_end: form.registration_end || null,
			status: form.status,
			description: form.description || '',
			is_active: !!form.is_active,
		};
		try {
			if (editId) await ExamsAPI.examSessions.update(editId, payload);
			else await ExamsAPI.examSessions.create(payload);
			const res = await ExamsAPI.examSessions.list(params);
			setData(res || { results: [], count: 0 });
			setModalOpen(false);
		} catch (e) {
			if (e.status === 400 && e.payload) {
				const m = Object.entries(e.payload).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('; ');
				setSubmitError(m || e.message);
			} else setSubmitError(e.message || 'Failed to save');
		} finally { setSubmitting(false); }
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Sessions</h1>
					<p className="text-gray-500 dark:text-gray-400">Manage sessions and registration windows.</p>
				</div>
				<button onClick={openCreate} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">New Session</button>
			</div>

			<div className="flex flex-wrap gap-2 items-end">
				<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name/description" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<select value={filters.session_type} onChange={(e)=>setFilters(f=>({...f, session_type:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">All Types</option>
					{SESSION_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
				</select>
				<input value={filters.academic_year} onChange={(e)=>setFilters(f=>({...f, academic_year:e.target.value}))} placeholder="Academic Year (e.g., 2025-2026)" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
				<input value={filters.semester} onChange={(e)=>setFilters(f=>({...f, semester:e.target.value}))} type="number" placeholder="Semester" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 w-36" />
				<select value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Any Status</option>
					{STATUS_OPTIONS.map(s=> <option key={s} value={s}>{s}</option>)}
				</select>
				<select value={filters.is_active} onChange={(e)=>setFilters(f=>({...f, is_active:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="">Active: Any</option>
					<option value="true">Active</option>
					<option value="false">Inactive</option>
				</select>
				<select value={ordering} onChange={(e)=>setOrdering(e.target.value)} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
					<option value="start_date">Start Date ↑</option>
					<option value="-start_date">Start Date ↓</option>
					<option value="end_date">End Date ↑</option>
					<option value="-end_date">End Date ↓</option>
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
								<th className="text-left p-3">Name</th>
								<th className="text-left p-3">Type</th>
								<th className="text-left p-3">Year/Sem</th>
								<th className="text-left p-3">Dates</th>
								<th className="text-left p-3">Status</th>
								<th className="text-right p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading…</td></tr>
							) : (data?.results || []).length ? (data.results.map((row) => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
									<td className="p-3 font-medium">{row.name}</td>
									<td className="p-3">{row.session_type}</td>
									<td className="p-3">{row.academic_year} / {row.semester}</td>
									<td className="p-3">{row.start_date} → {row.end_date}</td>
									<td className="p-3"><span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800">{row.status}</span></td>
									<td className="p-3 text-right">
										<button onClick={()=>openEdit(row)} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700">Edit</button>
									</td>
								</tr>
							))) : (
								<tr><td colSpan="6" className="p-4 text-center text-gray-500">No sessions found</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Simple pagination */}
			<div className="flex items-center justify-between">
				<button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 rounded-md border disabled:opacity-50">Prev</button>
				<div className="text-sm text-gray-500">Page {page}</div>
				<button onClick={()=>setPage(p=>p+1)} className="px-3 py-2 rounded-md border">Next</button>
			</div>

			{/* Modal */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
						<div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
							<h3 className="font-semibold">{editId ? 'Edit Session' : 'New Session'}</h3>
							<button onClick={closeModal} className="text-gray-500">✕</button>
						</div>
						<form onSubmit={handleSubmit} className="p-4 space-y-3">
							{submitError && <div className="text-red-600 text-sm">{submitError}</div>}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<select value={form.session_type} onChange={(e)=>setForm(f=>({...f,session_type:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
									{SESSION_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
								</select>
								<input value={form.academic_year} onChange={(e)=>setForm(f=>({...f,academic_year:e.target.value}))} placeholder="Academic Year (e.g., 2025-2026)" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="number" value={form.semester} onChange={(e)=>setForm(f=>({...f,semester:e.target.value}))} placeholder="Semester" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="date" value={form.start_date} onChange={(e)=>setForm(f=>({...f,start_date:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="date" value={form.end_date} onChange={(e)=>setForm(f=>({...f,end_date:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="datetime-local" value={form.registration_start} onChange={(e)=>setForm(f=>({...f,registration_start:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<input type="datetime-local" value={form.registration_end} onChange={(e)=>setForm(f=>({...f,registration_end:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
								<select value={form.status} onChange={(e)=>setForm(f=>({...f,status:e.target.value}))} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
									{STATUS_OPTIONS.map(s=> <option key={s} value={s}>{s}</option>)}
								</select>
								<textarea value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} placeholder="Description" className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 sm:col-span-2" />
								<label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e)=>setForm(f=>({...f,is_active:e.target.checked}))} /> Active</label>
							</div>
							<div className="pt-2 flex justify-end gap-2">
								<button type="button" onClick={closeModal} className="px-4 py-2 rounded-md border">Cancel</button>
								<button disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{submitting? 'Saving…':'Save'}</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
