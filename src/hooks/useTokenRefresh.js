import { useEffect, useCallback } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

// Hook to automatically refresh tokens
export const useTokenRefresh = (intervalMinutes = 5) => {
  const { refreshToken, isAuthenticated, ensureValidToken } = useDjangoAuth();

  const refreshTokens = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const isValid = await ensureValidToken();
      
      if (!isValid) {
        const result = await refreshToken();
        
        if (!result.success) {
          console.warn('Token refresh hook: Token refresh failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Token refresh hook: Error during token refresh:', error);
    }
  }, [isAuthenticated, ensureValidToken, refreshToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial check
    refreshTokens();
    
    // Set up interval
    const interval = setInterval(refreshTokens, intervalMinutes * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, intervalMinutes, refreshTokens]);

  return {
    refreshTokens,
    ensureValidToken,
  };
};

// Hook to check token status
export const useTokenStatus = () => {
  const { isAuthenticated, token } = useDjangoAuth();

  const getTokenInfo = useCallback(() => {
    if (!token) return null;

    try {
      // Decode JWT token to get expiration info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      return {
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry,
        isExpired: timeUntilExpiry <= 0,
        willExpireSoon: timeUntilExpiry <= 300, // 5 minutes
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, [token]);

  return {
    isAuthenticated,
    token,
    tokenInfo: getTokenInfo(),
  };
};
