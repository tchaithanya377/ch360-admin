import React, { useMemo, useState } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import SetupMaster from "./HostelManagement/SetupMaster.jsx";
import Allotment from "./HostelManagement/Allotment.jsx";
import MessManagement from "./HostelManagement/MessManagement.jsx";
import MaintenanceHousekeeping from "./HostelManagement/MaintenanceHousekeeping.jsx";
import SecurityVisitors from "./HostelManagement/SecurityVisitors.jsx";
import ComplaintsCommunications from "./HostelManagement/ComplaintsCommunications.jsx";
import HostelReports from "./HostelManagement/HostelReports.jsx";
import HostelPolicy from "./HostelManagement/HostelPolicy.jsx";
// TODO: Implement hostel API service
// import { useCollection } from "../utils/firestoreHooks";
import { Spinner } from "./HostelManagement/SharedUI.jsx";

const tabs = [
  { name: "Overview", path: "overview" },
  { name: "Setup", path: "setup" },
  { name: "Allotment", path: "allotment" },
  { name: "Mess", path: "mess" },
  { name: "Maintenance", path: "maintenance" },
  { name: "Security", path: "security" },
  { name: "Complaints", path: "complaints" },
  { name: "Reports", path: "reports" },
  { name: "Policy", path: "policy" },
];

