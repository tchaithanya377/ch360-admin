import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faGraduationCap,
  faMapMarkerAlt,
  faIdCard,
  faUsers,
  faPhone,
  faEnvelope,
  faCalendarAlt,
  faHeartbeat,
  faStethoscope,
  faFileAlt,
  faEdit,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const StudentDetailsView = ({ student, onEdit, onClose }) => {
  if (!student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'graduated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'transferred': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Roll Number: {student.rollNumber || 'Not assigned'}
                </p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor(student.status)}`}>
                  {student.status || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faUser} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll Number</label>
                <p className="text-gray-900 dark:text-white">{student.rollNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <p className="text-gray-900 dark:text-white">{student.firstName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <p className="text-gray-900 dark:text-white">{student.lastName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                <p className="text-gray-900 dark:text-white">{student.middleName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <p className="text-gray-900 dark:text-white">{formatDate(student.dateOfBirth)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <p className="text-gray-900 dark:text-white">{student.gender || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
                <p className="text-gray-900 dark:text-white">{student.section || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                <p className="text-gray-900 dark:text-white">{student.academicYear || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade Level</label>
                <p className="text-gray-900 dark:text-white">{student.gradeLevel || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quota</label>
                <p className="text-gray-900 dark:text-white">{student.quota || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rank</label>
                <p className="text-gray-900 dark:text-white">{student.rank || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  {student.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Mobile</label>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  {student.studentMobile || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1</label>
                <p className="text-gray-900 dark:text-white">{student.addressLine1 || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
                <p className="text-gray-900 dark:text-white">{student.addressLine2 || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                <p className="text-gray-900 dark:text-white">{student.city || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                <p className="text-gray-900 dark:text-white">{student.state || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                <p className="text-gray-900 dark:text-white">{student.postalCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                <p className="text-gray-900 dark:text-white">{student.country || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Village</label>
                <p className="text-gray-900 dark:text-white">{student.village || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Identity Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faIdCard} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identity Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aadhar Number</label>
                <p className="text-gray-900 dark:text-white">{student.aadharNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Religion</label>
                <p className="text-gray-900 dark:text-white">{student.religion || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Caste</label>
                <p className="text-gray-900 dark:text-white">{student.caste || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcaste</label>
                <p className="text-gray-900 dark:text-white">{student.subcaste || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-pink-600 dark:text-pink-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parent Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father Name</label>
                <p className="text-gray-900 dark:text-white">{student.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mother Name</label>
                <p className="text-gray-900 dark:text-white">{student.motherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father Mobile</label>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  {student.fatherMobile || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mother Mobile</label>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  {student.motherMobile || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          {(student.guardianName || student.guardianPhone || student.guardianEmail || student.guardianRelationship) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Guardian Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Name</label>
                  <p className="text-gray-900 dark:text-white">{student.guardianName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Phone</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                    {student.guardianPhone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Email</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                    {student.guardianEmail || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Relationship</label>
                  <p className="text-gray-900 dark:text-white">{student.guardianRelationship || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(student.emergencyContactName || student.emergencyContactPhone || student.emergencyContactRelationship) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faPhone} className="text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Name</label>
                  <p className="text-gray-900 dark:text-white">{student.emergencyContactName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Phone</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                    {student.emergencyContactPhone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Relationship</label>
                  <p className="text-gray-900 dark:text-white">{student.emergencyContactRelationship || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Academic Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enrollment Date</label>
                <p className="text-gray-900 dark:text-white">{formatDate(student.enrollmentDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Graduation Date</label>
                <p className="text-gray-900 dark:text-white">{formatDate(student.expectedGraduationDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(student.status)}`}>
                  {student.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {(student.medicalConditions || student.medications) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faStethoscope} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medical Conditions</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {student.medicalConditions || 'No medical conditions reported'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medications</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {student.medications || 'No medications reported'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {student.notes && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faFileAlt} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{student.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsView;
