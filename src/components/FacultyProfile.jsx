// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import facultyApiService from '../services/facultyApiService';

// Minimal fallback for role descriptions if not provided elsewhere
const FACULTY_ROLES = {
  Professor: { description: 'Senior academic with leadership responsibilities' },
  ASSOCIATE_PROFESSOR: { description: 'Experienced academic staff member' },
  ASSISTANT_PROFESSOR: { description: 'Early-career academic staff member' },
  Lecturer: { description: 'Teaching-focused academic staff' }
};

const FacultyProfile = () => {
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useDjangoAuth();

  useEffect(() => {
    if (user?.email) {
      loadFacultyProfile(user.email);
    }
  }, [user?.email]);

  const loadFacultyProfile = async (email) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch faculty list filtered by email using search
      const list = await facultyApiService.getFaculty({ search: email, page_size: 1 });
      const results = Array.isArray(list) ? list : (Array.isArray(list?.results) ? list.results : []);
      if (!results.length) {
        setError('No faculty profile associated with your account.');
        setFacultyData(null);
        return;
      }

      const profile = results[0];
      setFacultyData(profile);
    } catch (error) {
      console.error('Error loading faculty profile:', error);
      setError(error.message || 'Failed to load faculty profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!facultyData?.id) {
        setError('Cannot update: missing faculty id.');
        return;
      }

      // Map UI fields to API payload keys as needed
      const {
        id,
        name,
        first_name,
        last_name,
        email,
        emailID,
        contactNo,
        phone_number,
        localAddress,
        permAddress,
        bankName,
        bankAccountNumber,
        ifsc,
        dateOfJoining,
        qualifications,
        areaOfSpecialization,
        designation,
        ...rest
      } = facultyData || {};

      const payload = {
        // Prefer API-native keys if present, else derive from UI fields
        first_name: first_name || (typeof name === 'string' ? name.split(' ')[0] : ''),
        last_name: last_name || (typeof name === 'string' ? name.split(' ').slice(1).join(' ') : ''),
        email: email || emailID || '',
        phone_number: phone_number || contactNo || '',
        address_line_1: rest.address_line_1 || localAddress || '',
        address_line_2: rest.address_line_2 || '',
        city: rest.city || '',
        state: rest.state || '',
        postal_code: rest.postal_code || '',
        country: rest.country || 'India',
        present_designation: rest.present_designation || designation || rest.designation || '',
        highest_qualification: rest.highest_qualification || qualifications || '',
        area_of_specialization: rest.area_of_specialization || areaOfSpecialization || '',
        date_of_joining_institution: rest.date_of_joining_institution || dateOfJoining || rest.date_of_joining || '',
        bank_name: rest.bank_name || bankName || '',
        bank_account_number: rest.bank_account_number || bankAccountNumber || '',
        ifsc_code: rest.ifsc_code || ifsc || '',
      };

      await facultyApiService.updateFaculty(facultyData.id, payload);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      if (user?.email) {
        await loadFacultyProfile(user.email);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadFacultyProfile(); // Reload original data
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !facultyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={loadFacultyProfile}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-600">No faculty profile found.</p>
        </div>
      </div>
    );
  }

  const roleKey = facultyData.present_designation || facultyData.designation || 'Lecturer';
  const roleInfo = FACULTY_ROLES[roleKey] || FACULTY_ROLES['Lecturer'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facultyData.name}</h1>
              <p className="text-lg text-gray-600">{facultyData.designation}</p>
              <p className="text-gray-500">{facultyData.department}</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {facultyData.role}
              </div>
              <p className="text-sm text-gray-500 mt-1">Employee ID: {facultyData.empID}</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={facultyData.name || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={facultyData.dob || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNo"
                      value={facultyData.contactNo || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email ID</label>
                    <input
                      type="email"
                      name="emailID"
                      value={facultyData.emailID || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={facultyData.designation || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={facultyData.dateOfJoining || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                    <input
                      type="text"
                      name="qualifications"
                      value={facultyData.qualifications || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area of Specialization</label>
                    <input
                      type="text"
                      name="areaOfSpecialization"
                      value={facultyData.areaOfSpecialization || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Local Address</label>
                    <textarea
                      name="localAddress"
                      value={facultyData.localAddress || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={3}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                    <textarea
                      name="permAddress"
                      value={facultyData.permAddress || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={3}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={facultyData.bankName || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={facultyData.bankAccountNumber || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc"
                      value={facultyData.ifsc || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role and Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Role & Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Role Information</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Role:</span> {facultyData.role}</p>
                <p><span className="font-medium">Level:</span> {facultyData.roleLevel}</p>
                <p><span className="font-medium">Description:</span> {roleInfo.description}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="space-y-1">
                {facultyData.permissions?.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  facultyData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {facultyData.status}
                </span>
              </p>
            </div>
            <div>
              <p><span className="font-medium">Profile Complete:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  facultyData.profileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {facultyData.profileComplete ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
            <div>
              <p><span className="font-medium">Last Login:</span> 
                <span className="ml-2 text-gray-600">
                  {facultyData.lastLogin ? new Date(facultyData.lastLogin.toDate()).toLocaleString() : 'Never'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
