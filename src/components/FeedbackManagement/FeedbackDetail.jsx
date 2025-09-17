import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FeedbackApi } from "../../services/apiRegistry";

export default function FeedbackDetail() {
	const { id } = useParams();
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	useEffect(() => {
		FeedbackApi.retrieve(id).then(setData).catch((e) => setError(e.message));
	}, [id]);
	if (error) return <div className="p-4 text-red-600">{error}</div>;
	if (!data) return <div className="p-4 text-gray-600">Loading...</div>;
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-900">Feedback #{data.id}</h1>
				<Link to={`/feedback/${id}/edit`} className="px-3 py-2 rounded-lg border">Edit</Link>
			</div>
			<div className="bg-white rounded-lg border p-4 space-y-2">
				<p className="text-sm text-gray-500">Title</p>
				<p className="text-gray-900">{data.title || '-'}</p>
				<p className="text-sm text-gray-500">Status</p>
				<p className="text-gray-900">{data.status || '-'}</p>
				<p className="text-sm text-gray-500">Owner</p>
				<p className="text-gray-900">{data.owner_name || data.owner || '-'}</p>
				<p className="text-sm text-gray-500">Created</p>
				<p className="text-gray-900">{data.created_at || '-'}</p>
			</div>
			<div className="bg-white rounded-lg border p-4">
				<h2 className="text-lg font-semibold text-gray-900 mb-2">Activity</h2>
				<p className="text-sm text-gray-600">Audit trail not yet implemented. Recommend backend endpoint /audit/feedback/{id}/.</p>
			</div>
		</div>
	);
}


