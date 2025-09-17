import React from 'react';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className="font-semibold text-gray-800 dark:text-gray-100">{value}</span>
  </div>
);

const AnalyticsDashboard = ({ analytics }) => {
  if (!analytics) {
    return <div className="text-sm text-gray-500">No analytics available.</div>;
  }
  const a = analytics;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded bg-white dark:bg-gray-800">
        <h4 className="font-semibold mb-2">Submission Metrics</h4>
        <Row label="Submission rate" value={`${a.submission_rate ?? '-'}%`} />
        <Row label="On-time rate" value={`${a.on_time_rate ?? '-'}%`} />
        <Row label="Late rate" value={`${a.late_rate ?? '-'}%`} />
        <Row label="Plagiarism rate" value={`${a.plagiarism_rate ?? '-'}%`} />
      </div>
      <div className="p-4 border rounded bg-white dark:bg-gray-800">
        <h4 className="font-semibold mb-2">Outcomes</h4>
        <Row label="Outcome achievement" value={`${a.outcome_achievement ?? '-'}%`} />
        <div className="mt-2 text-xs text-gray-500">Grade distribution and time series can be charted later.</div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


