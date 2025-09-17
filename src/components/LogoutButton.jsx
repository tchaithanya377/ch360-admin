import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { FaSignOutAlt, FaSpinner } from 'react-icons/fa';

const LogoutButton = ({ className = "", showLabel = true, iconOnly = false }) => {
  const navigate = useNavigate();
  const { logout, loading } = useDjangoAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut || loading) return;
    
    try {
      setIsLoggingOut(true);
      console.log('LogoutButton: Starting logout process...');
      
      const result = await logout();
      
      if (result.success) {
        console.log('LogoutButton: Logout successful, redirecting to login...');
        console.log('LogoutButton: Logout details:', result);
        
        // Show success message if backend logout was successful
        if (result.backendLogoutSuccess) {
          console.log('✅ Server logout successful');
        } else if (result.backendError) {
          console.warn('⚠️ Server logout failed, but local logout completed:', result.backendError);
        }
        
        navigate('/login');
      } else {
        console.error('LogoutButton: Logout failed:', result.error);
        // Even if logout fails, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('LogoutButton: Logout error:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const defaultClassName = iconOnly 
    ? "p-2 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200"
    : "flex items-center px-3 py-2.5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors duration-200";

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut || loading}
      className={`${defaultClassName} ${className} ${
        isLoggingOut || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={iconOnly ? "Logout" : ""}
    >
      {isLoggingOut || loading ? (
        <FaSpinner className="text-lg animate-spin" />
      ) : (
        <FaSignOutAlt className="text-lg" />
      )}
      {showLabel && !iconOnly && (
        <span className="ml-3 font-medium">
          {isLoggingOut || loading ? 'Logging out...' : 'Logout'}
        </span>
      )}
    </button>
  );
};

export default LogoutButton;
