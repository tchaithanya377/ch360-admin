import React, { useEffect, useState } from "react";
import studentApiService from '../services/studentApiService';
import { useParams } from "react-router-dom";
const FacultyViewer = () => {
  const { deptKey, memberId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      setLoading(true);
      setError("");
      try {
        if (!deptKey || !memberId) {
          throw new Error("Missing department or member id");
        }
        const ref = doc(db, "faculty", deptKey, "members", memberId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          throw new Error("Faculty not found");
        }
        setFaculty({ id: snap.id, ...snap.data(), _path: ref.path });
      } catch (e) {
        console.error("Failed to load faculty", e);
        setError(e.message || "Failed to load faculty");
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [deptKey, memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Path: /faculty/{deptKey}/members/{memberId}</p>
      </div>
    );
  }

  if (!faculty) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Faculty Profile</h1>
          <p className="text-blue-100 text-sm mt-1">Department: {deptKey}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{faculty.name || "Unnamed"}</h2>
              <p className="text-gray-600">{faculty.designation || "Designation"}</p>
              <p className="text-gray-500">{faculty.department || faculty.departmentKey || deptKey}</p>
            </div>
            <div className="text-right">
              {faculty.empID && (
                <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">Emp ID: {faculty.empID}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Contact</h3>
              <p className="text-sm text-gray-700">Email: {faculty.emailID || faculty.authEmail || "-"}</p>
              <p className="text-sm text-gray-700">Phone: {faculty.contactNo || "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Professional</h3>
              <p className="text-sm text-gray-700">Joining: {faculty.dateOfJoining || "-"}</p>
              <p className="text-sm text-gray-700">Qualifications: {faculty.qualifications || "-"}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Meta</h3>
            <p className="text-xs text-gray-600 break-all">Doc Path: {faculty._path}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyViewer;


