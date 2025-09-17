/**
 * Django API Error Handling Utility
 * 
 * This utility provides centralized error handling for Django API interactions,
 * including authentication errors, network issues, and other common problems.
 */

// Error types
export const ERROR_TYPES = {
  DJANGO_API: 'DJANGO_API',
  AUTHENTICATION: 'AUTHENTICATION',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Handle Django API errors gracefully
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const handleDjangoApiError = (error, context = 'Unknown') => {
  console.warn(`Django API error in ${context}:`, error);
  
  return {
    type: ERROR_TYPES.DJANGO_API,
    severity: ERROR_SEVERITY.MEDIUM,
    message: error.message || 'API error occurred',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle authentication errors
 * @param {Error} error - The authentication error
 * @param {string} context - Context where the error occurred
 */
export const handleAuthError = (error, context = 'Unknown') => {
  console.error(`Authentication error in ${context}:`, error);
  
  return {
    type: ERROR_TYPES.AUTHENTICATION,
    severity: ERROR_SEVERITY.HIGH,
    message: error.message || 'Authentication failed',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle network errors
 * @param {Error} error - The network error
 * @param {string} context - Context where the error occurred
 */
export const handleNetworkError = (error, context = 'Unknown') => {
  console.error(`Network error in ${context}:`, error);
  
  return {
    type: ERROR_TYPES.NETWORK,
    severity: ERROR_SEVERITY.MEDIUM,
    message: 'Network connection failed',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle validation errors
 * @param {Error} error - The validation error
 * @param {string} context - Context where the error occurred
 */
export const handleValidationError = (error, context = 'Unknown') => {
  console.warn(`Validation error in ${context}:`, error);
  
  return {
    type: ERROR_TYPES.VALIDATION,
    severity: ERROR_SEVERITY.MEDIUM,
    message: error.message || 'Validation failed',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle permission errors
 * @param {Error} error - The permission error
 * @param {string} context - Context where the error occurred
 */
export const handlePermissionError = (error, context = 'Unknown') => {
  console.error(`Permission error in ${context}:`, error);
  
  return {
    type: ERROR_TYPES.PERMISSION,
    severity: ERROR_SEVERITY.HIGH,
    message: 'Insufficient permissions',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generic error handler
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const handleError = (error, context = 'Unknown') => {
  console.error(`Error in ${context}:`, error);
  
  // Determine error type based on error properties
  let type = ERROR_TYPES.UNKNOWN;
  let severity = ERROR_SEVERITY.MEDIUM;
  
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    type = ERROR_TYPES.AUTHENTICATION;
    severity = ERROR_SEVERITY.HIGH;
  } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    type = ERROR_TYPES.PERMISSION;
    severity = ERROR_SEVERITY.HIGH;
  } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
    type = ERROR_TYPES.VALIDATION;
    severity = ERROR_SEVERITY.MEDIUM;
  } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    type = ERROR_TYPES.NETWORK;
    severity = ERROR_SEVERITY.MEDIUM;
  }
  
  return {
    type,
    severity,
    message: error.message || 'An unexpected error occurred',
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Show user-friendly error message
 * @param {Object} errorInfo - Error information object
 * @param {Function} showToast - Toast notification function
 */
export const showErrorToUser = (errorInfo, showToast) => {
  if (!showToast) return;
  
  const messages = {
    [ERROR_TYPES.AUTHENTICATION]: 'Please log in again',
    [ERROR_TYPES.PERMISSION]: 'You do not have permission to perform this action',
    [ERROR_TYPES.VALIDATION]: 'Please check your input and try again',
    [ERROR_TYPES.NETWORK]: 'Network error. Please check your connection',
    [ERROR_TYPES.DJANGO_API]: 'Server error. Please try again later',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred'
  };
  
  const message = messages[errorInfo.type] || messages[ERROR_TYPES.UNKNOWN];
  showToast(message, 'error');
};

/**
 * Log error for debugging
 * @param {Object} errorInfo - Error information object
 */
export const logError = (errorInfo) => {
  const logData = {
    timestamp: errorInfo.timestamp,
    type: errorInfo.type,
    severity: errorInfo.severity,
    context: errorInfo.context,
    message: errorInfo.message,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In production, you might want to send this to a logging service
  console.error('Error logged:', logData);
};

// Export all error handlers
export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  handleDjangoApiError,
  handleAuthError,
  handleNetworkError,
  handleValidationError,
  handlePermissionError,
  handleError,
  showErrorToUser,
  logError
};
