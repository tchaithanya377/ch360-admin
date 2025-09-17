import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faKey, 
  faIdCard, 
  faCopy, 
  faEye, 
  faEyeSlash,
  faExternalLinkAlt,
  faGraduationCap,
  faBuilding,
  faCalendarAlt,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

const StudentAccessCard = ({ student, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const getDepartmentLabel = (deptValue) => {
    const departments = {
      'CSE': 'Computer Science & Engineering',
      'CSE_AI': 'Computer Science & Engineering (Artificial Intelligence)',
      'CSE_CS': 'Computer Science & Engineering (Cyber Security)',
      'CSE_DS': 'Computer Science & Engineering (Data Science)',
      'CSE_AI_ML': 'Computer Science & Engineering (AI & ML)',
      'CSE_NETWORKS': 'Computer Science & Engineering (Networks)',
      'CST': 'Computer Science & Technology',
      'ECE': 'Electronics & Communication Engineering',
      'EEE': 'Electrical & Electronics Engineering',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering',
      'IT': 'Information Technology',
      'BSH': 'Basic Sciences & Humanities',
      'MS': 'Management Studies',
      'MCA': 'Computer Applications'
    };
    return departments[deptValue] || deptValue;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faUser} className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Student Access Card</h2>
                <p className="text-gray-600">Login credentials and profile access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Student Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {student.studentName || student.fullName}
                </h3>
                <p className="text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  Roll No: {student.rollNo}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faBuilding} className="mr-1" />
                    {getDepartmentLabel(student.department)}
                  </span>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
                    Year {student.year} - Section {student.section}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {student.initials || (student.studentName || student.fullName).split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faKey} className="mr-2 text-green-600" />
              Login Credentials
            </h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-mono text-gray-900">{student.email || student.loginEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(student.email || student.loginEmail, 'email')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  {copiedField === 'email' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faKey} className="text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Password</p>
                    <p className="font-mono text-gray-900">
                      {showPassword ? (student.password || student.loginPassword || '123456') : '••••••'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                  <button
                    onClick={() => copyToClipboard(student.password || student.loginPassword || '123456', 'password')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                  >
                    {copiedField === 'password' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-purple-600" />
              Quick Access
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={student.profileUrl || `/student/profile/${student.authUid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-purple-600 mr-3" />
                <div>
                  <p className="font-semibold text-purple-900">Student Profile</p>
                  <p className="text-sm text-purple-700">View and edit profile</p>
                </div>
              </a>

              <a
                href={student.dashboardUrl || `/student/dashboard/${student.authUid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-blue-900">Student Dashboard</p>
                  <p className="text-sm text-blue-700">Academic overview</p>
                </div>
              </a>
            </div>
          </div>

          {/* Login Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Login Instructions</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Use the email and password above to log in</p>
              <p>• Default password is: <strong>123456</strong></p>
              <p>• Students should change their password after first login</p>
              <p>• For password reset, use the email address</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                const credentials = `Email: ${student.email || student.loginEmail}\nPassword: ${student.password || student.loginPassword || '123456'}`;
                copyToClipboard(credentials, 'all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {copiedField === 'all' ? 'Copied All!' : 'Copy All Credentials'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAccessCard;
