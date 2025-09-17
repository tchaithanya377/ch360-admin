import React, { useEffect, useState } from 'react';
import { ExamsAPI } from '../../services/examsApiService';
import { FaCalendarAlt, FaClock, FaUserGraduate, FaClipboardList, FaSpinner } from 'react-icons/fa';

export default function ExamsDashboard() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [stats, setStats] = useState(null);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true); setError('');
			try {
				const data = await ExamsAPI.dashboardStats();
				if (mounted) setStats(data || {});
			} catch (e) {
				if (mounted) setError(e?.message || 'Failed to load dashboard');
			} finally { if (mounted) setLoading(false); }
		};
		load();
		return () => { mounted = false; };
	}, []);

	const Card = ({ title, value, Icon, accent }) => (
		<div className={`rounded-xl p-4 sm:p-5 shadow-sm border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-md transition`}> 
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
					<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value ?? '-'}</p>
				</div>
				<div className={`p-3 rounded-lg ${accent} bg-opacity-10 text-opacity-90` }>
					<Icon className={`text-xl`} />
				</div>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="p-6"><div className="flex items-center gap-3 text-gray-500 dark:text-gray-300"><FaSpinner className="animate-spin" /> Loading exams dashboard…</div></div>
		);
	}

	if (error) {
		return (
			<div className="p-6"><div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-4">{error}</div></div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Exams Dashboard</h1>
				<p className="text-gray-500 dark:text-gray-400">Overview of sessions, schedules, registrations and activity.</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				<Card title="Total Sessions" value={stats?.total_sessions} Icon={FaCalendarAlt} accent="text-indigo-600 bg-indigo-600" />
				<Card title="Active Sessions" value={stats?.active_sessions} Icon={FaClipboardList} accent="text-emerald-600 bg-emerald-600" />
				<Card title="Total Schedules" value={stats?.total_schedules} Icon={FaClock} accent="text-sky-600 bg-sky-600" />
				<Card title="Total Students" value={stats?.total_students} Icon={FaUserGraduate} accent="text-fuchsia-600 bg-fuchsia-600" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="rounded-xl p-5 shadow-sm border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
					<h2 className="font-medium text-gray-900 dark:text-white">Today</h2>
					<div className="mt-3 grid grid-cols-2 gap-3 text-sm">
						<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Exams</span><div className="text-lg font-semibold">{stats?.today_exams ?? '-'}</div></div>
						<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Ongoing</span><div className="text-lg font-semibold">{stats?.ongoing_exams ?? '-'}</div></div>
					</div>
				</div>
				<div className="rounded-xl p-5 shadow-sm border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
					<h2 className="font-medium text-gray-900 dark:text-white">Pending</h2>
					<div className="mt-3 grid grid-cols-2 gap-3 text-sm">
						<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Registrations</span><div className="text-lg font-semibold">{stats?.pending_registrations ?? '-'}</div></div>
						<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Overdue Dues</span><div className="text-lg font-semibold">{stats?.overdue_dues ?? '-'}</div></div>
					</div>
				</div>
			</div>

			<div className="rounded-xl p-5 shadow-sm border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
				<h2 className="font-medium text-gray-900 dark:text-white">Recent Activity</h2>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
					<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Registrations Today</span><div className="text-lg font-semibold">{stats?.registrations_today ?? '-'}</div></div>
					<div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-gray-500">Hall Tickets Generated</span><div className="text-lg font-semibold">{stats?.hall_tickets_generated ?? '-'}</div></div>
				</div>
			</div>
		</div>
	);
}
