import React, { useMemo, useState } from "react";
import { useCollection, addItem, updateItem, runBatch } from "../../utils/firestoreHooks";
import { Notice, Spinner } from "./SharedUI.jsx";
import { FaUsers, FaBed, FaCalendarAlt, FaCheckCircle, FaTimes, FaPlus, FaCog, FaDownload } from 'react-icons/fa';

const Allotment = () => {
  const { data: hostels } = useCollection("hm_hostels");
  const { data: blocks } = useCollection("hm_blocks");
  const { data: rooms } = useCollection("hm_rooms");
  const { data: beds } = useCollection("hm_beds");
  const { data: wait, loading: loadingWait, error: errorWait } = useCollection("hm_waitlist", { orderByField: "priority_rank" });
  const { data: allots } = useCollection("hm_allotments");

  const [app, setApp] = useState({ student_id: "", roll_no: "", gender: "", preferences: { hostel_id: "", room_type: "" }, priority_rank: 0 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  const vacantBeds = useMemo(() => beds.filter(b => b.status === 'vacant'), [beds]);

  const autoAllot = async () => {
    // Sort by explicit priority then by applied_on
    const sorted = [...wait].sort((a,b) => (a.priority_rank||999) - (b.priority_rank||999));
    const ops = [];
    for (const w of sorted) {
      const preferredRooms = rooms.filter(r => (!w.preferences?.room_type || r.room_type === w.preferences.room_type));
      const preferredBeds = beds.filter(b => preferredRooms.some(r => r.id === b.room_id) && b.status === 'vacant');
      if (preferredBeds.length) {
        const seat = preferredBeds[0];
        ops.push({ type: 'add', collection: 'hm_allotments', data: { student_id: w.student_id, bed_id: seat.id, room_id: seat.room_id, status: 'active', allot_date: new Date().toISOString(), allotment_reason: 'auto' } });
        ops.push({ type: 'update', collection: 'hm_beds', id: seat.id, data: { status: 'occupied' } });
        ops.push({ type: 'update', collection: 'hm_waitlist', id: w.id, data: { fulfilled: true } });
        ops.push({ type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: w.student_id, action: 'auto_allot', user_id: 'system', timestamp: new Date().toISOString(), notes: `Seat ${seat.id}` } });
      }
    }
    if (ops.length) await runBatch(ops);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <FaUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Room Allotment Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage student applications, waiting lists, and room assignments</p>
          </div>
        </div>
      </div>

      {/* Applications / Waiting List Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaCalendarAlt className="w-5 h-5" />
            Applications / Waiting List
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Student ID" 
                value={app.student_id} 
                onChange={e=>setApp(v=>({...v,student_id:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll No</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Roll No" 
                value={app.roll_no} 
                onChange={e=>setApp(v=>({...v,roll_no:e.target.value}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                value={app.preferences.room_type} 
                onChange={e=>setApp(v=>({...v,preferences:{...v.preferences,room_type:e.target.value}}))}
              >
                <option value="">Any Type</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority Rank</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                type="number" 
                placeholder="Priority Rank" 
                value={app.priority_rank} 
                onChange={e=>setApp(v=>({...v,priority_rank:Number(e.target.value)}))} 
              />
            </div>
            <div className="flex items-end">
              <button 
                disabled={busy} 
                className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  busy 
                    ? 'bg-orange-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl'
                }`} 
                onClick={async () => {
                  try { 
                    setBusy(true);
                    await addItem("hm_waitlist", { ...app, applied_on: new Date().toISOString() });
                    setApp({ student_id: "", roll_no: "", gender: "", preferences: { hostel_id: "", room_type: "" }, priority_rank: 0 });
                    setNotice({ type: 'success', message: 'Application added to waiting list' });
                  } catch(e) { 
                    setNotice({ type: 'error', message: e.message || 'Failed to add application' }); 
                  } finally { 
                    setBusy(false); 
                  }
                }}
              >
                {busy ? <Spinner /> : <FaPlus className="w-4 h-4" />}
                {busy ? 'Adding...' : 'Add to Waiting'}
              </button>
            </div>
          </div>

          <Notice type={notice.type} message={notice.message} onClose={()=>setNotice({type:'',message:''})} />
          
          {loadingWait && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Spinner /> Loading waiting list…
            </div>
          )}
          {errorWait && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400">{String(errorWait)}</div>
          )}

          <div className="mt-6 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Roll</th>
                  <th className="px-4 py-3 font-medium">Pref Type</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {wait.length===0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaCalendarAlt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No applications yet.
                    </td>
                  </tr>
                )}
                {wait.map(w => (
                  <tr key={w.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{w.student_id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{w.roll_no}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{w.preferences?.room_type || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {w.priority_rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2" 
              onClick={autoAllot}
            >
              <FaCog className="w-4 h-4" />
              Run Auto-Allotment
            </button>
          </div>
        </div>
      </div>

      {/* Active Allotments Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaBed className="w-5 h-5" />
            Active Allotments
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Bed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {allots.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      <FaBed className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No active allotments.
                    </td>
                  </tr>
                )}
                {allots.map(a => {
                  const bed = beds.find(b=>b.id===a.bed_id);
                  const room = rooms.find(r=>r.id===bed?.room_id);
                  return (
                    <tr key={a.allotment_id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{a.student_id}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{room?.room_no || '-'}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{bed?.bed_no || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status==='active'
                            ?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            :a.status==='vacated'
                              ?'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                              :'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 flex items-center gap-1" 
                          onClick={async () => {
                            await runBatch([
                              { type: 'update', collection: 'hm_allotments', id: a.id, data: { status: 'vacated', vacate_date: new Date().toISOString() } },
                              { type: 'update', collection: 'hm_beds', id: a.bed_id, data: { status: 'vacant' } },
                              { type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: a.id, action: 'vacate', user_id: 'system', timestamp: new Date().toISOString(), notes: `Bed ${a.bed_id}` } }
                            ]);
                          }}
                        >
                          <FaTimes className="w-3 h-3" />
                          Vacate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allotment;


