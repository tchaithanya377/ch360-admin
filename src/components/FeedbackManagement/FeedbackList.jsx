import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FeedbackApi } from "../../services/apiRegistry";
import { adaptPagination } from "../../utils/paginationAdapter";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function FeedbackList() {
	const navigate = useNavigate();
	const query = useQuery();
	const [data, setData] = useState({ count: 0, results: [] });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const page = Number(query.get("page") || 1);
	const pageSize = Number(query.get("page_size") || 10);
	const search = query.get("search") || "";
	const ordering = query.get("ordering") || "-created_at";
	const status = query.get("status") || "";

	const params = useMemo(() => ({ page, page_size: pageSize, search, ordering, status }), [page, pageSize, search, ordering, status]);

	useEffect(() => {
		let mounted = true;
		const fetchData = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await FeedbackApi.list(params);
				const normalized = adaptPagination(res);
				if (mounted) {
					setData({ count: typeof normalized.count === "number" ? normalized.count : normalized.items.length, results: Array.isArray(normalized.items) ? normalized.items : [] });
				}
			} catch (e) {
				setError(e.message || "Failed to load feedback");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
		return () => { mounted = false; };
	}, [params]);

	const setQuery = (next) => {
		const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize), search, ordering, status, ...next });
		navigate({ pathname: "/feedback/list", search: `?${qs.toString()}` });
	};

    return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900">Feedback</h1>
				<Link to="/feedback/create" className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Create</Link>
			</div>

			<div className="bg-white rounded-lg border p-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					<input value={search} onChange={(e) => setQuery({ search: e.target.value, page: 1 })} placeholder="Search..." className="px-3 py-2 border rounded-lg" />
					<select value={status} onChange={(e) => setQuery({ status: e.target.value, page: 1 })} className="px-3 py-2 border rounded-lg">
						<option value="">All Status</option>
						<option value="draft">Draft</option>
						<option value="submitted">Submitted</option>
						<option value="reviewed">Reviewed</option>
					</select>
					<select value={ordering} onChange={(e) => setQuery({ ordering: e.target.value })} className="px-3 py-2 border rounded-lg">
						<option value="-created_at">Newest</option>
						<option value="created_at">Oldest</option>
						<option value="title">Title A-Z</option>
						<option value="-title">Title Z-A</option>
					</select>
					<select value={pageSize} onChange={(e) => setQuery({ page_size: Number(e.target.value), page: 1 })} className="px-3 py-2 border rounded-lg">
						{[10,20,50].map(n => (<option key={n} value={n}>{n} / page</option>))}
					</select>
				</div>
			</div>

            <div className="bg-white rounded-lg border">
                {loading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
				) : error ? (
                    <div className="p-6">
                        <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
                        <button onClick={() => setQuery({})} className="px-3 py-1 rounded border">Retry</button>
                    </div>
				) : data.results.length === 0 ? (
					<div className="p-6 text-gray-600">No results</div>
				) : (
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{data.results.map((row) => (
								<tr key={row.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 text-sm text-gray-700">{row.id}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.title || row.name || '-'}</td>
									<td className="px-4 py-2 text-sm">
										<span className={`px-2 py-1 rounded-full text-xs ${row.status === 'draft' ? 'bg-gray-100 text-gray-700' : row.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{row.status || 'n/a'}</span>
									</td>
									<td className="px-4 py-2 text-sm text-gray-700">{row.owner_name || row.owner || '-'}</td>
									<td className="px-4 py-2 text-right text-sm">
										<Link to={`/feedback/${row.id}`} className="text-purple-600 hover:text-purple-800 mr-3">View</Link>
										<Link to={`/feedback/${row.id}/edit`} className="text-gray-700 hover:text-gray-900">Edit</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<div className="flex items-center justify-between text-sm text-gray-600">
				<p>Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, data.count)} of {data.count}</p>
				<div className="space-x-2">
					<button disabled={page<=1} onClick={() => setQuery({ page: page - 1 })} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
					<button disabled={page*pageSize>=data.count} onClick={() => setQuery({ page: page + 1 })} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
				</div>
			</div>
		</div>
	);
}


