import React, { useMemo, useState } from "react";
import { useCollection } from "../../utils/firestoreHooks";
import { createHostel, createBlock, createRoom, createBed, createFee } from "../../utils/hostelService";
import { Notice, Spinner, Field, TextInput, NumberInput, Select, TextArea } from "./SharedUI.jsx";
import { FaBuilding, FaLayerGroup, FaDoorOpen, FaBed, FaMoneyBillWave, FaPlus, FaCog, FaClipboardList } from 'react-icons/fa';

const Section = ({ title, children, actions, subtitle, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-white" />}
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-indigo-100 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Firestore collections used:
// hm_hostels, hm_blocks, hm_rooms, hm_beds, hm_fees

const SetupMaster = () => {
  const { data: hostels, loading: loadingHostels, error: errorHostels } = useCollection("hm_hostels", { orderByField: "name" });
  const { data: blocks } = useCollection("hm_blocks", { orderByField: "name" });
  const { data: rooms } = useCollection("hm_rooms", { orderByField: "room_no" });
  const { data: beds } = useCollection("hm_beds", { orderByField: "bed_no" });
  const { data: fees } = useCollection("hm_fees", { orderByField: "room_type" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  const [newHostel, setNewHostel] = useState({ name: "", address: "", type: "boys", capacity: 0, warden_id: "", contact_no: "" });
  const [newBlock, setNewBlock] = useState({ hostel_id: "", name: "", floors: 1, notes: "" });
  const [newRoom, setNewRoom] = useState({ block_id: "", room_no: "", room_type: "double", floor: 1, rent_per_sem: 0, deposit_amount: 0, status: "vacant" });
  const [newBed, setNewBed] = useState({ room_id: "", bed_no: "A", seat_code: "", status: "vacant" });
  const [newFee, setNewFee] = useState({ hostel_id: "", room_type: "double", cycle: "sem", amount: 0, refundable_deposit_flag: true });
  const [filters, setFilters] = useState({ hostel: '', block: '', roomType: '' });

  const blockOptions = useMemo(() => blocks.filter(b => hostels.some(h => h.id === b.hostel_id)), [blocks, hostels]);
  const roomOptions = useMemo(() => rooms.filter(r => blockOptions.some(b => b.id === r.block_id)), [rooms, blockOptions]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <FaCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Setup Master</h2>
            <p className="text-gray-600 dark:text-gray-400">Configure hostels, blocks, rooms, beds, and fee structures</p>
          </div>
        </div>
      </div>

      <Section 
        title="Hostels" 
        subtitle="Basic details and contacts" 
        icon={FaBuilding}
        actions={
          <button 
            disabled={saving} 
            className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 ${
              saving 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl'
            }`} 
            onClick={async () => {
              try {
                setSaving(true);
                await createHostel(newHostel);
                setNewHostel({ name: "", address: "", type: "boys", capacity: 0, warden_id: "", contact_no: "" });
                setNotice({ type: 'success', message: 'Hostel added successfully' });
              } catch (e) {
                setNotice({ type: 'error', message: e.message || 'Failed to add hostel' });
              } finally { 
                setSaving(false); 
              }
            }}
          >
            {saving ? <Spinner /> : <FaPlus className="w-4 h-4" />}
            {saving ? 'Adding...' : 'Add'}
          </button>
        }
      >
        <Notice type={notice.type} message={notice.message} onClose={()=>setNotice({type:'',message:''})} />
        {loadingHostels && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Spinner /> Loading hostels…
          </div>
        )}
        {errorHostels && (
          <div className="mt-4 text-sm text-red-600 dark:text-red-400">{String(errorHostels)}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Field label="Name" required>
            <TextInput 
              placeholder="Name" 
              value={newHostel.name} 
              onChange={e=>setNewHostel(v=>({...v,name:e.target.value}))} 
            />
          </Field>
          <Field label="Address" required>
            <TextInput 
              placeholder="Address" 
              value={newHostel.address} 
              onChange={e=>setNewHostel(v=>({...v,address:e.target.value}))} 
            />
          </Field>
          <Field label="Type">
            <Select 
              value={newHostel.type} 
              onChange={e=>setNewHostel(v=>({...v,type:e.target.value}))}
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="mixed">Mixed</option>
            </Select>
          </Field>
          <Field label="Capacity" required>
            <NumberInput 
              placeholder="Capacity" 
              value={newHostel.capacity} 
              onChange={e=>setNewHostel(v=>({...v,capacity:Number(e.target.value)}))} 
            />
          </Field>
          <Field label="Warden ID">
            <TextInput 
              placeholder="Warden ID" 
              value={newHostel.warden_id} 
              onChange={e=>setNewHostel(v=>({...v,warden_id:e.target.value}))} 
            />
          </Field>
          <Field label="Contact No">
            <TextInput 
              placeholder="Contact No" 
              value={newHostel.contact_no} 
              onChange={e=>setNewHostel(v=>({...v,contact_no:e.target.value}))} 
            />
          </Field>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Warden</th>
                <th className="px-4 py-3 font-medium">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {hostels.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    <FaBuilding className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No hostels added yet.
                  </td>
                </tr>
              )}
              {hostels.map(h => (
                <tr key={h.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{h.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {h.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{h.capacity}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{h.warden_id}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{h.contact_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section 
        title="Blocks / Wings" 
        subtitle="Organize buildings and floors" 
        icon={FaLayerGroup}
        actions={
          <button 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2" 
            onClick={async () => {
              await createBlock(newBlock);
              setNewBlock({ hostel_id: "", name: "", floors: 1, notes: "" });
            }}
          >
            <FaPlus className="w-4 h-4" />
            Add
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Field label="Hostel" required>
            <Select 
              value={newBlock.hostel_id} 
              onChange={e=>setNewBlock(v=>({...v,hostel_id:e.target.value}))}
            >
              <option value="">Select Hostel</option>
              {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </Select>
          </Field>
          <Field label="Block Name" required>
            <TextInput 
              placeholder="Block Name" 
              value={newBlock.name} 
              onChange={e=>setNewBlock(v=>({...v,name:e.target.value}))} 
            />
          </Field>
          <Field label="Floors" required>
            <NumberInput 
              placeholder="Floors" 
              value={newBlock.floors} 
              onChange={e=>setNewBlock(v=>({...v,floors:Number(e.target.value)}))} 
            />
          </Field>
          <Field label="Notes">
            <TextInput 
              placeholder="Notes" 
              value={newBlock.notes} 
              onChange={e=>setNewBlock(v=>({...v,notes:e.target.value}))} 
            />
          </Field>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Hostel</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Floors</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    <FaLayerGroup className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No blocks added yet.
                  </td>
                </tr>
              )}
              {blocks.map(b => (
                <tr key={b.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {hostels.find(h=>h.id===b.hostel_id)?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.name}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.floors}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section 
        title="Rooms" 
        subtitle="Configure room types, rent and status" 
        icon={FaDoorOpen}
        actions={
          <button 
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2" 
            onClick={async () => {
              await createRoom(newRoom);
              setNewRoom({ block_id: "", room_no: "", room_type: "double", floor: 1, rent_per_sem: 0, deposit_amount: 0, status: "vacant" });
            }}
          >
            <FaPlus className="w-4 h-4" />
            Add
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
          <Field label="Block" required>
            <Select 
              value={newRoom.block_id} 
              onChange={e=>setNewRoom(v=>({...v,block_id:e.target.value}))}
            >
              <option value="">Select Block</option>
              {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Room No" required>
            <TextInput 
              placeholder="Room No" 
              value={newRoom.room_no} 
              onChange={e=>setNewRoom(v=>({...v,room_no:e.target.value}))} 
            />
          </Field>
          <Field label="Type">
            <Select 
              value={newRoom.room_type} 
              onChange={e=>setNewRoom(v=>({...v,room_type:e.target.value}))}
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </Select>
          </Field>
          <Field label="Floor" required>
            <NumberInput 
              placeholder="Floor" 
              value={newRoom.floor} 
              onChange={e=>setNewRoom(v=>({...v,floor:Number(e.target.value)}))} 
            />
          </Field>
          <Field label="Rent/Sem" required>
            <NumberInput 
              placeholder="Rent/Sem" 
              value={newRoom.rent_per_sem} 
              onChange={e=>setNewRoom(v=>({...v,rent_per_sem:Number(e.target.value)}))} 
            />
          </Field>
          <Field label="Deposit" required>
            <NumberInput 
              placeholder="Deposit" 
              value={newRoom.deposit_amount} 
              onChange={e=>setNewRoom(v=>({...v,deposit_amount:Number(e.target.value)}))} 
            />
          </Field>
          <Field label="Status">
            <Select 
              value={newRoom.status} 
              onChange={e=>setNewRoom(v=>({...v,status:e.target.value}))}
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="blocked">Blocked</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </Field>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              value={filters.roomType} 
              onChange={e=>setFilters(v=>({...v,roomType:e.target.value}))}
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </select>
            <input 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder="Search room no" 
              value={filters.roomSearch||''} 
              onChange={e=>setFilters(v=>({...v,roomSearch:e.target.value}))} 
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Block</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Floor</th>
                <th className="px-4 py-3 font-medium">Rent</th>
                <th className="px-4 py-3 font-medium">Deposit</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    <FaDoorOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No rooms configured.
                  </td>
                </tr>
              )}
              {rooms.filter(r => (!filters.roomType || r.room_type===filters.roomType) && (!filters.roomSearch || (r.room_no||'').toLowerCase().includes(filters.roomSearch.toLowerCase()))).map(r => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {blocks.find(b=>b.id===r.block_id)?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{r.room_no}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{r.room_type}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{r.floor}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{r.rent_per_sem}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{r.deposit_amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status==='vacant'
                        ?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        :r.status==='occupied'
                          ?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          :r.status==='blocked'
                            ?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            :'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section 
        title="Beds / Seats" 
        subtitle="Bed-level tracking" 
        icon={FaBed}
        actions={
          <button 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2" 
            onClick={async () => {
              await createBed(newBed);
              setNewBed({ room_id: "", bed_no: "A", seat_code: "", status: "vacant" });
            }}
          >
            <FaPlus className="w-4 h-4" />
            Add
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Field label="Room" required>
            <Select 
              value={newBed.room_id} 
              onChange={e=>setNewBed(v=>({...v,room_id:e.target.value}))}
            >
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
            </Select>
          </Field>
          <Field label="Bed No" required>
            <TextInput 
              placeholder="Bed No" 
              value={newBed.bed_no} 
              onChange={e=>setNewBed(v=>({...v,bed_no:e.target.value}))} 
            />
          </Field>
          <Field label="Seat Code">
            <TextInput 
              placeholder="Seat Code" 
              value={newBed.seat_code} 
              onChange={e=>setNewBed(v=>({...v,seat_code:e.target.value}))} 
            />
          </Field>
          <Field label="Status">
            <Select 
              value={newBed.status} 
              onChange={e=>setNewBed(v=>({...v,status:e.target.value}))}
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="blocked">Blocked</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </Field>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Bed</th>
                <th className="px-4 py-3 font-medium">Seat Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {beds.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    <FaBed className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No beds added.
                  </td>
                </tr>
              )}
              {beds.map(b => (
                <tr key={b.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {rooms.find(r=>r.id===b.room_id)?.room_no || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.bed_no}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.seat_code}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status==='vacant'
                        ?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        :b.status==='occupied'
                          ?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          :b.status==='blocked'
                            ?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            :'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section 
        title="Hostel Fees" 
        subtitle="Pricing per room type and cycle" 
        icon={FaMoneyBillWave}
        actions={
          <button 
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2" 
            onClick={async () => {
              await createFee(newFee);
              setNewFee({ hostel_id: "", room_type: "double", cycle: "sem", amount: 0, refundable_deposit_flag: true });
            }}
          >
            <FaPlus className="w-4 h-4" />
            Add
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Field label="Hostel" required>
            <Select 
              value={newFee.hostel_id} 
              onChange={e=>setNewFee(v=>({...v,hostel_id:e.target.value}))}
            >
              <option value="">Select Hostel</option>
              {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </Select>
          </Field>
          <Field label="Room Type">
            <Select 
              value={newFee.room_type} 
              onChange={e=>setNewFee(v=>({...v,room_type:e.target.value}))}
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </Select>
          </Field>
          <Field label="Cycle">
            <Select 
              value={newFee.cycle} 
              onChange={e=>setNewFee(v=>({...v,cycle:e.target.value}))}
            >
              <option value="sem">Semester</option>
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
            </Select>
          </Field>
          <Field label="Amount" required>
            <NumberInput 
              placeholder="Amount" 
              value={newFee.amount} 
              onChange={e=>setNewFee(v=>({...v,amount:Number(e.target.value)}))} 
            />
          </Field>
          <Field label=" ">
            <label className="inline-flex items-center gap-2 mt-6">
              <input 
                type="checkbox" 
                checked={newFee.refundable_deposit_flag} 
                onChange={e=>setNewFee(v=>({...v,refundable_deposit_flag:e.target.checked}))}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Refundable deposit</span>
            </label>
          </Field>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Hostel</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Cycle</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Refundable</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {fees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    <FaMoneyBillWave className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No fees configured.
                  </td>
                </tr>
              )}
              {fees.map(f => (
                <tr key={f.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {hostels.find(h=>h.id===f.hostel_id)?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{f.room_type}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{f.cycle}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{f.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.refundable_deposit_flag
                        ?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        :'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {f.refundable_deposit_flag ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default SetupMaster;


