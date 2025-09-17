import React, { useState } from "react";
import * as XLSX from "xlsx";
// TODO: Implement faculty API service
// import facultyApiService from '../services/facultyApiService';

const AddFacultyDjango = () => {
  // Department options
  const departmentOptions = [
    "Civil Engineering",
    "Computer Science & Engineering",
    "Computer Science & Engineering (Data Science)",
    "Computer Science & Engineering (AI & ML)",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "Aerospace Engineering",
    "Biotechnology",
    "Chemical Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Management Studies"
  ];

  const [facultyData, setFacultyData] = useState({
    name: "",
    emailID: "",
    phoneNumber: "",
    department: "",
    designation: "",
    qualification: "",
    experience: "",
    researchAreas: "",
    publications: "",
    address: "",
    dateOfJoining: "",
    salary: "",
    status: "Active"
  });

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement faculty creation with Django API
      // await facultyApiService.createFaculty(facultyData);
      
      console.log("Faculty data to be created:", facultyData);
      setSuccess("Faculty will be created once Django API is implemented!");
      
      // Reset form
      setFacultyData({
        name: "",
        emailID: "",
        phoneNumber: "",
        department: "",
        designation: "",
        qualification: "",
        experience: "",
        researchAreas: "",
        publications: "",
        address: "",
        dateOfJoining: "",
        salary: "",
        status: "Active"
      });
      setSelectedDepartment("");
      
    } catch (err) {
      setError("Failed to create faculty: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (file) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Bulk import data:", jsonData);
      setSuccess(`Found ${jsonData.length} faculty records. Bulk import will be implemented with Django API.`);
      
    } catch (err) {
      setError("Failed to process file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Faculty</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={facultyData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID *
                </label>
                <input
                  type="email"
                  name="emailID"
                  value={facultyData.emailID}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={facultyData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={facultyData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={facultyData.designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={facultyData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={facultyData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={facultyData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Areas
              </label>
              <textarea
                name="researchAreas"
                value={facultyData.researchAreas}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publications
              </label>
              <textarea
                name="publications"
                value={facultyData.publications}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={facultyData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.xlsx,.xls';
                  fileInput.onchange = (e) => {
                    if (e.target.files[0]) {
                      handleBulkImport(e.target.files[0]);
                    }
                  };
                  fileInput.click();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Bulk Import
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Faculty"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFacultyDjango;
