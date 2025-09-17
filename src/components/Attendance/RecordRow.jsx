import React, { useEffect, useState } from 'react';
const STATUS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const RecordRow = ({ record, disabled, onChange }) => {
  const [local, setLocal] = useState(record);
  useEffect(() => { setLocal(record); }, [record]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <tr>
      <td className="px-4 py-2 text-sm">{local.full_name || local.student_name || local.student}</td>
      <td className="px-4 py-2">
        <select value={local.status || 'PRESENT'} onChange={(e) => update({ status: e.target.value })} disabled={disabled} className="w-full px-2 py-1.5 rounded-md border">
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <input type="datetime-local" value={local.check_in_time ? local.check_in_time.replace('Z','') : ''} onChange={(e) => update({ check_in_time: e.target.value ? new Date(e.target.value).toISOString() : null })} disabled={disabled} className="w-full px-2 py-1.5 rounded-md border" />
      </td>
      <td className="px-4 py-2">
        <input value={local.remarks || ''} onChange={(e) => update({ remarks: e.target.value })} disabled={disabled} className="w-full px-2 py-1.5 rounded-md border" placeholder="Remarks" />
      </td>
    </tr>
  );
};

export default RecordRow;


