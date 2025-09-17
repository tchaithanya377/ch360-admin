import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout, loading } = useDjangoAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        console.log('Logout component: Starting logout process...');
        const result = await logout();
        
        if (result.success) {
          console.log('Logout component: Logout successful, redirecting to login...');
          navigate('/login');
        } else {
          console.error('Logout component: Logout failed:', result.error);
          // Even if logout fails, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Logout component: Logout error:', error);
        // Even if logout fails, redirect to login
        navigate('/login');
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 shadow-lg rounded-md w-96 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Logging out...
        </h2>
        <p className="text-gray-600">
          Please wait while we log you out securely.
        </p>
      </div>
    </div>
  );
};

export default Logout;