const Overview = () => {
  const { data: hostels, loading: l1 } = useCollection("hm_hostels");
  const { data: beds, loading: l2 } = useCollection("hm_beds");
  const { data: allots, loading: l3 } = useCollection("hm_allotments");
  const { data: wait, loading: l4 } = useCollection("hm_waitlist");
  const { data: tickets, loading: l5 } = useCollection("hm_maint_tickets");
  const { data: mess, loading: l6 } = useCollection("hm_mess_attendance");

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const occupancyRate = totalBeds ? Math.round((occupiedBeds/totalBeds)*100) : 0;
  const activeTickets = tickets.filter(t => t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>

      {(l1||l2||l3||l4) && <div className="text-sm text-gray-500 flex items-center gap-2"><Spinner /> Loading metrics…</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase tracking-wide text-gray-500">Hostels</div>
          <div className="text-3xl font-extrabold mt-1">{hostels.length}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">Occupancy</div>
            <div className="text-xs text-gray-500">{occupiedBeds}/{totalBeds}</div>
          </div>
          <div className="text-3xl font-extrabold mt-1">{occupancyRate}%</div>
          <div className="mt-2 h-2 w-full bg-gray-100 rounded">
            <div className="h-2 bg-orange-600 rounded" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase tracking-wide text-gray-500">Waiting List</div>
          <div className="text-3xl font-extrabold mt-1">{wait.length}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs uppercase tracking-wide text-gray-500">Open Tickets</div>
          <div className="text-3xl font-extrabold mt-1">{activeTickets}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Recent Allotments</h3>
            <Link to="/hostel-management/allotment" className="text-sm text-orange-600">View all</Link>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Student</th><th className="px-2 py-2">Bed</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Date</th></tr></thead>
              <tbody>
                {allots.slice(-8).reverse().map(a => (
                  <tr key={a.id || a.allotment_id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2">{a.student_id}</td>
                    <td className="px-2 py-2">{a.bed_id}</td>
                    <td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${a.status==='active'?'bg-green-100 text-green-700':a.status==='vacated'?'bg-gray-100 text-gray-700':'bg-yellow-100 text-yellow-700'}`}>{a.status}</span></td>
                    <td className="px-2 py-2">{a.allot_date?.slice(0,10)}</td>
                  </tr>
                ))}
                {allots.length===0 && (<tr><td colSpan={4} className="text-center text-gray-400 py-6">No allotments yet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <Link to="/hostel-management/setup" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Add Hostel/Rooms</Link>
            <Link to="/hostel-management/allotment" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Add to Waiting List</Link>
            <Link to="/hostel-management/mess" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Update Mess Menu</Link>
            <Link to="/hostel-management/maintenance" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Create Maintenance Ticket</Link>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-100 text-sm text-orange-800">
            <div className="font-medium mb-1">Getting started</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a hostel, blocks and rooms in Setup</li>
              <li>Add beds for rooms</li>
              <li>Add students to Waiting List and run Auto-Allot</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Today’s Mess Attendance</h3>
          <Link to="/hostel-management/mess" className="text-sm text-orange-600">Manage</Link>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Student</th><th className="px-2 py-2">Meal</th><th className="px-2 py-2">Date</th></tr></thead>
            <tbody>
              {mess.slice(-8).reverse().map(m => (
                <tr key={m.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{m.student_id}</td><td className="px-2 py-2 capitalize">{m.meal}</td><td className="px-2 py-2">{m.date}</td></tr>
              ))}
              {mess.length===0 && (<tr><td colSpan={3} className="text-center text-gray-400 py-6">No attendance yet today.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics with simple SVG charts (no external deps) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Last 14 Days Mess Activity</h3>
          </div>
          <MessSparkline data={mess} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Occupied Beds by Room Type</h3>
          </div>
          <OccupancyBars beds={beds} allots={allots} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Bed Status Distribution</h3>
          </div>
          <BedStatusDonut beds={beds} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Waiting List by Priority</h3>
          </div>
          <WaitingPriorityBars wait={wait} />
        </div>
      </div>
    </div>
  );
};

// --- Lightweight Charts ---
const MessSparkline = ({ data }) => {
  const today = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const counts = days.map(key => data.filter(m => (m.date || '').slice(0,10) === key).length);
  const max = Math.max(1, ...counts);
  const width = 320, height = 80, pad = 8;
  const step = (width - pad * 2) / (counts.length - 1 || 1);
  const points = counts.map((c, i) => {
    const x = pad + i * step;
    const y = height - pad - (c / max) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="min-w-[320px]">
        <polyline fill="none" stroke="#ea580c" strokeWidth="2" points={points} />
        {counts.map((c, i) => (
          <circle key={i} cx={pad + i * step} cy={height - pad - (c / max) * (height - pad * 2)} r="2" fill="#ea580c" />
        ))}
      </svg>
      <div className="mt-2 text-xs text-gray-500">Total: {counts.reduce((a,b)=>a+b,0)} marks in 14 days</div>
    </div>
  );
};

const OccupancyBars = ({ beds }) => {
  const inferType = (b) => b.room_type || (b.seat_code?.includes('S') ? 'single' : b.seat_code?.includes('D') ? 'double' : 'unknown');
  const groups = {};
  beds.forEach(b => {
    const t = inferType(b);
    if (!groups[t]) groups[t] = { total: 0, occ: 0 };
    groups[t].total += 1;
    if (b.status === 'occupied') groups[t].occ += 1;
  });
  const entries = Object.entries(groups).filter(([t]) => t !== 'unknown');
  if (entries.length === 0) return <div className="text-sm text-gray-500">No bed data available.</div>;
  return (
    <div className="space-y-2">
      {entries.map(([t, v]) => {
        const pct = v.total ? Math.round((v.occ / v.total) * 100) : 0;
        return (
          <div key={t} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="capitalize">{t}</span>
              <span>{v.occ}/{v.total} ({pct}%)</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded">
              <div className="h-2 bg-orange-600 rounded" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BedStatusDonut = ({ beds }) => {
  const counts = {
    occupied: beds.filter(b=>b.status==='occupied').length,
    vacant: beds.filter(b=>b.status==='vacant').length,
    blocked: beds.filter(b=>b.status==='blocked').length,
    maintenance: beds.filter(b=>b.status==='maintenance').length,
  };
  const total = Object.values(counts).reduce((a,b)=>a+b,0) || 1;
  const size = 140, stroke = 16, radius = (size - stroke) / 2, cx = size/2, cy = size/2;
  const circ = 2 * Math.PI * radius;
  const segments = [
    { key: 'occupied', color: '#16a34a' },
    { key: 'vacant', color: '#ea580c' },
    { key: 'blocked', color: '#ca8a04' },
    { key: 'maintenance', color: '#6b7280' },
  ];
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {segments.map(seg => {
          const val = counts[seg.key];
          const frac = val/total;
          const len = circ * frac;
          const dasharray = `${len} ${circ - len}`;
          const node = (
            <circle key={seg.key} cx={cx} cy={cy} r={radius} fill="none" stroke={seg.color} strokeWidth={stroke} strokeDasharray={dasharray} strokeDashoffset={-offset} />
          );
          offset += len;
          return node;
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-gray-700 text-sm">{total}</text>
      </svg>
      <div className="text-xs text-gray-600 space-y-1">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded" style={{ background: seg.color }} />
            <span className="capitalize">{seg.key}</span>
            <span className="ml-1 text-gray-500">{counts[seg.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WaitingPriorityBars = ({ wait }) => {
  if (!wait.length) return <div className="text-sm text-gray-500">No waiting list data.</div>;
  // Group by priority (1 is highest). Bucket others as 5+.
  const buckets = { 1:0, 2:0, 3:0, 4:0, '5+':0 };
  wait.forEach(w => {
    const p = Number(w.priority_rank) || 999;
    if (p<=1) buckets[1]++; else if (p<=2) buckets[2]++; else if (p<=3) buckets[3]++; else if (p<=4) buckets[4]++; else buckets['5+']++;
  });
  const entries = Object.entries(buckets);
  const max = Math.max(1, ...entries.map(([,v])=>v));
  return (
    <div className="flex items-end gap-3 h-40">
      {entries.map(([label, val]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div className="w-10 bg-orange-200 rounded" style={{ height: `${(val/max)*100}%` }} />
          <div className="text-xs text-gray-600">{label}</div>
          <div className="text-[10px] text-gray-500">{val}</div>
        </div>
      ))}
    </div>
  );
};
const HostelManagement = () => {
  const location = useLocation();
  const [_, setRefresh] = useState(0);

  const base = "/hostel-management";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hostel Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage hostels, allotments, mess, maintenance, security, and more.</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-500 shadow-sm"
          onClick={() => setRefresh(v => v + 1)}
        >
          Refresh
        </button>
      </div>

      <div className="sticky top-0 z-10 bg-gray-100 pt-1 -mt-1">
        <nav className="flex flex-wrap gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-200" aria-label="Tabs">
          {tabs.map((t) => {
            const to = `${base}/${t.path}`;
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={t.path}
                to={to}
                className={`${active ? "bg-orange-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
              >
                {t.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-2">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="setup" element={<SetupMaster />} />
          <Route path="allotment" element={<Allotment />} />
          <Route path="mess" element={<MessManagement />} />
          <Route path="maintenance" element={<MaintenanceHousekeeping />} />
          <Route path="security" element={<SecurityVisitors />} />
          <Route path="complaints" element={<ComplaintsCommunications />} />
          <Route path="reports" element={<HostelReports />} />
          <Route path="policy" element={<HostelPolicy />} />
        </Routes>
      </div>
    </div>
  );
};

export default HostelManagement;


