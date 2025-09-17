import React, { useState } from "react";
import { useCollection, addItem } from "../../utils/firestoreHooks";
import { FaTools, FaBoxes, FaBroom, FaPlus, FaTicketAlt, FaBuilding, FaClipboardList } from 'react-icons/fa';

const MaintenanceHousekeeping = () => {
  const { data: tickets } = useCollection("hm_maint_tickets", { orderByField: "raised_date", orderDirection: "desc" });
  const { data: assets } = useCollection("hm_assets");
  const { data: schedules } = useCollection("hm_housekeeping");

  const [newTicket, setNewTicket] = useState({ hostel_id: "", block_id: "", room_id: "", issue_type: "plumbing", raised_by: "", assigned_vendor: "", cost: 0, status: "open" });
  const [newAsset, setNewAsset] = useState({ hostel_id: "", item_type: "bed", qty: 1, purchase_date: "", warranty: "", condition: "good" });
  const [newSchedule, setNewSchedule] = useState({ hostel_id: "", block_id: "", floor: 0, janitor_id: "", schedule: "Daily 7AM", status: "active" });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
            <FaTools className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance & Housekeeping</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage maintenance tickets, inventory, and cleaning schedules</p>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaTicketAlt className="w-5 h-5" />
            Maintenance Tickets
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Hostel ID" 
                value={newTicket.hostel_id} 
                onChange={e=>setNewTicket(v=>({...v,hostel_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Block ID" 
                value={newTicket.block_id} 
                onChange={e=>setNewTicket(v=>({...v,block_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Room ID" 
                value={newTicket.room_id} 
                onChange={e=>setNewTicket(v=>({...v,room_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Issue Type" 
                value={newTicket.issue_type} 
                onChange={e=>setNewTicket(v=>({...v,issue_type:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raised By</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Raised By" 
                value={newTicket.raised_by} 
                onChange={e=>setNewTicket(v=>({...v,raised_by:e.target.value}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_maint_tickets", { ...newTicket, raised_date: new Date().toISOString() })}
              >
                <FaPlus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {tickets.length===0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaTicketAlt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No tickets yet.
                    </td>
                  </tr>
                )}
                {tickets.map(t => (
                  <tr key={t.ticket_id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{t.ticket_id.slice(0,8)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{t.issue_type}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{t.assigned_vendor||'-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{t.cost}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status==='open'
                          ?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          :t.status==='closed'
                            ?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            :'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory / Assets Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaBoxes className="w-5 h-5" />
            Inventory / Assets
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Hostel ID" 
                value={newAsset.hostel_id} 
                onChange={e=>setNewAsset(v=>({...v,hostel_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Type</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Item Type" 
                value={newAsset.item_type} 
                onChange={e=>setNewAsset(v=>({...v,item_type:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                type="number" 
                placeholder="Qty" 
                value={newAsset.qty} 
                onChange={e=>setNewAsset(v=>({...v,qty:Number(e.target.value)}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                type="date" 
                placeholder="Purchase" 
                value={newAsset.purchase_date} 
                onChange={e=>setNewAsset(v=>({...v,purchase_date:e.target.value}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_assets", newAsset)}
              >
                <FaPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Hostel</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Purchase</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {assets.length===0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaBoxes className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No assets recorded.
                    </td>
                  </tr>
                )}
                {assets.map(a => (
                  <tr key={a.asset_id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.hostel_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.item_type}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.qty}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.purchase_date}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Housekeeping Schedule Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaBroom className="w-5 h-5" />
            Housekeeping Schedule
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                placeholder="Hostel ID" 
                value={newSchedule.hostel_id} 
                onChange={e=>setNewSchedule(v=>({...v,hostel_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                placeholder="Block ID" 
                value={newSchedule.block_id} 
                onChange={e=>setNewSchedule(v=>({...v,block_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                type="number" 
                placeholder="Floor" 
                value={newSchedule.floor} 
                onChange={e=>setNewSchedule(v=>({...v,floor:Number(e.target.value)}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Janitor ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                placeholder="Janitor ID" 
                value={newSchedule.janitor_id} 
                onChange={e=>setNewSchedule(v=>({...v,janitor_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                placeholder="Schedule" 
                value={newSchedule.schedule} 
                onChange={e=>setNewSchedule(v=>({...v,schedule:e.target.value}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_housekeeping", newSchedule)}
              >
                <FaPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Hostel</th>
                  <th className="px-4 py-3 font-medium">Block</th>
                  <th className="px-4 py-3 font-medium">Floor</th>
                  <th className="px-4 py-3 font-medium">Janitor</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {schedules.length===0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaBroom className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No schedules added.
                    </td>
                  </tr>
                )}
                {schedules.map(s => (
                  <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.hostel_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.block_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.floor}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.janitor_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.schedule}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHousekeeping;


