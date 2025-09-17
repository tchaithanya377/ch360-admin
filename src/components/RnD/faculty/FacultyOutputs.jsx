import React, { useMemo, useState } from "react";
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

const COLLECTION = "rnd_faculty_outputs";

const academicYears = ["2024-25","2023-24","2022-23","2021-22"];

const empty = {
  serialNo: "",
  facultyName: "",
  dateOfJoin: "",
  totalExperienceInMITS: "",
  journalPublicationsWithMITS: { total: 0, firstAuthor: 0, otherThanFirstAuthor: 0 },
  conferencePublicationsWithMITS: { total: 0, firstAuthor: 0, otherThanFirstAuthor: 0 },
  journalFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  journalOtherFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  conferenceFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  conferenceOtherFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  booksOrChapters: Object.fromEntries(academicYears.map(y => [y, 0])),
  patents: Object.fromEntries(academicYears.map(y => [y, 0])),
  notes: "",
};

const toNumber = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const Field = ({ label, children, required = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const YearGrid = ({ title, value, onChange }) => (
  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
    <div className="font-medium mb-3 text-gray-900 dark:text-white">{title}</div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {academicYears.map((y) => (
        <div key={y} className="flex flex-col gap-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">AY: {y}</span>
          <input
            type="number"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={value[y]}
            min="0"
            onChange={(e) => onChange({ ...value, [y]: toNumber(e.target.value) })}
          />
        </div>
      ))}
    </div>
  </div>
);

const FacultyOutputs = () => {
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
    mutationFn: async ({ id, payload }) => {
      await updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: serverTimestamp() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteDoc(doc(db, COLLECTION, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      serialNo: form.serialNo?.toString().trim(),
      facultyName: form.facultyName?.trim(),
      totalExperienceInMITS: form.totalExperienceInMITS?.toString().trim(),
    };
    if (!payload.facultyName) return;
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await addMutation.mutateAsync(payload);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Faculty Outputs (Year-wise)</h2>
        <p className="text-gray-600 dark:text-gray-400">Track and manage faculty research outputs, publications, and academic achievements</p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            {editingId ? "Edit Faculty Output" : "Add New Faculty Output"}
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="S.No.">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                value={form.serialNo} 
                onChange={(e) => setForm({ ...form, serialNo: e.target.value })} 
                placeholder="Enter serial number"
              />
            </Field>
            <Field label="Name of the Faculty" required>
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                value={form.facultyName} 
                onChange={(e) => setForm({ ...form, facultyName: e.target.value })} 
                placeholder="Enter faculty name"
                required 
              />
            </Field>
            <Field label="Date of Join in MITS">
              <input 
                type="date" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                value={form.dateOfJoin} 
                onChange={(e) => setForm({ ...form, dateOfJoin: e.target.value })} 
              />
            </Field>
            <Field label="Total Experience in MITS">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                value={form.totalExperienceInMITS} 
                onChange={(e) => setForm({ ...form, totalExperienceInMITS: e.target.value })} 
                placeholder="e.g., 5 years"
              />
            </Field>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">Journal Publications with MITS</div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Total">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.journalPublicationsWithMITS.total} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, total: toNumber(e.target.value) } })} 
                    />
                  </Field>
                  <Field label="As first Author">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.journalPublicationsWithMITS.firstAuthor} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, firstAuthor: toNumber(e.target.value) } })} 
                    />
                  </Field>
                  <Field label="Other than first Author">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.journalPublicationsWithMITS.otherThanFirstAuthor} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, otherThanFirstAuthor: toNumber(e.target.value) } })} 
                    />
                  </Field>
                </div>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">Conference Publications with MITS</div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Total">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.conferencePublicationsWithMITS.total} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, total: toNumber(e.target.value) } })} 
                    />
                  </Field>
                  <Field label="As first Author">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.conferencePublicationsWithMITS.firstAuthor} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, firstAuthor: toNumber(e.target.value) } })} 
                    />
                  </Field>
                  <Field label="Other than first Author">
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                      value={form.conferencePublicationsWithMITS.otherThanFirstAuthor} 
                      min="0" 
                      onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, otherThanFirstAuthor: toNumber(e.target.value) } })} 
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 gap-6">
              <YearGrid title="Journal First Author Publications" value={form.journalFirstAuthorPublications} onChange={(v) => setForm({ ...form, journalFirstAuthorPublications: v })} />
              <YearGrid title="Journal Other than First Author Publications" value={form.journalOtherFirstAuthorPublications} onChange={(v) => setForm({ ...form, journalOtherFirstAuthorPublications: v })} />
              <YearGrid title="Conference First Author Publications" value={form.conferenceFirstAuthorPublications} onChange={(v) => setForm({ ...form, conferenceFirstAuthorPublications: v })} />
              <YearGrid title="Conference other than First Author Publications" value={form.conferenceOtherFirstAuthorPublications} onChange={(v) => setForm({ ...form, conferenceOtherFirstAuthorPublications: v })} />
              <YearGrid title="Book / Book Chapters" value={form.booksOrChapters} onChange={(v) => setForm({ ...form, booksOrChapters: v })} />
              <YearGrid title="Patents" value={form.patents} onChange={(v) => setForm({ ...form, patents: v })} />
            </div>

            <Field label="Notes" className="md:col-span-2">
              <textarea 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                rows={3} 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                placeholder="Additional notes or comments..."
              />
            </Field>

            <div className="md:col-span-2 flex gap-3">
              <button 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingId ? "Updating..." : "Saving..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {editingId ? "Update Record" : "Save Record"}
                  </div>
                )}
              </button>
              {editingId && (
                <button 
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  type="button" 
                  onClick={() => { setEditingId(null); setForm(empty); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Faculty Outputs Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Outputs</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading faculty outputs...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No faculty outputs yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking faculty research outputs and publications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">S.No</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Faculty</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Join Date</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Journal(MITS)</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Conference(MITS)</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 text-gray-900 dark:text-white font-medium">{r.serialNo}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.facultyName}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{r.dateOfJoin || '-'}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.journalPublicationsWithMITS?.total ?? 0}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.conferencePublicationsWithMITS?.total ?? 0}</td>
                      <td className="p-3 flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                          onClick={() => { setEditingId(r.id); setForm({ ...empty, ...r }); }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition-colors"
                          onClick={async () => { 
                            if (window.confirm('Delete this record?')) { 
                              const { deleteDoc, doc } = await import('firebase/firestore'); 
                              await deleteDoc(doc(db, COLLECTION, r.id)); 
                              qc.invalidateQueries({ queryKey: [COLLECTION] }); 
                            } 
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyOutputs;


