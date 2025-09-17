import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FeedbackApi } from "../../services/apiRegistry";

export default function FeedbackForm({ mode = "create" }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const [values, setValues] = useState({ title: "", description: "", status: "draft" });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (mode === "edit" && id) {
			FeedbackApi.retrieve(id).then((res) => setValues({ title: res.title || "", description: res.description || "", status: res.status || "draft" })).catch((e) => setError(e.message));
		}
	}, [mode, id]);

	const onSubmit = async (stay) => {
		setSaving(true);
		setError("");
		try {
			if (mode === "edit") await FeedbackApi.partialUpdate(id, values);
			else await FeedbackApi.create(values);
			if (stay) return;
			navigate("/feedback/list");
		} catch (e) {
			setError(e.message || "Save failed");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold text-gray-900">{mode === "edit" ? "Edit" : "Create"} Feedback</h1>
			{error && <div className="p-3 rounded border border-red-200 text-red-700 bg-red-50">{error}</div>}
			<div className="bg-white rounded-lg border p-4 space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea rows={4} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
						<option value="draft">Draft</option>
						<option value="submitted">Submitted</option>
						<option value="reviewed">Reviewed</option>
					</select>
				</div>
			</div>
			<div className="flex items-center space-x-3">
				<button disabled={saving} onClick={() => onSubmit(false)} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">Save</button>
				<button disabled={saving} onClick={() => onSubmit(true)} className="px-4 py-2 rounded-lg border">Save & Continue</button>
				<button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">Cancel</button>
			</div>
		</div>
	);
}


