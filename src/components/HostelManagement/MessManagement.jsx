import React, { useState } from "react";
import { useCollection, addItem, setItem } from "../../utils/firestoreHooks";
import { FaUtensils, FaCalendarAlt, FaClipboardList, FaPlus, FaCheckCircle } from 'react-icons/fa';

const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const MessManagement = () => {
  const { data: menuDocs } = useCollection("hm_mess_menus");
  const menus = menuDocs.length ? menuDocs : weekdays.map(d => ({ id: d.toLowerCase(), day: d, breakfast: "", lunch: "", dinner: "" }));
  const { data: attendance } = useCollection("hm_mess_attendance", { orderByField: "date", orderDirection: "desc" });
  const [entry, setEntry] = useState({ student_id: "", date: new Date().toISOString().slice(0,10), meal: "breakfast" });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <FaUtensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mess Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Plan menus and track student mess attendance</p>
          </div>
        </div>
      </div>

      {/* Menu Planning Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaClipboardList className="w-5 h-5" />
            Menu Planning
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Day</th>
                  <th className="px-4 py-3 font-medium">Breakfast</th>
                  <th className="px-4 py-3 font-medium">Lunch</th>
                  <th className="px-4 py-3 font-medium">Dinner</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {menus.map((m, idx) => (
                  <tr key={m.day} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.day}</td>
                    <td className="px-4 py-3">
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        value={m.breakfast} 
                        onChange={async e=>{ 
                          await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, breakfast: e.target.value }, true); 
                        }} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        value={m.lunch} 
                        onChange={async e=>{ 
                          await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, lunch: e.target.value }, true); 
                        }} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        value={m.dinner} 
                        onChange={async e=>{ 
                          await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, dinner: e.target.value }, true); 
                        }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mess Attendance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaCheckCircle className="w-5 h-5" />
            Mess Attendance
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                placeholder="Student ID" 
                value={entry.student_id} 
                onChange={e=>setEntry(v=>({...v,student_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                type="date" 
                value={entry.date} 
                onChange={e=>setEntry(v=>({...v,date:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                value={entry.meal} 
                onChange={e=>setEntry(v=>({...v,meal:e.target.value}))}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                onClick={async () => {
                  await addItem("hm_mess_attendance", entry);
                  setEntry({ student_id: "", date: new Date().toISOString().slice(0,10), meal: "breakfast" });
                }}
              >
                <FaPlus className="w-4 h-4" />
                Mark
              </button>
            </div>
          </div>

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
                {attendance.length===0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No attendance marks yet.
                    </td>
                  </tr>
                )}
                {attendance.slice(-50).reverse().map(a => (
                  <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.date}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{a.student_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
                        {a.meal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Attendance</p>
                <p className="text-3xl font-bold mt-1">{attendance.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Menu Days</p>
                <p className="text-3xl font-bold mt-1">{menus.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FaClipboardList className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Date</p>
                <p className="text-lg font-bold mt-1">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessManagement;


