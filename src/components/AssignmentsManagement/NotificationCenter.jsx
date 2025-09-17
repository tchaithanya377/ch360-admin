import React from 'react';

const NotificationCenter = ({ notifications, onMarkRead, isUpdating }) => {
  return (
    <div className="space-y-2">
      {(notifications || []).map((n) => (
        <div key={n.id} className={`p-3 border rounded ${n.is_read ? 'opacity-70' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{n.title}</div>
              <div className="text-xs text-gray-600">{n.message}</div>
            </div>
            {!n.is_read && (
              <button onClick={() => onMarkRead(n.id)} disabled={isUpdating} className="text-xs px-2 py-1 bg-gray-700 text-white rounded">Mark read</button>
            )}
          </div>
        </div>
      ))}
      {(!notifications || notifications.length===0) && <div className="text-sm text-gray-500">No notifications.</div>}
    </div>
  );
};

export default NotificationCenter;


