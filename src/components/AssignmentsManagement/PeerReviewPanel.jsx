import React from 'react';

const PeerReviewPanel = ({ reviews, onAssign, onSubmitReview, isAssigning, isSubmitting }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAssign} disabled={isAssigning} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Assign Peer Reviews</button>
      </div>
      <div className="space-y-2">
        {(reviews || []).map((r) => (
          <div key={r.id} className="p-3 border rounded">
            <div className="text-sm text-gray-700">Reviewee: {r.reviewee}</div>
            <textarea className="w-full mt-2 p-2 border rounded" placeholder="Comments" defaultValue={r.comments || ''} onBlur={(e)=> onSubmitReview({ ...r, comments: e.target.value })} disabled={isSubmitting} />
          </div>
        ))}
        {(!reviews || reviews.length===0) && <div className="text-sm text-gray-500">No peer reviews yet.</div>}
      </div>
    </div>
  );
};

export default PeerReviewPanel;


