// import { addItem, updateItem, runBatch } from "./firestoreHooks"; // TODO: Implement hostel API service

// Basic validation helpers
const required = (obj, fields) => {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      throw new Error(`Missing required field: ${f}`);
    }
  }
};

export const createHostel = async (payload) => {
  required(payload, ['name', 'type', 'capacity']);
  return addItem('hm_hostels', { ...payload });
};

export const createBlock = async (payload) => {
  required(payload, ['hostel_id', 'name']);
  return addItem('hm_blocks', { ...payload });
};

export const createRoom = async (payload) => {
  required(payload, ['block_id', 'room_no', 'room_type']);
  return addItem('hm_rooms', { ...payload });
};

export const createBed = async (payload) => {
  required(payload, ['room_id', 'bed_no']);
  return addItem('hm_beds', { ...payload, status: payload.status || 'vacant' });
};

export const createFee = async (payload) => {
  required(payload, ['hostel_id', 'room_type', 'cycle', 'amount']);
  return addItem('hm_fees', { ...payload });
};

export const addToWaitlist = async (payload) => {
  required(payload, ['student_id']);
  return addItem('hm_waitlist', { ...payload, applied_on: new Date().toISOString(), fulfilled: false });
};

export const allotSeatBatch = async (candidate, seat) => {
  // candidate: waitlist doc; seat: bed doc
  const ops = [
    { type: 'add', collection: 'hm_allotments', data: { student_id: candidate.student_id, bed_id: seat.id, room_id: seat.room_id, status: 'active', allot_date: new Date().toISOString(), allotment_reason: 'auto' } },
    { type: 'update', collection: 'hm_beds', id: seat.id, data: { status: 'occupied' } },
    { type: 'update', collection: 'hm_waitlist', id: candidate.id, data: { fulfilled: true } },
    { type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: candidate.student_id, action: 'auto_allot', timestamp: new Date().toISOString(), notes: `Seat ${seat.id}` } },
  ];
  await runBatch(ops);
};

export const vacateSeatBatch = async (allotment) => {
  const ops = [
    { type: 'update', collection: 'hm_allotments', id: allotment.id, data: { status: 'vacated', vacate_date: new Date().toISOString() } },
    { type: 'update', collection: 'hm_beds', id: allotment.bed_id, data: { status: 'vacant' } },
    { type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: allotment.id, action: 'vacate', timestamp: new Date().toISOString(), notes: `Bed ${allotment.bed_id}` } },
  ];
  await runBatch(ops);
};


