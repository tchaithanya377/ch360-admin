import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faKey, 
  faEye, 
  faEyeSlash,
  faGraduationCap,
  faBuilding,
  faSignInAlt,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const StudentLogin = ({ onLogin, onClose }) => {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Generate email from roll number
      const email = `${rollNo.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}@mits.ac.in`;
      
      // Call the login function
      await onLogin(email, password, rollNo);
    } catch (err) {
      setError('Invalid roll number or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Login</h2>
            <p className="text-gray-600">Access your student profile and dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter your roll number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    className="text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-red-400 mt-1 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Login Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mt-1 mr-2" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Login Information:</p>
                  <ul className="space-y-1">
                    <li>• Email: rollno@mits.ac.in</li>
                    <li>• Default password: 123456</li>
                    <li>• Change password after first login</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !rollNo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                    Login
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Access Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Access</h3>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="/student/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </a>
              <a
                href="/student/help"
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Need Help?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
