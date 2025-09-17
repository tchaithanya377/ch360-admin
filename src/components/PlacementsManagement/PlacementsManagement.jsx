import React, { useEffect, useMemo, useState } from "react";
import { placementsApiJson as api, placementsUploads, placementsCursorJson } from "../../services/placementsApiService";

const SectionTab = ({ active, label, onClick }) => (
	<button
		className={`px-3 py-2 rounded-md text-sm font-medium transition ${
			active
				? "bg-blue-600 text-white"
				: "bg-white text-gray-700 hover:bg-gray-100"
		}`}
		onClick={onClick}
	>
		{label}
	</button>
);

const StatTile = ({ label, value, sub }) => (
	<div className="rounded-lg border bg-white p-4">
		<div className="text-sm text-gray-500">{label}</div>
		<div className="mt-1 text-2xl font-semibold">{value ?? "-"}</div>
		{sub ? <div className="mt-1 text-xs text-gray-400">{sub}</div> : null}
	</div>
);

const Empty = ({ title = "No data", hint }) => (
	<div className="text-center py-10 text-gray-500">
		<div className="font-medium">{title}</div>
		{hint ? <div className="text-sm mt-1 text-gray-400">{hint}</div> : null}
	</div>
);

function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [overview, setOverview] = useState(null);
	const [trends, setTrends] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError("");
			const [ov, tr] = await Promise.all([
				api.getStatisticsOverview(),
				api.getTrends(),
			]);
			if (cancelled) return;
			if (!ov.ok) setError("Failed to load overview");
			if (!tr.ok) setError((e) => e || "Failed to load trends");
			setOverview(ov.data || null);
			setTrends(tr.data || null);
			setLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const tiles = useMemo(() => {
		const s = overview || {};
		return [
			{ label: "Total Students", value: s.total_students },
			{ label: "Eligible", value: s.eligible_students },
			{ label: "Placed", value: s.placed_students },
			{ label: "Placement %", value: s.placement_percentage },
			{ label: "Avg Salary", value: s.average_salary },
			{ label: "Highest Salary", value: s.highest_salary },
		];
	}, [overview]);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{tiles.map((t) => (
					<StatTile key={t.label} label={t.label} value={t.value} />
				))}
			</div>

			<div className="rounded-lg border bg-white p-4">
				<div className="flex items-center justify-between">
					<div className="font-medium">Placement Trends</div>
				</div>
				<div className="mt-3">
					{loading ? (
						<div className="text-sm text-gray-500">Loading...</div>
					) : error ? (
						<div className="text-sm text-red-600">{error}</div>
					) : !trends ? (
						<Empty title="No trends available" />
					) : (
						<div className="text-sm text-gray-600">
							{/* Placeholder for charting; connect Recharts later */}
							Showing {Array.isArray(trends?.points) ? trends.points.length : 0} data points.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function Companies() {
	const [search, setSearch] = useState("");
	const [items, setItems] = useState([]);
	const [next, setNext] = useState(null);
	const [previous, setPrevious] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		name: "",
		website: "",
		description: "",
		industry: "",
		company_size: "",
		headquarters: "",
		contact_email: "",
		contact_phone: "",
		last_visit_date: "",
		is_active: true,
	});

	const fetchPage = async (cursorUrl = null, replace = false) => {
		setLoading(true);
		setError("");
		const res = await api.getCompanies(cursorUrl ? { cursor: cursorUrl } : { search });
		if (!res.ok) setError("Failed to load companies");
		const payload = res.data || { results: [], next: null, previous: null };
		setItems((prev) => (replace ? (payload.results || []) : [...prev, ...(payload.results || [])]));
		setNext(payload.next || null);
		setPrevious(payload.previous || null);
		setLoading(false);
	};

	useEffect(() => {
		// initial load
		fetchPage(null, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const doSearch = () => {
		setItems([]);
		setNext(null);
		setPrevious(null);
		fetchPage(null, true);
	};

	const openCreate = () => {
		setEditing({});
		setForm({
			name: "",
			website: "",
			description: "",
			industry: "",
			company_size: "",
			headquarters: "",
			contact_email: "",
			contact_phone: "",
			last_visit_date: "",
			is_active: true,
		});
	};

	const openEdit = (item) => {
		setEditing(item);
		setForm({
			name: item.name || "",
			website: item.website || "",
			description: item.description || "",
			industry: item.industry || "",
			company_size: item.company_size || "",
			headquarters: item.headquarters || "",
			contact_email: item.contact_email || "",
			contact_phone: item.contact_phone || "",
			last_visit_date: item.last_visit_date || "",
			is_active: item.is_active !== undefined ? !!item.is_active : true,
		});
	};

	const save = async () => {
		const payload = { ...form };
		const res = (editing && editing.id) ? await api.updateCompany(editing.id, payload) : await api.createCompany(payload);
		if (!res.ok) return alert("Save failed");
		// Reload from scratch to reflect changes
		await fetchPage(null, true);
		setEditing(null);
	};

	const remove = async (item) => {
		if (!window.confirm(`Delete ${item.name}?`)) return;
		const res = await api.deleteCompany(item.id);
		if (!res.ok) return alert("Delete failed");
		await fetchPage(null, true);
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
				<div className="font-medium">Companies</div>
				<div className="flex gap-2">
					<input
						type="text"
						className="px-3 py-2 border rounded-md text-sm"
						placeholder="Search companies..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
					/>
					<button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm" onClick={doSearch}>Search</button>
					<button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm" onClick={openCreate}>New</button>
				</div>
			</div>

			<div className="rounded-lg border overflow-hidden">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-gray-600">
						<tr>
							<th className="text-left px-3 py-2">Name</th>
							<th className="text-left px-3 py-2">Industry</th>
							<th className="text-left px-3 py-2">Size</th>
							<th className="px-3 py-2"/>
						</tr>
					</thead>
					<tbody>
						{loading && items.length === 0 ? (
							<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={4}>Loading...</td></tr>
						) : error ? (
							<tr><td className="px-3 py-6 text-center text-red-600" colSpan={4}>{error}</td></tr>
						) : items.length === 0 ? (
							<tr><td className="px-3 py-6" colSpan={4}><Empty title="No companies" hint="Create a company to get started"/></td></tr>
						) : (
							items.map((c) => (
								<tr key={c.id} className="border-t">
									<td className="px-3 py-2">{c.name}</td>
									<td className="px-3 py-2 text-gray-600">{c.industry || "-"}</td>
									<td className="px-3 py-2 text-gray-600">{c.company_size || "-"}</td>
									<td className="px-3 py-2 text-right">
										<div className="inline-flex gap-2">
											<button className="px-2 py-1 text-blue-600 hover:underline" onClick={() => openEdit(c)}>Edit</button>
											<button className="px-2 py-1 text-red-600 hover:underline" onClick={() => remove(c)}>Delete</button>
										</div>
									</td>
								</tr>
							))
						)}
						{loading && items.length > 0 ? (
							<tr><td className="px-3 py-3 text-center text-gray-500" colSpan={4}>Loading more...</td></tr>
						) : null}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between text-sm text-gray-600">
				<div>
					{previous ? <button className="px-3 py-1 rounded border mr-2" onClick={() => fetchPage(previous, true)}>Newer</button> : null}
				</div>
				<div>
					{next ? <button className="px-3 py-1 rounded border" onClick={() => fetchPage(next, false)}>Load more</button> : <span className="text-gray-400">No more</span>}
				</div>
			</div>

			{(editing !== null) && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
					<div className="w-full max-w-2xl rounded-lg bg-white p-4 space-y-3">
						<div className="font-medium">{editing && editing.id ? "Edit company" : "New company"}</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Name</span>
								<input className="w-full px-3 py-2 border rounded-md" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Website</span>
								<input className="w-full px-3 py-2 border rounded-md" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}/>
							</label>
							<label className="sm:col-span-2 block text-sm">
								<span className="block text-gray-600 mb-1">Description</span>
								<textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Industry</span>
								<input className="w-full px-3 py-2 border rounded-md" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Company size</span>
								<select className="w-full px-3 py-2 border rounded-md" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })}>
									<option value="">Select</option>
									<option value="STARTUP">STARTUP</option>
									<option value="SMALL">SMALL</option>
									<option value="MEDIUM">MEDIUM</option>
									<option value="LARGE">LARGE</option>
									<option value="ENTERPRISE">ENTERPRISE</option>
								</select>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Headquarters</span>
								<input className="w-full px-3 py-2 border rounded-md" value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Contact email</span>
								<input type="email" className="w-full px-3 py-2 border rounded-md" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Contact phone</span>
								<input className="w-full px-3 py-2 border rounded-md" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}/>
							</label>
							<label className="block text-sm">
								<span className="block text-gray-600 mb-1">Last visit date</span>
								<input type="date" className="w-full px-3 py-2 border rounded-md" value={form.last_visit_date || ""} onChange={(e) => setForm({ ...form, last_visit_date: e.target.value })}/>
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}/>
								<span className="text-gray-600">Is active</span>
							</label>
							{editing && editing.id ? (
								<div className="sm:col-span-2 grid grid-cols-3 gap-3 text-sm">
									<div className="rounded border p-2"><div className="text-gray-500">Rating</div><div className="font-medium">{(editing.rating ?? 0).toFixed ? editing.rating.toFixed(2) : (editing.rating ?? 0)}</div></div>
									<div className="rounded border p-2"><div className="text-gray-500">Total placements</div><div className="font-medium">{editing.total_placements ?? 0}</div></div>
									<div className="rounded border p-2"><div className="text-gray-500">Total drives</div><div className="font-medium">{editing.total_drives ?? 0}</div></div>
								</div>
							) : null}
						</div>
						<div className="flex items-center justify-end gap-2">
							<button className="px-3 py-2 rounded border" onClick={() => setEditing(null)}>Cancel</button>
							<button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={save}>Save</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Generic resource manager to quickly enable CRUD for remaining resources
