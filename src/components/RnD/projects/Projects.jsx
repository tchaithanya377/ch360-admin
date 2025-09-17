import React, { useMemo, useState } from "react";
import studentApiService from '../../../services/studentApiService';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

const COLLECTION = "rnd_projects";

const emptyProject = {
  title: "",
  principalInvestigator: "",
  coInvestigators: [],
  teamMembers: [],
  startDate: "",
  endDate: "",
  milestones: [],
  deliverables: [],
  budgetAllocated: 0,
  budgetUtilized: 0,
  status: "Draft", // Draft, Submitted, Approved, Ongoing, Completed
  summary: "",
};

const toNumber = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const useProjects = () => {
  return useQuery({
    queryKey: [COLLECTION],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
};

const Projects = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useProjects();
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const ref = await addDoc(collection(db, COLLECTION), {
        ...payload,
        budgetAllocated: toNumber(payload.budgetAllocated),
        budgetUtilized: toNumber(payload.budgetUtilized),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      await updateDoc(doc(db, COLLECTION, id), {
        ...payload,
        budgetAllocated: toNumber(payload.budgetAllocated),
        budgetUtilized: toNumber(payload.budgetUtilized),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, COLLECTION, id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({ ...project });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyProject);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      principalInvestigator: form.principalInvestigator.trim(),
      coInvestigators: (form.coInvestigators || []).map((s) => s.trim()).filter(Boolean),
      teamMembers: (form.teamMembers || []).map((s) => s.trim()).filter(Boolean),
      startDate: form.startDate || "",
      endDate: form.endDate || "",
      milestones: (form.milestones || []).map((s) => s.trim()).filter(Boolean),
      deliverables: (form.deliverables || []).map((s) => s.trim()).filter(Boolean),
      budgetAllocated: toNumber(form.budgetAllocated),
      budgetUtilized: toNumber(form.budgetUtilized),
      status: form.status || "Draft",
      summary: form.summary || "",
    };

    if (!payload.title) return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
    cancelEdit();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const onCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean);
    const [header, ...dataRows] = rows;
    const cols = header.split(",");
    for (const row of dataRows) {
      const values = row.split(",");
      const obj = Object.fromEntries(cols.map((c, i) => [c.trim(), values[i] ? values[i].trim() : ""]))
      await addMutation.mutateAsync({
        title: obj.title || obj.projectTitle || "",
        principalInvestigator: obj.principalInvestigator || obj.pi || "",
        coInvestigators: (obj.coInvestigators || "").split(";").filter(Boolean),
        teamMembers: (obj.teamMembers || "").split(";").filter(Boolean),
        startDate: obj.startDate || "",
        endDate: obj.endDate || "",
        milestones: (obj.milestones || "").split(";").filter(Boolean),
        deliverables: (obj.deliverables || "").split(";").filter(Boolean),
        budgetAllocated: toNumber(obj.budgetAllocated || obj.budget),
        budgetUtilized: toNumber(obj.budgetUtilized || 0),
        status: obj.status || "Submitted",
        summary: obj.summary || "",
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Research Projects</h2>
            <p className="text-gray-600 dark:text-gray-400">Create and manage research projects with comprehensive tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-sm text-gray-700 dark:text-gray-300">📁 Import CSV</span>
              <input type="file" accept=".csv" onChange={onCsvUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            {editingId ? "Edit Project" : "Create New Project"}
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Project Title" required>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter project title"
                required
              />
            </Field>
            <Field label="Principal Investigator" required>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.principalInvestigator}
                onChange={(e) => setForm({ ...form, principalInvestigator: e.target.value })}
                placeholder="Enter PI name"
                required
              />
            </Field>
            <Field label="Co-PIs (semicolon-separated)">
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={(form.coInvestigators || []).join(";")}
                onChange={(e) => setForm({ ...form, coInvestigators: e.target.value.split(";") })}
                placeholder="e.g., Dr. Smith; Dr. Johnson"
              />
            </Field>
            <Field label="Team Members (semicolon-separated)">
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={(form.teamMembers || []).join(";")}
                onChange={(e) => setForm({ ...form, teamMembers: e.target.value.split(";") })}
                placeholder="e.g., John Doe; Jane Smith"
              />
            </Field>
            <Field label="Start Date">
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
            <Field label="Milestones (semicolon-separated)">
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={(form.milestones || []).join(";")}
                onChange={(e) => setForm({ ...form, milestones: e.target.value.split(";") })}
                placeholder="e.g., Literature review; Data collection"
              />
            </Field>
            <Field label="Deliverables (semicolon-separated)">
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={(form.deliverables || []).join(";")}
                onChange={(e) => setForm({ ...form, deliverables: e.target.value.split(";") })}
                placeholder="e.g., Research paper; Final report"
              />
            </Field>
            <Field label="Budget Allocated">
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.budgetAllocated}
                onChange={(e) => setForm({ ...form, budgetAllocated: e.target.value })}
                min="0"
                placeholder="0"
              />
            </Field>
            <Field label="Budget Utilized">
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.budgetUtilized}
                onChange={(e) => setForm({ ...form, budgetUtilized: e.target.value })}
                min="0"
                placeholder="0"
              />
            </Field>
            <Field label="Status">
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["Draft","Submitted","Approved","Ongoing","Completed"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Summary" className="md:col-span-2">
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                placeholder="Enter project summary..."
              />
            </Field>
            <div className="md:col-span-2 flex gap-3">
              <button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingId ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {editingId ? "Update Project" : "Create Project"}
                  </div>
                )}
              </button>
              {editingId && (
                <button 
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  type="button" 
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Research Projects</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first research project</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Title</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">PI</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Dates</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Budget</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="p-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 text-gray-900 dark:text-white font-medium">{p.title}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{p.principalInvestigator}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{p.startDate || "-"} → {p.endDate || "-"}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{toNumber(p.budgetUtilized)} / {toNumber(p.budgetAllocated)}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          p.status === 'Ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          p.status === 'Approved' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          p.status === 'Submitted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition-colors"
                          onClick={() => handleDelete(p.id)}
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

export default Projects;


