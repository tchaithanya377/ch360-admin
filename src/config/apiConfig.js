// API Configuration
// Change this to switch between development and production environments

const API_CONFIG = {
  // Development (localhost)
  development: {
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
  },
  
  // Production
  production: {
    baseURL: 'http://13.232.220.214:8000/api',
    timeout: 15000,
  }
};

// Get current environment
const getEnvironment = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  return 'production';
};

// Get current API configuration
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// Export the current base URL for easy access
export const DJANGO_BASE_URL = getApiConfig().baseURL;

// Export all configurations
export default API_CONFIG;