function ResourceManager({
	resourceKey,
	list,
	getOne,
	create,
	update,
	remove,
	extraListParams = {},
	customListItemRender,
	supportsCursor = true,
	customCreateUi,
}) {
	const [search, setSearch] = useState("");
	const [items, setItems] = useState([]);
	const [next, setNext] = useState(null);
	const [previous, setPrevious] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(null);
	const [jsonPayload, setJsonPayload] = useState("{}\n");

	const fetchPage = async (cursorUrl = null, replace = false) => {
		setLoading(true);
		setError("");
		let res;
		if (supportsCursor && cursorUrl) {
			res = await placementsCursorJson.get(cursorUrl);
		} else {
			res = await list({ search, ...(extraListParams || {}) });
		}
		if (!res.ok) setError(`Failed to load ${resourceKey}`);
		const payload = res.data || { results: [], next: null, previous: null };
		const results = Array.isArray(payload) ? payload : (payload.results || []);
		setItems((prev) => (replace ? results : [...prev, ...results]));
		setNext(payload.next || null);
		setPrevious(payload.previous || null);
		setLoading(false);
	};

	useEffect(() => {
		fetchPage(null, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

	const doSearch = () => {
		setItems([]);
		setNext(null);
		setPrevious(null);
		fetchPage(null, true);
 	};

	const openCreate = () => {
		setEditing({});
		setJsonPayload("{}\n");
 	};

	const openEdit = async (item) => {
 		setEditing(item);
 		try {
 			const res = await getOne(item.id);
 			const obj = res.ok ? (res.data || item) : item;
 			setJsonPayload(JSON.stringify(obj, null, 2) + "\n");
 		} catch (_) {
 			setJsonPayload(JSON.stringify(item, null, 2) + "\n");
 		}
 	};

	const parseJson = () => {
 		try {
 			const obj = JSON.parse(jsonPayload || "{}");
 			return obj;
 		} catch (e) {
 			alert("Invalid JSON payload");
 			throw e;
 		}
 	};

	const save = async () => {
 		let payload;
 		try { payload = parseJson(); } catch { return; }
 		const res = (editing && editing.id) ? await update(editing.id, payload) : await create(payload);
 		if (!res.ok) return alert("Save failed");
 		await fetchPage(null, true);
 		setEditing(null);
 	};

	const removeItem = async (item) => {
 		if (!window.confirm(`Delete ${resourceKey} ${item?.name || item?.title || item?.id}?`)) return;
 		const res = await remove(item.id);
 		if (!res.ok) return alert("Delete failed");
 		await fetchPage(null, true);
 	};

	const renderRow = (item) => {
 		if (typeof customListItemRender === "function") return customListItemRender(item, { openEdit, removeItem });
 		return (
 			<tr key={item.id} className="border-t">
 				<td className="px-3 py-2">{item.name || item.title || `#${item.id}`}</td>
 				<td className="px-3 py-2 text-gray-600">{item.industry || item.location || item.status || item.type || item.role || item.company || '-'}</td>
 				<td className="px-3 py-2 text-right">
 					<div className="inline-flex gap-2">
 						<button className="px-2 py-1 text-blue-600 hover:underline" onClick={() => openEdit(item)}>Edit</button>
 						<button className="px-2 py-1 text-red-600 hover:underline" onClick={() => removeItem(item)}>Delete</button>
 					</div>
 				</td>
 			</tr>
 		);
 	};

	return (
 		<div className="space-y-3">
 			<div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
 				<div className="font-medium capitalize">{resourceKey}</div>
 				<div className="flex gap-2">
 					<input
 						type="text"
 						className="px-3 py-2 border rounded-md text-sm"
 						placeholder={`Search ${resourceKey}...`}
 						value={search}
 						onChange={(e) => setSearch(e.target.value)}
 						onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
 					/>
 					<button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm" onClick={doSearch}>Search</button>
 					<button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm" onClick={openCreate}>New</button>
 				</div>
 			</div>

 			<div className="rounded-lg border overflow-hidden">
 				<table className="min-w-full text-sm">
 					<thead className="bg-gray-50 text-gray-600">
 						<tr>
 							<th className="text-left px-3 py-2">Name/Title</th>
 							<th className="text-left px-3 py-2">Info</th>
 							<th className="px-3 py-2"/>
 						</tr>
 					</thead>
 					<tbody>
 						{loading && items.length === 0 ? (
 							<tr><td className="px-3 py-6 text-center text-gray-500" colSpan={3}>Loading...</td></tr>
 						) : error ? (
 							<tr><td className="px-3 py-6 text-center text-red-600" colSpan={3}>{error}</td></tr>
 						) : items.length === 0 ? (
 							<tr><td className="px-3 py-6" colSpan={3}><Empty title={`No ${resourceKey}`} hint={`Create a ${resourceKey.slice(0, -1)} to get started`}/></td></tr>
 						) : (
 							items.map((it) => renderRow(it))
 						)}
 						{loading && items.length > 0 ? (
 							<tr><td className="px-3 py-3 text-center text-gray-500" colSpan={3}>Loading more...</td></tr>
 						) : null}
 					</tbody>
 				</table>
 			</div>

 			<div className="flex items-center justify-between text-sm text-gray-600">
 				<div>
 					{previous ? <button className="px-3 py-1 rounded border mr-2" onClick={() => fetchPage(previous, true)}>Newer</button> : null}
 				</div>
 				<div>
 					{next ? <button className="px-3 py-1 rounded border" onClick={() => fetchPage(next, false)}>Load more</button> : <span className="text-gray-400">No more</span>}
 				</div>
 			</div>

 			{(editing !== null) && (
 				<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
 					<div className="w-full max-w-2xl rounded-lg bg-white p-4 space-y-3">
 						<div className="font-medium">{editing ? `Edit ${resourceKey}` : `New ${resourceKey.slice(0, -1)}`}</div>
 						{typeof customCreateUi === "function" ? customCreateUi({ jsonPayload, setJsonPayload, save, cancel: () => setEditing(null), refresh: () => fetchPage(null, true), close: () => setEditing(null) }) : (
 							<div className="space-y-2">
 								<label className="block text-sm">
 									<span className="block text-gray-600 mb-1">JSON payload</span>
 									<textarea className="w-full px-3 py-2 border rounded-md font-mono text-xs" rows={14} value={jsonPayload} onChange={(e) => setJsonPayload(e.target.value)} />
 								</label>
 								<div className="flex items-center justify-end gap-2">
 									<button className="px-3 py-2 rounded border" onClick={() => setEditing(null)}>Cancel</button>
 									<button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={save}>Save</button>
 								</div>
 							</div>
 						)}
 					</div>
 				</div>
 			)}
 		</div>
 	);
}

// Specialized UIs for Documents and Applications to support file upload
function Documents() {
    const createUi = ({ jsonPayload, setJsonPayload, save, cancel }) => {
        const [file, setFile] = useState(null);
        const upload = async () => {
            try {
                const obj = JSON.parse(jsonPayload || "{}");
                const res = await placementsUploads.createDocumentUpload({ ...obj, file });
                if (!res.ok) return alert("Upload failed");
                save(); // triggers list refresh through parent after successful upload via save()
            } catch (_) {
                alert("Invalid JSON payload");
            }
        };
        return (
            <div className="space-y-3">
                <label className="block text-sm">
                    <span className="block text-gray-600 mb-1">JSON payload (metadata)</span>
                    <textarea className="w-full px-3 py-2 border rounded-md font-mono text-xs" rows={10} value={jsonPayload} onChange={(e) => setJsonPayload(e.target.value)} />
                </label>
                <label className="block text-sm">
                    <span className="block text-gray-600 mb-1">File</span>
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={cancel}>Cancel</button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={upload}>Upload</button>
                </div>
            </div>
        );
    };
    return (
        <ResourceManager
            resourceKey="documents"
            list={api.getDocuments}
            getOne={api.getDocument}
            create={api.createDocument}
            update={api.updateDocument}
            remove={api.deleteDocument}
            customCreateUi={createUi}
        />
    );
}

function Applications() {
    const createUi = ({ refresh, close }) => {
        const [students, setStudents] = useState([]);
        const [jobs, setJobs] = useState([]);
        const [drives, setDrives] = useState([]);
        const [form, setForm] = useState({ student_id: "", job_id: "", drive_id: "", cover_letter: "", status: "APPLIED", notes: "" });
        const [resume, setResume] = useState(null);
        useEffect(() => {
            (async () => {
                try {
                    // Fetch options (first page)
                    const [js, ds] = await Promise.all([
                        api.getJobs({}),
                        api.getDrives({})
                    ]);
                    setJobs((js.data?.results) || []);
                    setDrives((ds.data?.results) || []);
                } catch {}
                try {
                    const mod = await import("../../services/studentApiService");
                    const svc = mod.default;
                    const list = await svc.getStudents({ page: 1, page_size: 50 });
                    setStudents(list?.results || list || []);
                } catch {}
            })();
        }, []);
        const submit = async () => {
            try {
                if (resume) {
                    const res = await placementsUploads.createApplicationUpload({ ...form, resume });
                    if (!res.ok) return alert("Create failed");
                } else {
                    const res = await api.createApplication(form);
                    if (!res.ok) return alert("Create failed");
                }
                if (typeof refresh === "function") await refresh();
                if (typeof close === "function") close();
            } catch (_) {
                alert("Create failed");
            }
        };
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Student</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                            <option value="">Select student</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.roll_number || s.registration_number || s.name || s.id}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Job</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.job_id} onChange={(e) => setForm({ ...form, job_id: e.target.value })}>
                            <option value="">Select job</option>
                            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Drive (optional)</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.drive_id} onChange={(e) => setForm({ ...form, drive_id: e.target.value })}>
                            <option value="">Select drive</option>
                            {drives.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Cover letter</span>
                        <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Status</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            <option>APPLIED</option>
                            <option>UNDER_REVIEW</option>
                            <option>INTERVIEW</option>
                            <option>OFFERED</option>
                            <option>REJECTED</option>
                            <option>WITHDRAWN</option>
                            <option>HIRED</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Resume (optional)</span>
                        <input type="file" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Notes</span>
                        <textarea rows={2} className="w-full px-3 py-2 border rounded-md" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}/>
                    </label>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={close}>Cancel</button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submit}>Save</button>
                </div>
            </div>
        );
    };
    return (
        <ResourceManager
            resourceKey="applications"
            list={api.getApplications}
            getOne={api.getApplication}
            create={api.createApplication}
            update={api.updateApplication}
            remove={api.deleteApplication}
            customCreateUi={createUi}
        />
    );
}

