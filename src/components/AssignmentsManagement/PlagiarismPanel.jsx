import React from 'react';

const statusColor = (s)=> s==='PASSED' ? 'text-green-600' : s==='FAILED' ? 'text-red-600' : 'text-gray-600';

const PlagiarismPanel = ({ checks, threshold, onRunForSubmission, onTriggerForAssignment, isRunning }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">Threshold: <span className="font-semibold">{threshold}%</span></div>
        <button onClick={onTriggerForAssignment} disabled={isRunning} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Trigger Check (All)</button>
      </div>
      <div className="space-y-2">
        {(checks || []).map((c) => (
          <div key={c.id} className="p-3 border rounded flex items-center justify-between">
            <div className="text-sm">Submission: {c.submission || c.assignment}</div>
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${statusColor(c.status)}`}>Similarity: {c.similarity_percent}%</div>
              {c.submission && (
                <button onClick={() => onRunForSubmission(c.submission)} disabled={isRunning} className="px-2 py-1 text-xs bg-gray-700 text-white rounded">Run</button>
              )}
            </div>
          </div>
        ))}
        {(!checks || checks.length===0) && <div className="text-sm text-gray-500">No checks yet.</div>}
      </div>
    </div>
  );
};

export default PlagiarismPanel;


