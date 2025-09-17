import React, { useState } from "react";

export default function FeedbackSettings() {
	const [settings, setSettings] = useState({
		enableSurveys: true,
		requireApproval: true,
		allowAnonymous: false,
	});

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold text-gray-900">Feedback Settings</h1>
			<div className="bg-white rounded-lg border p-4 space-y-4">
				<label className="flex items-center justify-between">
					<span className="text-gray-700">Enable Surveys</span>
					<input type="checkbox" checked={settings.enableSurveys} onChange={(e) => setSettings({ ...settings, enableSurveys: e.target.checked })} />
				</label>
				<label className="flex items-center justify-between">
					<span className="text-gray-700">Require Approval</span>
					<input type="checkbox" checked={settings.requireApproval} onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })} />
				</label>
				<label className="flex items-center justify-between">
					<span className="text-gray-700">Allow Anonymous</span>
					<input type="checkbox" checked={settings.allowAnonymous} onChange={(e) => setSettings({ ...settings, allowAnonymous: e.target.checked })} />
				</label>
			</div>
			<p className="text-sm text-gray-500">Note: Wire these to backend config endpoint if available.</p>
		</div>
	);
}