function Jobs() {
    return (
        <ResourceManager
            resourceKey="jobs"
            list={api.getJobs}
            getOne={api.getJob}
            create={api.createJob}
            update={api.updateJob}
            remove={api.deleteJob}
        />
    );
}

function Drives() {
    return (
        <ResourceManager
            resourceKey="drives"
            list={api.getDrives}
            getOne={api.getDrive}
            create={api.createDrive}
            update={api.updateDrive}
            remove={api.deleteDrive}
            supportsCursor={false}
        />
    );
}

function Rounds() {
    const createUi = ({ refresh, close }) => {
        const [drives, setDrives] = useState([]);
        const [form, setForm] = useState({ drive: "", name: "", round_type: "OTHER", scheduled_at: "", location: "", instructions: "" });
        useEffect(() => {
            (async () => {
                try {
                    const ds = await api.getDrives({});
                    setDrives((ds.data?.results) || []);
                } catch {}
            })();
        }, []);
        const submit = async () => {
            const res = await api.createRound(form);
            if (!res.ok) return alert("Create failed");
            if (typeof refresh === "function") await refresh();
            if (typeof close === "function") close();
        };
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Drive</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.drive} onChange={(e) => setForm({ ...form, drive: e.target.value })}>
                            <option value="">Select drive</option>
                            {drives.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Name</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Round type</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.round_type} onChange={(e) => setForm({ ...form, round_type: e.target.value })}>
                            <option>APTITUDE</option>
                            <option>TECH_TEST</option>
                            <option>GD</option>
                            <option>TECH_INTERVIEW</option>
                            <option>HR_INTERVIEW</option>
                            <option>OTHER</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Scheduled at</span>
                        <input type="datetime-local" className="w-full px-3 py-2 border rounded-md" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}/>
                    </label>
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Location</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/>
                    </label>
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Instructions</span>
                        <textarea rows={3} className="w-full px-3 py-2 border rounded-md" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}/>
                    </label>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={close}>Cancel</button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submit}>Save</button>
                </div>
            </div>
        );
    };
    return (
        <ResourceManager
            resourceKey="rounds"
            list={api.getRounds}
            getOne={api.getRound}
            create={api.createRound}
            update={api.updateRound}
            remove={api.deleteRound}
            supportsCursor={false}
            customCreateUi={createUi}
        />
    );
}

