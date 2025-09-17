import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MentorshipsApi, ProjectsApi, MeetingsApi, ActionItemsApi, FeedbackApi } from '../../services/mentoringApi';
import RiskBadge from './shared/RiskBadge';

export default function MentorshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('actions');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await MentorshipsApi.retrieve(id);
      setDetail(d);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const computeRisk = async () => {
    try {
      await MentorshipsApi.computeRisk(id);
      await load();
    } catch (e) {
      setError(e);
    }
  };

  const toggleActive = async () => {
    try {
      await MentorshipsApi.update(id, { is_active: !detail.is_active });
      await load();
    } catch (e) { setError(e); }
  };

  if (!detail) return <div className="p-4">{loading ? 'Loading…' : error ? (error.status === 403 ? 'Insufficient permissions' : error.message) : 'Not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mentorship</h1>
        <div className="space-x-2">
          <button className="px-3 py-1.5 rounded bg-purple-50 text-purple-700 border border-purple-200" onClick={computeRisk}>Compute Risk</button>
          <button className="px-3 py-1.5 rounded bg-gray-100 border" onClick={toggleActive}>{detail.is_active ? 'Deactivate' : 'Reactivate'}</button>
        </div>
      </div>

      <div className="p-4 rounded border bg-white shadow-sm">
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <div><span className="text-gray-500">Mentor:</span> <span className="font-medium">{detail.mentor_name || detail.mentor}</span></div>
            <div><span className="text-gray-500">Student:</span> <span className="font-medium">{detail.student_name || detail.student}</span></div>
            <div><span className="text-gray-500">Department:</span> {detail.department_name || detail.department_ref || '-'}</div>
          </div>
          <div>
            <div><span className="text-gray-500">Objective:</span> {detail.objective || '-'}</div>
            <div><span className="text-gray-500">Risk:</span> <RiskBadge score={detail.risk_score || 0} /> <span className="text-gray-500 ml-2">Last:</span> {detail.last_risk_evaluated_at || '-'}</div>
            <div><span className="text-gray-500">Status:</span> {detail.is_active ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {['actions','meetings','projects','feedback'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded border ${tab===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {tab === 'actions' && (
        <TabActionItems mentorshipId={id} items={detail.action_items || []} onChanged={load} />
      )}
      {tab === 'meetings' && (
        <TabMeetings mentorshipId={id} items={detail.meetings || []} onChanged={load} />
      )}
      {tab === 'projects' && (
        <TabProjects mentorshipId={id} items={detail.projects || []} onChanged={load} />
      )}
      {tab === 'feedback' && (
        <TabFeedback mentorshipId={id} items={detail.feedback || []} onChanged={load} />
      )}
    </div>
  );
}

function TabActionItems({ mentorshipId, items, onChanged }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [due, setDue] = useState('');
  const [saving, setSaving] = useState(false);
  const create = async () => {
    try {
      setSaving(true);
      await ActionItemsApi.create({ mentorship: mentorshipId, title, priority, status: 'OPEN', due_date: due || undefined });
      setTitle(''); setPriority('MEDIUM'); setDue('');
      await onChanged();
    } finally { setSaving(false); }
  };
  const toggle = async (ai) => {
    const next = ai.status === 'DONE' ? 'OPEN' : 'DONE';
    await ActionItemsApi.update(ai.id, { status: next });
    await onChanged();
  };
  return (
    <div className="p-4 rounded border bg-white shadow-sm">
      <div className="flex gap-2 mb-3">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Action title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <select className="border rounded px-3 py-2" value={priority} onChange={(e)=>setPriority(e.target.value)}>
          {['LOW','MEDIUM','HIGH','URGENT'].map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
        <input className="border rounded px-3 py-2" type="date" value={due} onChange={(e)=>setDue(e.target.value)} />
        <button disabled={!title || saving} className="px-3 py-2 rounded bg-green-600 text-white" onClick={create}>Add</button>
      </div>
      <div className="divide-y">
        {items.map(ai => (
          <div key={ai.id} className="py-2 flex items-center justify-between text-sm">
            <div className="truncate"><span className="font-medium">{ai.title}</span> <span className="text-gray-500">{ai.priority}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{ai.due_date || '-'}</span>
              <button className="px-2 py-1 rounded border" onClick={() => toggle(ai)}>{ai.status === 'DONE' ? 'Reopen' : 'Mark done'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabMeetings({ mentorshipId, items, onChanged }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const create = async () => {
    try {
      setSaving(true);
      await MeetingsApi.create({ mentorship: mentorshipId, scheduled_at: scheduledAt, agenda: agenda || undefined, notes: notes || undefined });
      setScheduledAt(''); setAgenda(''); setNotes('');
      await onChanged();
    } finally { setSaving(false); }
  };
  return (
    <div className="p-4 rounded border bg-white shadow-sm space-y-3">
      <div className="grid md:grid-cols-3 gap-2">
        <input className="border rounded px-3 py-2" type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Agenda" value={agenda} onChange={(e)=>setAgenda(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} />
      </div>
      <button disabled={!scheduledAt || saving} className="px-3 py-2 rounded bg-green-600 text-white" onClick={create}>Schedule</button>
      <div className="divide-y">
        {items.map(mt => (
          <div key={mt.id} className="py-2 text-sm">
            <div className="font-medium">{mt.scheduled_at}</div>
            <div className="text-gray-600">{mt.agenda || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabProjects({ mentorshipId, items, onChanged }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [saving, setSaving] = useState(false);
  const create = async () => {
    try {
      setSaving(true);
      await ProjectsApi.create({ mentorship: mentorshipId, title, status });
      setTitle(''); setStatus('PLANNED');
      await onChanged();
    } finally { setSaving(false); }
  };
  return (
    <div className="p-4 rounded border bg-white shadow-sm">
      <div className="flex gap-2 mb-3">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Project title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <select className="border rounded px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
          {['PLANNED','IN_PROGRESS','COMPLETED','ON_HOLD'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button disabled={!title || saving} className="px-3 py-2 rounded bg-green-600 text-white" onClick={create}>Add</button>
      </div>
      <div className="grid gap-2">
        {items.map(p => (
          <div key={p.id} className="p-3 rounded border">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">{p.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabFeedback({ mentorshipId, items, onChanged }) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const create = async () => {
    try {
      setSaving(true);
      await FeedbackApi.create({ mentorship: mentorshipId, rating, comments: comments || undefined });
      setRating(5); setComments('');
      await onChanged();
    } finally { setSaving(false); }
  };
  return (
    <div className="p-4 rounded border bg-white shadow-sm">
      <div className="flex gap-2 mb-3">
        <select className="border rounded px-3 py-2" value={rating} onChange={(e)=>setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input className="border rounded px-3 py-2 flex-1" placeholder="Comments" value={comments} onChange={(e)=>setComments(e.target.value)} />
        <button disabled={saving} className="px-3 py-2 rounded bg-green-600 text-white" onClick={create}>Add</button>
      </div>
      <div className="divide-y">
        {items.map(f => (
          <div key={f.id} className="py-2 text-sm">
            <div className="font-medium">Rating: {f.rating}</div>
            <div className="text-gray-600">{f.comments || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


