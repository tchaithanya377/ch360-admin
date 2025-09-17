import React, { useState } from 'react';
import { AutoAssignApi } from '../../services/mentoringApi';

export default function AdminMentoringAutoAssign() {
  const [form, setForm] = useState({
    department_id: '', academic_year: '', grade_level: '', section: '', start_date: '', max_mentees_per_mentor: 20
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError(null); setResult(null);
      const resp = await AutoAssignApi.run({
        department_id: form.department_id || undefined,
        academic_year: form.academic_year || undefined,
        grade_level: form.grade_level || undefined,
        section: form.section || undefined,
        start_date: form.start_date || undefined,
        max_mentees_per_mentor: form.max_mentees_per_mentor || undefined,
      });
      setResult(resp);
    } catch (e) { setError(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Auto-Assign Mentors</h1>
      <form onSubmit={submit} className="p-4 rounded border bg-white shadow-sm grid md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Department UUID" value={form.department_id} onChange={(e)=>setForm({...form, department_id: e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Academic Year" value={form.academic_year} onChange={(e)=>setForm({...form, academic_year: e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Grade Level" value={form.grade_level} onChange={(e)=>setForm({...form, grade_level: e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Section" value={form.section} onChange={(e)=>setForm({...form, section: e.target.value})} />
        <input className="border rounded px-3 py-2" type="date" placeholder="Start Date" value={form.start_date} onChange={(e)=>setForm({...form, start_date: e.target.value})} />
        <input className="border rounded px-3 py-2" type="number" placeholder="Max per mentor" value={form.max_mentees_per_mentor} onChange={(e)=>setForm({...form, max_mentees_per_mentor: Number(e.target.value)})} />
        <div className="md:col-span-2">
          <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Assigning…' : 'Run Auto-Assign'}</button>
        </div>
      </form>
      {error && <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{error.message}</div>}
      {result && <div className="p-3 rounded bg-green-50 text-green-700 border border-green-200">Assigned: {result.assigned ?? '-'}</div>}
    </div>
  );
}


