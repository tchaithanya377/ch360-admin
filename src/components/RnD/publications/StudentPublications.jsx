import React, { useState } from "react";
import studentApiService from '../../../services/studentApiService';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "rnd_student_publications";

const empty = {
  department: "",
  students: "",
  journalOrConferenceName: "",
  paperTitle: "",
  doiOrUrl: "",
  monthYear: "",
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    {children}
  </div>
);

const StudentPublications = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: [COLLECTION],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const ref = await addDoc(collection(db, COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: serverTimestamp() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.department || !payload.students || !payload.paperTitle) return;
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await addMutation.mutateAsync(payload);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Student Publications</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Department Name">
          <input className="border rounded p-2" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
        </Field>
        <Field label="Name of the Student(s)">
          <textarea className="border rounded p-2" rows={2} value={form.students} onChange={(e) => setForm({ ...form, students: e.target.value })} required />
        </Field>
        <Field label="Journal/Conference Name">
          <textarea className="border rounded p-2" rows={2} value={form.journalOrConferenceName} onChange={(e) => setForm({ ...form, journalOrConferenceName: e.target.value })} />
        </Field>
        <Field label="Paper Title">
          <textarea className="border rounded p-2" rows={2} value={form.paperTitle} onChange={(e) => setForm({ ...form, paperTitle: e.target.value })} required />
        </Field>
        <Field label="DOI / URL">
          <input className="border rounded p-2" value={form.doiOrUrl} onChange={(e) => setForm({ ...form, doiOrUrl: e.target.value })} />
        </Field>
        <Field label="Month-Year">
          <input className="border rounded p-2" value={form.monthYear} onChange={(e) => setForm({ ...form, monthYear: e.target.value })} placeholder="e.g., Oct/24" />
        </Field>
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">{editingId ? "Update" : "Save"} Entry</button>
          {editingId && <button type="button" className="border px-4 py-2 rounded" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Dept</th>
                <th className="p-2">Students</th>
                <th className="p-2">Title</th>
                <th className="p-2">Journal/Conference</th>
                <th className="p-2">DOI/URL</th>
                <th className="p-2">Month-Year</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{r.department}</td>
                  <td className="p-2">{r.students}</td>
                  <td className="p-2">{r.paperTitle}</td>
                  <td className="p-2">{r.journalOrConferenceName}</td>
                  <td className="p-2"><a className="text-blue-600 underline" href={r.doiOrUrl} target="_blank" rel="noreferrer">{r.doiOrUrl}</a></td>
                  <td className="p-2">{r.monthYear}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => { setEditingId(r.id); setForm({ ...empty, ...r }); }}>Edit</button>
                    <button className="text-red-600" onClick={async () => { if (window.confirm('Delete this entry?')) { const { deleteDoc, doc } = await import('firebase/firestore'); await deleteDoc(doc(db, COLLECTION, r.id)); qc.invalidateQueries({ queryKey: [COLLECTION] }); } }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentPublications;


