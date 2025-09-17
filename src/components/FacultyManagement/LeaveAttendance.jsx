import React, { useState, useEffect } from "react";
import facultyApiService from '../../services/facultyApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheckCircle,
  faTimes,
  faClock,
  faPlus,
  faEdit,
  faEye,
  faDownload,
  faUserClock,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";

const LeaveAttendance = () => {
  const [activeTab, setActiveTab] = useState("leave-applications");
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [leaveForm, setLeaveForm] = useState({
    faculty: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'PENDING',
    approved_by: '',
    approved_at_date: '',
    approved_at_time: '',
    rejection_reason: ''
  });
  // Use display labels exactly as backend expects for choices
  // Choices will be [{ value, label }]
  const [leaveTypeChoices, setLeaveTypeChoices] = useState([
    { value: 'Casual Leave', label: 'Casual Leave' },
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Annual Leave', label: 'Annual Leave' },
    { value: 'Maternity Leave', label: 'Maternity Leave' },
    { value: 'Paternity Leave', label: 'Paternity Leave' },
    { value: 'Study Leave', label: 'Study Leave' },
    { value: 'Other', label: 'Other' }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const leaves = await facultyApiService.getLeaves();
        const list = Array.isArray(leaves) ? leaves : (Array.isArray(leaves?.results) ? leaves.results : []);
        const mapped = list.map(l => ({
          id: l.id,
          faculty: l.faculty,
          facultyName: l.faculty_name || l.faculty || '—',
          leaveType: l.leave_type || '—',
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.leave_days || 0,
          reason: l.reason || '',
          status: (l.status || 'PENDING').toUpperCase()
        }));
        setLeaveApplications(mapped);
        // load minimal faculty list
        try {
          const res = await facultyApiService.getFaculty({ page_size: 100 });
          const flist = Array.isArray(res) ? res : (Array.isArray(res?.results) ? res.results : []);
          setFacultyList(flist.map(f => ({ id: f.id, name: f.name || `${f.first_name || ''} ${f.last_name || ''}`.trim() || f.email })));
        } catch {}
        // Load choices for leave_type if backend advertises OPTIONS
        try {
          const opts = await facultyApiService.getLeavesOptions();
          const choiceList = opts?.actions?.POST?.leave_type?.choices || [];
          const mappedChoices = choiceList.map(c => ({
            value: c.value,
            label: c.display_name || c.display || c.value
          })).filter(ch => ch.value);
          if (mappedChoices.length) setLeaveTypeChoices(mappedChoices);
        } catch {}
      } catch (e) {
        console.error('Failed to load leaves:', e);
      }
    };
    load();
  }, []);

  const tabs = [
    { id: "leave-applications", name: "Leave Applications", icon: faCalendarAlt, count: leaveApplications.length },
    { id: "calendar", name: "Calendar", icon: faClock, count: leaveApplications.length },
    { id: "leave-balances", name: "Leave Balances", icon: faClock, count: leaveBalances.length },
    { id: "attendance", name: "Attendance", icon: faCheckCircle, count: attendance.length }
  ];

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-11
  const monthStart = new Date(calYear, calMonth, 1);
  const monthEnd = new Date(calYear, calMonth + 1, 0);
  const startDay = monthStart.getDay(); // 0 Sun
  const daysInMonth = monthEnd.getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const changeMonth = (delta) => {
    const d = new Date(calYear, calMonth + delta, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };

  // Build a quick lookup for leave ranges by date string YYYY-MM-DD
  const leaveByDate = (() => {
    const map = new Map();
    const toKey = (d) => d.toISOString().slice(0,10);
    leaveApplications.forEach(l => {
      if (!l.startDate || !l.endDate) return;
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const k = toKey(d);
        const arr = map.get(k) || [];
        arr.push(l);
        map.set(k, arr);
      }
    });
    return map;
  })();

  const resetForm = () => {
    setLeaveForm({
      faculty: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'PENDING',
      approved_by: '',
      approved_at_date: '',
      approved_at_time: '',
      rejection_reason: ''
    });
    setFormError('');
    setFieldErrors({});
  };

  const renderErr = (key) => {
    const val = fieldErrors?.[key];
    if (!val) return null;
    const msg = Array.isArray(val) ? val.join(' ') : String(val);
    return <p className="text-xs text-red-600 mt-1">{msg}</p>;
  };

  const createLeave = async () => {
    try {
      setSaving(true); setFormError(''); setFieldErrors({});
      const toDate = (v) => (v && /\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0,10) : null);
      const approvedAt = () => {
        const d = leaveForm.approved_at_date; const t = leaveForm.approved_at_time || '00:00';
        return d ? `${d}T${t}:00Z` : null;
      };
      const payload = {
        faculty: leaveForm.faculty || null,
        leave_type: leaveForm.leave_type,
        start_date: toDate(leaveForm.start_date),
        end_date: toDate(leaveForm.end_date),
        reason: leaveForm.reason,
        status: leaveForm.status,
        approved_by: leaveForm.approved_by || null,
        approved_at: approvedAt(),
        rejection_reason: leaveForm.rejection_reason || ''
      };
      const missing = ['faculty','leave_type','start_date','end_date','status'].filter(k => !payload[k]);
      if (missing.length) {
        setFormError(`Please fill required fields: ${missing.join(', ')}`);
        setSaving(false);
        return;
      }
      const created = await facultyApiService.createLeave(payload);
      setLeaveApplications(prev => [{
        id: created.id,
        faculty: created.faculty,
        facultyName: created.faculty_name || facultyList.find(f=>f.id===created.faculty)?.name || '—',
        leaveType: created.leave_type,
        startDate: created.start_date,
        endDate: created.end_date,
        days: created.leave_days || 0,
        reason: created.reason,
        status: (created.status || 'PENDING').toUpperCase()
      }, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (err) {
      if (err?.data && typeof err.data === 'object') {
        setFieldErrors(err.data);
        const first = Object.values(err.data)[0];
        setFormError(Array.isArray(first) ? first.join(' ') : String(first));
      } else {
        setFormError(err?.message || 'Failed to create leave');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    const resolveFacultyName = (application) => {
      const fallback = application.facultyName || application.faculty || '—';
      const found = facultyList.find(f => String(f.id) === String(application.faculty));
      return found?.name || fallback;
    };
    const shortDate = (s) => {
      if (!s) return '';
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return s;
      return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
    };
    switch (activeTab) {
      case "leave-applications":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Leave Applications</h3>
              <button
                onClick={() => {
                  setModalType("leave-application");
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Apply Leave
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resolveFacultyName(application)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {String(application.leaveType || '').replace(/_/g,' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shortDate(application.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shortDate(application.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === "Approved" ? "bg-green-100 text-green-800" :
                          application.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          application.status === "Rejected" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "leave-balances":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leave Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveBalances.map((balance) => (
                <div key={balance.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{balance.facultyName}</h4>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {balance.department}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Casual Leave:</strong> {balance.casualLeave} days</p>
                    <p><strong>Earned Leave:</strong> {balance.earnedLeave} days</p>
                    <p><strong>Sick Leave:</strong> {balance.sickLeave} days</p>
                    <p><strong>Maternity Leave:</strong> {balance.maternityLeave} days</p>
                    <p><strong>Total Available:</strong> {balance.totalAvailable} days</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(balance.totalAvailable / balance.totalEntitled) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {balance.totalAvailable} of {balance.totalEntitled} days used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Calendar View</h3>
              <div className="flex items-center space-x-2">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 border rounded">Prev</button>
                <div className="text-sm font-medium">{new Date(calYear, calMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="px-3 py-1 border rounded">Next</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (<div key={d} className="text-center">{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDay }).map((_,i) => (
                <div key={`p-${i}`} className="p-2 h-24 rounded border bg-gray-50 text-gray-400">
                  <div className="text-xs">{prevMonthDays - startDay + 1 + i}</div>
                </div>
              ))}
              {Array.from({ length: daysInMonth }).map((_,i) => {
                const day = i + 1;
                const date = new Date(calYear, calMonth, day);
                const key = date.toISOString().slice(0,10);
                const items = leaveByDate.get(key) || [];
                const isToday = today.toDateString() === date.toDateString();
                return (
                  <div key={`d-${day}`} className={`p-2 h-24 rounded border overflow-hidden ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="text-xs font-semibold">{day}</div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16 pr-1">
                      {items.slice(0,3).map((l,idx) => (
                        <div key={idx} className={`text-[10px] px-1 py-0.5 rounded ${l.status==='APPROVED'?'bg-green-100 text-green-700': l.status==='REJECTED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-800'}`} title={`${resolveFacultyName(l)}: ${l.leaveType} (${l.startDate} → ${l.endDate})`}>
                          {(resolveFacultyName(l) || 'Leave').split(' ')[0]} - {l.leaveType} ({shortDate(l.startDate)} → {shortDate(l.endDate)})
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-[10px] text-gray-500">+{items.length-3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Attendance Management</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.checkIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.checkOut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.status === "Present" ? "bg-green-100 text-green-800" :
                          entry.status === "Absent" ? "bg-red-100 text-red-800" :
                          entry.status === "Late" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave & Attendance</h2>
          <p className="text-gray-600">Apply, review, and visualize leaves and attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setModalType('leave-application'); resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Leave
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg border ${activeTab==='calendar'?'bg-gray-100':''}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
      {showModal && modalType === 'leave-application' && (
        <div>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={()=>setShowModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e)=>e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Add faculty leave</h3>
                <button onClick={()=>setShowModal(false)} className="p-2 text-gray-500 hover:text-gray-700">×</button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && <div className="px-3 py-2 bg-red-100 text-red-700 rounded">{formError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Faculty</label>
                    <select className="w-full border rounded px-3 py-2" value={leaveForm.faculty} onChange={e=>setLeaveForm({...leaveForm, faculty: e.target.value})}>
                      <option value="">---------</option>
                      {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    {renderErr('faculty')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Leave type</label>
                    <select className="w-full border rounded px-3 py-2" value={leaveForm.leave_type} onChange={e=>setLeaveForm({...leaveForm, leave_type: e.target.value})}>
                      <option value="">---------</option>
                      {leaveTypeChoices.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {renderErr('leave_type')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={leaveForm.start_date} onChange={e=>setLeaveForm({...leaveForm, start_date: e.target.value})} />
                    <p className="text-xs text-gray-500">Note: You are 5.5 hours ahead of server time.</p>
                    {renderErr('start_date')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={leaveForm.end_date} onChange={e=>setLeaveForm({...leaveForm, end_date: e.target.value})} />
                    <p className="text-xs text-gray-500">Note: You are 5.5 hours ahead of server time.</p>
                    {renderErr('end_date')}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <textarea className="w-full border rounded px-3 py-2" value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full border rounded px-3 py-2" value={leaveForm.status} onChange={e=>setLeaveForm({...leaveForm, status: e.target.value})}>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Approved by</label>
                    <select className="w-full border rounded px-3 py-2" value={leaveForm.approved_by} onChange={e=>setLeaveForm({...leaveForm, approved_by: e.target.value})}>
                      <option value="">---------</option>
                      {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Approved at - Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" value={leaveForm.approved_at_date} onChange={e=>setLeaveForm({...leaveForm, approved_at_date: e.target.value})} />
                    <p className="text-xs text-gray-500">Note: You are 5.5 hours ahead of server time.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Approved at - Time</label>
                    <input type="time" className="w-full border rounded px-3 py-2" value={leaveForm.approved_at_time} onChange={e=>setLeaveForm({...leaveForm, approved_at_time: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Rejection reason</label>
                    <textarea className="w-full border rounded px-3 py-2" value={leaveForm.rejection_reason} onChange={e=>setLeaveForm({...leaveForm, rejection_reason: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 p-4 border-t">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded">Close</button>
                <button onClick={createLeave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAttendance;
