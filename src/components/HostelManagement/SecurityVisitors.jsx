import React, { useState } from "react";
import { useCollection, addItem, updateItem, runBatch } from "../../utils/firestoreHooks";
import { FaShieldAlt, FaUserFriends, FaExclamationTriangle, FaSignInAlt, FaSignOutAlt, FaPlus, FaClipboardList } from 'react-icons/fa';

const SecurityVisitors = () => {
  const { data: visitors } = useCollection("hm_visitors", { orderByField: "in_time", orderDirection: "desc" });
  const { data: incidents } = useCollection("hm_incidents", { orderByField: "timestamp", orderDirection: "desc" });
  const [entry, setEntry] = useState({ visitor_name: "", purpose: "", in_time: new Date().toISOString(), id_proof: "", host_student_id: "" });
  const [incident, setIncident] = useState({ title: "", description: "", severity: "low", timestamp: new Date().toISOString() });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
            <FaShieldAlt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Visitors</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage visitor logs and security incidents</p>
          </div>
        </div>
      </div>

      {/* Visitor Gate Log Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUserFriends className="w-5 h-5" />
            Visitor Gate Log
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Name" 
                value={entry.visitor_name} 
                onChange={e=>setEntry(v=>({...v,visitor_name:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Purpose" 
                value={entry.purpose} 
                onChange={e=>setEntry(v=>({...v,purpose:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host Student ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Host Student ID" 
                value={entry.host_student_id} 
                onChange={e=>setEntry(v=>({...v,host_student_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Proof</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="ID Proof" 
                value={entry.id_proof} 
                onChange={e=>setEntry(v=>({...v,id_proof:e.target.value}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => {
                  await runBatch([
                    { type: 'add', collection: 'hm_visitors', data: { ...entry, out_time: null } },
                    { type: 'add', collection: 'hm_audit', data: { entity: 'visitor', entity_id: entry.visitor_name, action: 'checkin', user_id: 'system', timestamp: new Date().toISOString(), notes: entry.host_student_id } }
                  ]);
                }}
              >
                <FaSignInAlt className="w-4 h-4" />
                Check-in
              </button>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => {
                  const open = visitors.find(v => !v.out_time);
                  if (open) await runBatch([
                    { type: 'update', collection: 'hm_visitors', id: open.id, data: { out_time: new Date().toISOString() } },
                    { type: 'add', collection: 'hm_audit', data: { entity: 'visitor', entity_id: open.id, action: 'checkout', user_id: 'system', timestamp: new Date().toISOString() } }
                  ]);
                }}
              >
                <FaSignOutAlt className="w-4 h-4" />
                Checkout last open
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">In</th>
                  <th className="px-4 py-3 font-medium">Out</th>
                  <th className="px-4 py-3 font-medium">Host</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {visitors.length===0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaUserFriends className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No visitors logged.
                    </td>
                  </tr>
                )}
                {visitors.slice(-50).reverse().map(v => (
                  <tr key={v.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{v.visitor_name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{v.purpose}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{v.in_time}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{v.out_time||'-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{v.host_student_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Incident Reporting Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Incident Reporting
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Title" 
                value={incident.title} 
                onChange={e=>setIncident(v=>({...v,title:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Description" 
                value={incident.description} 
                onChange={e=>setIncident(v=>({...v,description:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                value={incident.severity} 
                onChange={e=>setIncident(v=>({...v,severity:e.target.value}))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_incidents", incident)}
              >
                <FaPlus className="w-4 h-4" />
                Log
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {incidents.length===0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No incidents reported.
                    </td>
                  </tr>
                )}
                {incidents.slice(-50).reverse().map(i => (
                  <tr key={i.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{i.timestamp}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{i.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        i.severity==='high'
                          ?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          :i.severity==='medium'
                            ?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            :'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {i.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaUserFriends className="w-5 h-5" />
              Visitor Statistics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Total Visitors</span>
                <span className="font-semibold text-gray-900 dark:text-white">{visitors.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Currently Inside</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {visitors.filter(v => !v.out_time).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Checked Out</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {visitors.filter(v => v.out_time).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaExclamationTriangle className="w-5 h-5" />
              Incident Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Total Incidents</span>
                <span className="font-semibold text-gray-900 dark:text-white">{incidents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">High Severity</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {incidents.filter(i => i.severity === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Medium Severity</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {incidents.filter(i => i.severity === 'medium').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Low Severity</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {incidents.filter(i => i.severity === 'low').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityVisitors;


