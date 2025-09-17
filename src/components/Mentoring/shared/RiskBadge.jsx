import React from 'react';

export default function RiskBadge({ score = 0, className = '' }) {
  let color = 'bg-gray-200 text-gray-800';
  if (score >= 76) color = 'bg-red-100 text-red-700 border border-red-300';
  else if (score >= 51) color = 'bg-orange-100 text-orange-700 border border-orange-300';
  else if (score >= 26) color = 'bg-yellow-100 text-yellow-700 border border-yellow-300';
  else color = 'bg-green-100 text-green-700 border border-green-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color} ${className}`}>
      {Number.isFinite(score) ? score : 0}
    </span>
  );
}


