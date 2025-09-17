import React from 'react';
import { NavLink, Routes, Route, Outlet } from 'react-router-dom';
import { FaBus, FaUserTie, FaMapMarkerAlt, FaRoute, FaTasks, FaClock, FaIdBadge } from 'react-icons/fa';

const NavButton = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
  >
    <Icon />
    <span>{label}</span>
  </NavLink>
);

export default function TransportManagement() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <NavButton to="vehicles" icon={FaBus} label="Vehicles" />
        <NavButton to="drivers" icon={FaUserTie} label="Drivers" />
        <NavButton to="stops" icon={FaMapMarkerAlt} label="Stops" />
        <NavButton to="routes" icon={FaRoute} label="Routes" />
        <NavButton to="assignments" icon={FaTasks} label="Assignments" />
        <NavButton to="schedules" icon={FaClock} label="Schedules" />
        <NavButton to="passes" icon={FaIdBadge} label="Passes" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
        <Routes>
          <Route path="vehicles" element={<Outlet />} />
          <Route path="drivers" element={<Outlet />} />
          <Route path="stops" element={<Outlet />} />
          <Route path="routes/*" element={<Outlet />} />
          <Route path="assignments/*" element={<Outlet />} />
          <Route path="schedules" element={<Outlet />} />
          <Route path="passes" element={<Outlet />} />
        </Routes>
        <Outlet />
      </div>
    </div>
  );
}