function Offers() {
    return (
        <ResourceManager
            resourceKey="offers"
            list={api.getOffers}
            getOne={api.getOffer}
            create={api.createOffer}
            update={api.updateOffer}
            remove={api.deleteOffer}
        />
    );
}

function StatisticsList() {
    return (
        <ResourceManager
            resourceKey="statistics"
            list={api.getStatistics}
            getOne={api.getStatistic}
            create={api.createStatistic}
            update={api.updateStatistic}
            remove={api.deleteStatistic}
        />
    );
}

function Feedbacks() {
    return (
        <ResourceManager
            resourceKey="feedbacks"
            list={api.getFeedbacks}
            getOne={api.getFeedback}
            create={api.createFeedback}
            update={api.updateFeedback}
            remove={api.deleteFeedback}
        />
    );
}

function Alumni() {
    const [network, setNetwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            const res = await api.getAlumniNetwork();
            if (!res.ok) setError("Failed to load alumni network");
            setNetwork(res.data || null);
            setLoading(false);
        })();
    }, []);
    const createUi = ({ refresh, close }) => {
        const [students, setStudents] = useState([]);
        const [form, setForm] = useState({
            student_id: "",
            current_company: "",
            current_designation: "",
            current_salary: "",
            current_location: "",
            total_experience_years: "",
            job_changes: "",
            pursuing_higher_studies: false,
            higher_studies_institution: "",
            higher_studies_program: "",
            is_entrepreneur: false,
            startup_name: "",
            startup_description: "",
            linkedin_profile: "",
            email: "",
            phone: "",
            willing_to_mentor: false,
            willing_to_recruit: false,
        });
        useEffect(() => {
            (async () => {
                try {
                    const mod = await import("../../services/studentApiService");
                    const svc = mod.default;
                    const list = await svc.getStudents({ page: 1, page_size: 50 });
                    setStudents(list?.results || list || []);
                } catch {}
            })();
        }, []);
        const submit = async () => {
            const res = await api.createAlumnus(form);
            if (!res.ok) return alert("Create failed");
            if (typeof refresh === "function") await refresh();
            if (typeof close === "function") close();
        };
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Student</span>
                        <select className="w-full px-3 py-2 border rounded-md" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                            <option value="">Select student</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.roll_number || s.registration_number || s.name || s.id}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Current company</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Current designation</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.current_designation} onChange={(e) => setForm({ ...form, current_designation: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Current salary</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.current_salary} onChange={(e) => setForm({ ...form, current_salary: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Current location</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Total experience years</span>
                        <input type="number" step="0.1" className="w-full px-3 py-2 border rounded-md" value={form.total_experience_years} onChange={(e) => setForm({ ...form, total_experience_years: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Job changes</span>
                        <input type="number" className="w-full px-3 py-2 border rounded-md" value={form.job_changes} onChange={(e) => setForm({ ...form, job_changes: e.target.value })}/>
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" checked={!!form.pursuing_higher_studies} onChange={(e) => setForm({ ...form, pursuing_higher_studies: e.target.checked })}/>
                        <span className="text-gray-600">Pursuing higher studies</span>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Higher studies institution</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.higher_studies_institution} onChange={(e) => setForm({ ...form, higher_studies_institution: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Higher studies program</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.higher_studies_program} onChange={(e) => setForm({ ...form, higher_studies_program: e.target.value })}/>
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" checked={!!form.is_entrepreneur} onChange={(e) => setForm({ ...form, is_entrepreneur: e.target.checked })}/>
                        <span className="text-gray-600">Is entrepreneur</span>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Startup name</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.startup_name} onChange={(e) => setForm({ ...form, startup_name: e.target.value })}/>
                    </label>
                    <label className="block text-sm sm:col-span-2">
                        <span className="block text-gray-600 mb-1">Startup description</span>
                        <textarea rows={2} className="w-full px-3 py-2 border rounded-md" value={form.startup_description} onChange={(e) => setForm({ ...form, startup_description: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Linkedin profile</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.linkedin_profile} onChange={(e) => setForm({ ...form, linkedin_profile: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Email</span>
                        <input type="email" className="w-full px-3 py-2 border rounded-md" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
                    </label>
                    <label className="block text-sm">
                        <span className="block text-gray-600 mb-1">Phone</span>
                        <input className="w-full px-3 py-2 border rounded-md" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!form.willing_to_mentor} onChange={(e) => setForm({ ...form, willing_to_mentor: e.target.checked })}/>
                        <span className="text-gray-600">Willing to mentor</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!form.willing_to_recruit} onChange={(e) => setForm({ ...form, willing_to_recruit: e.target.checked })}/>
                        <span className="text-gray-600">Willing to recruit</span>
                    </label>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-2 rounded border" onClick={close}>Cancel</button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submit}>Save</button>
                </div>
            </div>
        );
    };
    return (
        <div className="space-y-4">
            <ResourceManager
                resourceKey="alumni"
                list={api.getAlumni}
                getOne={api.getAlumnus}
                create={api.createAlumnus}
                update={api.updateAlumnus}
                remove={api.deleteAlumnus}
                customCreateUi={createUi}
            />
            <div className="rounded-lg border bg-white p-4">
                <div className="font-medium mb-2">Alumni Network</div>
                {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-sm text-red-600">{error}</div>
                ) : (
                    <div className="text-sm text-gray-600 overflow-auto">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(network || {}, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function Analytics() {
    const [trends, setTrends] = useState(null);
    const [nirf, setNirf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            const [tr, nr] = await Promise.all([
                api.getTrends(),
                api.getNirfReport(),
            ]);
            if (!tr.ok) setError((e) => e || "Failed to load trends");
            if (!nr.ok) setError((e) => e || "Failed to load NIRF report");
            setTrends(tr.data || null);
            setNirf(nr.data || null);
            setLoading(false);
        })();
    }, []);
    return (
        <div className="space-y-4">
            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
            ) : (
                <>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="font-medium">Trends</div>
                        <div className="text-sm text-gray-600 mt-2">{Array.isArray(trends?.points) ? `${trends.points.length} points` : 'No data'}</div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <div className="font-medium">NIRF Report</div>
                        <div className="text-sm text-gray-600 mt-2 overflow-auto">
                            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(nirf || {}, null, 2)}</pre>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function PlacementsManagement() {
	const tabs = [
		{ key: "dashboard", label: "Dashboard", render: () => <Dashboard /> },
		{ key: "companies", label: "Companies", render: () => <Companies /> },
		{ key: "jobs", label: "Jobs", render: () => <Jobs /> },
		{ key: "drives", label: "Drives", render: () => <Drives /> },
		{ key: "applications", label: "Applications", render: () => <Applications /> },
		{ key: "rounds", label: "Rounds", render: () => <Rounds /> },
		{ key: "offers", label: "Offers", render: () => <Offers /> },
		{ key: "statistics", label: "Statistics", render: () => <StatisticsList /> },
		{ key: "feedback", label: "Feedback", render: () => <Feedbacks /> },
		{ key: "documents", label: "Documents", render: () => <Documents /> },
		{ key: "alumni", label: "Alumni", render: () => <Alumni /> },
		{ key: "analytics", label: "Analytics", render: () => <Analytics /> },
	];
	const [active, setActive] = useState(tabs[0].key);
	const current = tabs.find((t) => t.key === active) || tabs[0];

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold">Placements</h1>
				<p className="text-gray-500 text-sm mt-1">Modern, simple, and role-ready UI for companies, jobs, drives, applications, and analytics.</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{tabs.map((t) => (
					<SectionTab key={t.key} active={active === t.key} label={t.label} onClick={() => setActive(t.key)} />
				))}
			</div>

			<div className="rounded-md border bg-gray-50 p-3">
				{current.render()}
			</div>
		</div>
	);
}

