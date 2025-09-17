import React, { useState } from "react";
import { useSingletonDoc, setItem } from "../../utils/firestoreHooks";
import { FaShieldAlt, FaCheckCircle, FaSave, FaClipboardList, FaDoorOpen, FaDoorClosed, FaCalendarAlt, FaFireExtinguisher } from 'react-icons/fa';

const HostelPolicy = () => {
  const { data } = useSingletonDoc("hm_meta", "policy");
  const [policy, setPolicy] = useState(data || { checkin_rules: "", checkout_rules: "", leave_workflow: "", anti_ragging: false, fire_safety_checked: false });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <FaShieldAlt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Policy & Compliance</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage hostel policies, rules, and compliance requirements</p>
          </div>
        </div>
      </div>

      {/* Policy & Compliance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaClipboardList className="w-5 h-5" />
            Policy & Compliance
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaDoorOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                Check-in Rules
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                rows={4} 
                placeholder="Check-in Rules" 
                value={policy.checkin_rules} 
                onChange={async e=>{ 
                  const val = e.target.value; 
                  setPolicy(v=>({...v,checkin_rules:val})); 
                  await setItem("hm_meta", "policy", { checkin_rules: val }, true); 
                }} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaDoorClosed className="w-4 h-4 text-red-600 dark:text-red-400" />
                Check-out Rules
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                rows={4} 
                placeholder="Check-out Rules" 
                value={policy.checkout_rules} 
                onChange={async e=>{ 
                  const val = e.target.value; 
                  setPolicy(v=>({...v,checkout_rules:val})); 
                  await setItem("hm_meta", "policy", { checkout_rules: val }, true); 
                }} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Leave & Permission Workflow
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                rows={4} 
                placeholder="Leave & Permission Workflow" 
                value={policy.leave_workflow} 
                onChange={async e=>{ 
                  const val = e.target.value; 
                  setPolicy(v=>({...v,leave_workflow:val})); 
                  await setItem("hm_meta", "policy", { leave_workflow: val }, true); 
                }} 
              />
            </div>
          </div>

          {/* Compliance Checkboxes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={policy.anti_ragging} 
                  onChange={async e=>{ 
                    const val = e.target.checked; 
                    setPolicy(v=>({...v,anti_ragging:val})); 
                    await setItem("hm_meta", "policy", { anti_ragging: val }, true); 
                  }}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Anti-ragging affidavit collected</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                Confirms that all students have submitted anti-ragging affidavits
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={policy.fire_safety_checked} 
                  onChange={async e=>{ 
                    const val = e.target.checked; 
                    setPolicy(v=>({...v,fire_safety_checked:val})); 
                    await setItem("hm_meta", "policy", { fire_safety_checked: val }, true); 
                  }}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <FaFireExtinguisher className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fire safety checks completed</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                Confirms that all fire safety equipment and protocols are in place
              </p>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">Compliance Status</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${policy.anti_ragging ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Anti-ragging: {policy.anti_ragging ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${policy.fire_safety_checked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Fire Safety: {policy.fire_safety_checked ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelPolicy;


