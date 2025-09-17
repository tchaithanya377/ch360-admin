import React, { useMemo } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import FeeCategories from './pages/FeeCategories.jsx';
import FeeStructures from './pages/FeeStructures.jsx';
import StructureDetails from './pages/StructureDetails.jsx';
import StudentFees from './pages/StudentFees.jsx';
import Payments from './pages/Payments.jsx';
import Waivers from './pages/Waivers.jsx';
import Discounts from './pages/Discounts.jsx';
import Receipts from './pages/Receipts.jsx';

const TabLink = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`
    }
    end
  >
    {label}
  </NavLink>
);

export default function FeesManagement() {
  // Use absolute paths so clicking a tab doesn't keep appending the same segment
  const tabs = useMemo(() => ([
    { to: '/fees-management/categories', label: 'Categories' },
    { to: '/fees-management/structures', label: 'Structures' },
    { to: '/fees-management/structure-details', label: 'Structure Details' },
    { to: '/fees-management/student-fees', label: 'Student Fees' },
    { to: '/fees-management/payments', label: 'Payments' },
    { to: '/fees-management/waivers', label: 'Waivers' },
    { to: '/fees-management/discounts', label: 'Discounts' },
    { to: '/fees-management/receipts', label: 'Receipts' },
  ]), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => <TabLink key={t.to} to={t.to} label={t.label} />)}
      </div>

      <div className="bg-white rounded-md shadow p-4">
        <Routes>
          <Route path="categories" element={<FeeCategories />} />
          <Route path="structures" element={<FeeStructures />} />
          <Route path="structure-details" element={<StructureDetails />} />
          <Route path="student-fees" element={<StudentFees />} />
          <Route path="payments" element={<Payments />} />
          <Route path="waivers" element={<Waivers />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="*" element={<Navigate to="/fees-management/categories" replace />} />
        </Routes>
      </div>
    </div>
  );
}


