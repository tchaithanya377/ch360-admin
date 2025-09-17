import React, { useMemo, useState } from "react";
import { useCollection } from "../../utils/firestoreHooks";
import { FaChartBar, FaBed, FaBuilding, FaTicketAlt, FaCalendarAlt, FaUsers, FaClipboardList, FaUtensils } from 'react-icons/fa';

const useLocal = (k, i) => i;

const Card = ({ title, value, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

const HostelReports = () => {
  const { data: hostels } = useCollection("hm_hostels");
  const { data: rooms } = useCollection("hm_rooms");
  const { data: beds } = useCollection("hm_beds");
  const { data: allots } = useCollection("hm_allotments");
  const { data: mess } = useCollection("hm_mess_attendance");
  const { data: tickets } = useCollection("hm_maint_tickets");

  const occupancyRate = useMemo(() => {
    const totalBeds = beds.length;
    const occupied = beds.filter(b => b.status === 'occupied').length;
    return totalBeds ? Math.round((occupied/totalBeds)*100) + '%' : '0%';
  }, [beds]);

  const activeTickets = tickets.filter(t => t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <FaChartBar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Reports & Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of hostel operations and metrics</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Hostels" 
          value={hostels.length} 
          icon={FaBuilding} 
          color="blue"
        />
        <Card 
          title="Occupancy Rate" 
          value={occupancyRate} 
          icon={FaBed} 
          color="green"
        />
        <Card 
          title="Active Tickets" 
          value={activeTickets} 
          icon={FaTicketAlt} 
          color="orange"
        />
      </div>

      {/* Recent Allotments Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUsers className="w-5 h-5" />
            Recent Allotments
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {allots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No allotments found.
                    </td>
                  </tr>
                )}
                {allots.slice(-20).reverse().map(a => (
                  <tr key={a.allotment_id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.allot_date}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.student_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.room_id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : a.status === 'vacated'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mess Consumption Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUtensils className="w-5 h-5" />
            Mess Consumption (Last 30 Records)
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Meal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {mess.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaUtensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No mess attendance records found.
                    </td>
                  </tr>
                )}
                {mess.slice(-30).reverse().map(m => (
                  <tr key={m.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{m.date}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{m.student_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 capitalize">
                        {m.meal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaBed className="w-5 h-5" />
              Room Statistics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Total Rooms</span>
                <span className="font-semibold text-gray-900 dark:text-white">{rooms.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Total Beds</span>
                <span className="font-semibold text-gray-900 dark:text-white">{beds.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Vacant Beds</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {beds.filter(b => b.status === 'vacant').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Occupied Beds</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {beds.filter(b => b.status === 'occupied').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaTicketAlt className="w-5 h-5" />
              Maintenance Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Total Tickets</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tickets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Open Tickets</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {tickets.filter(t => t.status === 'open').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">In Progress</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Closed Tickets</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {tickets.filter(t => t.status === 'closed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelReports;


