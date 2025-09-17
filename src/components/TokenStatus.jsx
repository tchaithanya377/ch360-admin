import React, { useState } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { useTokenStatus } from '../hooks/useTokenRefresh';
import { FaSync, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TokenStatus = ({ showDetails = false, className = "" }) => {
  const { refreshToken } = useDjangoAuth();
  const { isAuthenticated, tokenInfo } = useTokenStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const result = await refreshToken();
      if (result.success) {
        console.log('Manual token refresh successful');
      } else {
        console.error('Manual token refresh failed:', result.error);
      }
    } catch (error) {
      console.error('Manual token refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated || !tokenInfo) {
    return null;
  }

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Expired';
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusIcon = () => {
    if (tokenInfo.isExpired) return <FaExclamationTriangle className="text-red-500" />;
    if (tokenInfo.willExpireSoon) return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaCheckCircle className="text-green-500" />;
  };

  const getStatusText = () => {
    if (tokenInfo.isExpired) return 'Expired';
    if (tokenInfo.willExpireSoon) return 'Expires Soon';
    return 'Valid';
  };

  const getStatusColor = () => {
    if (tokenInfo.isExpired) return 'text-red-500';
    if (tokenInfo.willExpireSoon) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center space-x-1 text-sm">
          {getStatusIcon()}
          <span className={getStatusColor()}>{getStatusText()}</span>
          <span className="text-gray-500">
            ({formatTime(tokenInfo.timeUntilExpiry)})
          </span>
        </div>
      )}
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`p-1 rounded text-gray-500 hover:text-blue-500 transition-colors ${
          isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Refresh Token"
      >
        <FaSync className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default TokenStatus;
