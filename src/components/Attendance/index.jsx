import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SessionsListPage from './SessionsListPage';
import SessionFormModal from './SessionFormModal';
import SessionDetailPage from './SessionDetailPage';

const AttendanceModule = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Routes>
        <Route path="/" element={<SessionsListPage />} />
        <Route path="/new" element={<SessionFormModal />} />
        <Route path=":id" element={<SessionDetailPage />} />
        <Route path=":id/edit" element={<SessionFormModal />} />
        <Route path="*" element={<Navigate to="/attendance" replace />} />
      </Routes>
    </div>
  );
};

export default AttendanceModule;


