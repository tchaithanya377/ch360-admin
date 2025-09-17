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

const COLLECTION = "rnd_publication_details";

const empty = {
  serialNo: "",
  authors: "", // Name of the authors (as per publication)
  mitsAlone: { A1: "", A2: "", A3: "", A4: "" }, // A1..A4 (dept)
  otherAuthorPositionNumber: "",
  journalName: "",
  articleType: "Journal Article/Conference publication",
  indexedIn: "", // Scopus/SCI/SCIE/SSCI
  isPaid: "", // Paid/Unpaid
  title: "",
  doiOrUrl: "",
  monthYear: "", // Month & year (electronic)
  impactFactorOrCiteScore: "",
  hIndexOfJournal: "",
  journalQuartile: "", // Q1/Q2/Q3/Q4
};

const Field = ({ label, children, required = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const PublicationsDetail = () => {
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

  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteDoc(doc(db, COLLECTION, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      serialNo: form.serialNo?.toString().trim(),
      authors: form.authors?.trim(),
      journalName: form.journalName?.trim(),
      articleType: form.articleType?.trim(),
      indexedIn: form.indexedIn?.trim(),
      isPaid: form.isPaid?.trim(),
      title: form.title?.trim(),
      doiOrUrl: form.doiOrUrl?.trim(),
      monthYear: form.monthYear?.trim(),
      impactFactorOrCiteScore: form.impactFactorOrCiteScore?.toString().trim(),
      hIndexOfJournal: form.hIndexOfJournal?.toString().trim(),
      journalQuartile: form.journalQuartile?.trim(),
    };
    if (!payload.authors || !payload.title) return;
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await addMutation.mutateAsync(payload);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Publication Details</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage comprehensive publication records with detailed metadata and indexing information</p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            {editingId ? "Edit Publication" : "Add New Publication"}
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="S.No">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.serialNo} 
                onChange={(e) => setForm({ ...form, serialNo: e.target.value })} 
                placeholder="Enter serial number"
              />
            </Field>
            <Field label="Name of the authors (as per publication)" required>
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.authors} 
                onChange={(e) => setForm({ ...form, authors: e.target.value })} 
                placeholder="Enter author names"
                required 
              />
            </Field>

            <div className="md:col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="font-medium mb-3 text-gray-900 dark:text-white">MITS Alone (A1..A4 dept)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["A1","A2","A3","A4"]).map((k) => (
                  <Field key={k} label={`${k}(dept)`}>
                    <input 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                      value={form.mitsAlone[k]} 
                      onChange={(e) => setForm({ ...form, mitsAlone: { ...form.mitsAlone, [k]: e.target.value } })} 
                      placeholder="Department"
                    />
                  </Field>
                ))}
              </div>
            </div>

            <Field label="Other Author position number">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.otherAuthorPositionNumber} 
                onChange={(e) => setForm({ ...form, otherAuthorPositionNumber: e.target.value })} 
                placeholder="e.g., 5th author"
              />
            </Field>
            <Field label="Journal name">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.journalName} 
                onChange={(e) => setForm({ ...form, journalName: e.target.value })} 
                placeholder="Enter journal name"
              />
            </Field>
            <Field label="Journal Article/Conference publication">
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.articleType} 
                onChange={(e) => setForm({ ...form, articleType: e.target.value })}
              >
                <option>Journal Article</option>
                <option>Conference publication</option>
              </select>
            </Field>
            <Field label="Indexed (Scopus/SCI/SCIE/SSCI)">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.indexedIn} 
                onChange={(e) => setForm({ ...form, indexedIn: e.target.value })} 
                placeholder="e.g., Scopus" 
              />
            </Field>
            <Field label="Paid/Unpaid">
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.isPaid} 
                onChange={(e) => setForm({ ...form, isPaid: e.target.value })}
              >
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
            </Field>
            <Field label="Title of the paper" required>
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                placeholder="Enter paper title"
                required 
              />
            </Field>
            <Field label="DOI / URL">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.doiOrUrl} 
                onChange={(e) => setForm({ ...form, doiOrUrl: e.target.value })} 
                placeholder="e.g., 10.1000/123456"
              />
            </Field>
            <Field label="Month & year (electronic)">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.monthYear} 
                onChange={(e) => setForm({ ...form, monthYear: e.target.value })} 
                placeholder="e.g., Nov 2024" 
              />
            </Field>
            <Field label="Impact factor of the Journal / cite score">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.impactFactorOrCiteScore} 
                onChange={(e) => setForm({ ...form, impactFactorOrCiteScore: e.target.value })} 
                placeholder="e.g., 3.45"
              />
            </Field>
            <Field label="H index of the journal">
              <input 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.hIndexOfJournal} 
                onChange={(e) => setForm({ ...form, hIndexOfJournal: e.target.value })} 
                placeholder="e.g., 15"
              />
            </Field>
            <Field label="Journal Quartile (Q1/Q2/Q3/Q4)">
              <select 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                value={form.journalQuartile} 
                onChange={(e) => setForm({ ...form, journalQuartile: e.target.value })}
              >
                <option value="">Select Quartile</option>
                {(["Q1","Q2","Q3","Q4"]).map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </Field>

            <div className="md:col-span-2 flex gap-3">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {editingId ? "Update Publication" : "Save Publication"}
                  </div>
                )}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  onClick={() => { setEditingId(null); setForm(empty); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Publications Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Publication Details</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading publications...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start adding publication details to build your research database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">S.No</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Authors</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Title</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Journal</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Indexed</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Quartile</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 text-gray-900 dark:text-white font-medium">{r.serialNo}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.authors}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{r.title}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{r.journalName}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{r.indexedIn}</td>
                      <td className="p-3">
                        {r.journalQuartile && (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.journalQuartile === 'Q1' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            r.journalQuartile === 'Q2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            r.journalQuartile === 'Q3' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            r.journalQuartile === 'Q4' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {r.journalQuartile}
                          </span>
                        )}
                      </td>
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

export default PublicationsDetail;


