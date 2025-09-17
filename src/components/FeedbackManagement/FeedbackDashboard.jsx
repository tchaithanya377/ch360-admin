import React from "react";
import { Link } from "react-router-dom";

const cards = [
	{ title: "All Feedback", to: "/feedback/list", color: "purple", statKey: "total" },
	{ title: "Drafts", to: "/feedback/list?status=draft", color: "gray", statKey: "drafts" },
	{ title: "Active Surveys", to: "/feedback/list?type=survey&status=active", color: "green", statKey: "active" },
	{ title: "Settings", to: "/feedback/settings", color: "blue", statKey: "settings" }
];

export default function FeedbackDashboard() {
	return (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
				<h1 className="text-2xl font-bold text-gray-900">Feedback Administration</h1>
				<p className="text-gray-600 mt-1">Manage feedback items, surveys, and module settings.</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{cards.map((c) => (
					<Link key={c.title} to={c.to} className={`rounded-xl p-5 border hover:shadow-md transition-all bg-white border-${c.color}-100`}>
						<p className="text-sm text-gray-500">{c.title}</p>
						<p className={`mt-2 text-2xl font-semibold text-${c.color}-600`}>View</p>
					</Link>
				))}
			</div>

			<div className="bg-white rounded-xl border p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
					<div className="space-x-3">
						<Link to="/feedback/create" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Create Feedback</Link>
						<Link to="/feedback/list" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Browse</Link>
					</div>
				</div>
				<p className="text-sm text-gray-600">Use the list to search, filter, and bulk manage feedback.</p>
			</div>
		</div>
	);
}


