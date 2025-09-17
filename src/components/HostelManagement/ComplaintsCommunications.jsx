import React, { useState } from "react";
import { useCollection, addItem } from "../../utils/firestoreHooks";
import { FaExclamationTriangle, FaBullhorn, FaPlus, FaTools, FaUtensils, FaShieldAlt, FaBroom } from 'react-icons/fa';

const ComplaintsCommunications = () => {
  const { data: complaints } = useCollection("hm_complaints", { orderByField: "created_at", orderDirection: "desc" });
  const { data: notices } = useCollection("hm_notices", { orderByField: "created_at", orderDirection: "desc" });
  const [c, setC] = useState({ student_id: "", type: "maintenance", description: "", priority: "medium", status: "open", assigned_to: "" });
  const [n, setN] = useState({ title: "", level: "hostel", message: "" });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return <FaTools className="w-4 h-4" />;
      case 'mess': return <FaUtensils className="w-4 h-4" />;
      case 'security': return <FaShieldAlt className="w-4 h-4" />;
      case 'cleaning': return <FaBroom className="w-4 h-4" />;
      default: return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints & Communications</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage student complaints, requests, and hostel notices</p>
          </div>
        </div>
      </div>

      {/* Complaints / Requests Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Complaints / Requests
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Student ID" 
                value={c.student_id} 
                onChange={e=>setC(v=>({...v,student_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                value={c.type} 
                onChange={e=>setC(v=>({...v,type:e.target.value}))}
              >
                <option value="maintenance">Maintenance</option>
                <option value="mess">Mess</option>
                <option value="security">Security</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                placeholder="Description" 
                value={c.description} 
                onChange={e=>setC(v=>({...v,description:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                value={c.priority} 
                onChange={e=>setC(v=>({...v,priority:e.target.value}))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_complaints", { created_at: new Date().toISOString(), ...c })}
              >
                <FaPlus className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {complaints.length===0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No complaints submitted.
                    </td>
                  </tr>
                )}
                {complaints.slice(-50).reverse().map(x => (
                  <tr key={x.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{x.created_at}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{x.student_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(x.type)}
                        <span className="text-gray-900 dark:text-white">{x.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        x.priority==='high'
                          ?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          :x.priority==='medium'
                            ?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            :'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {x.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{x.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Noticeboard Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaBullhorn className="w-5 h-5" />
            Noticeboard
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Title" 
                value={n.title} 
                onChange={e=>setN(v=>({...v,title:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={n.level} 
                onChange={e=>setN(v=>({...v,level:e.target.value}))}
              >
                <option value="hostel">Hostel</option>
                <option value="block">Block</option>
                <option value="floor">Floor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Message" 
                value={n.message} 
                onChange={e=>setN(v=>({...v,message:e.target.value}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => await addItem("hm_notices", { created_at: new Date().toISOString(), ...n })}
              >
                <FaPlus className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {notices.length===0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaBullhorn className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No notices published.
                    </td>
                  </tr>
                )}
                {notices.slice(-50).reverse().map(x => (
                  <tr key={x.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{x.created_at}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{x.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                        {x.level}
                      </span>
                    </td>
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

export default ComplaintsCommunications;


