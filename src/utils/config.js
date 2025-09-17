// Application configuration
export const config = {
  // Performance monitoring settings
  performance: {
    enabled: process.env.NODE_ENV === 'production', // Only enable in production
    logLevel: process.env.NODE_ENV === 'development' ? 'verbose' : 'minimal',
    clsThreshold: 0.001, // Only log CLS changes above this threshold
    clsLogInterval: 5000, // Log CLS every 5 seconds if no significant change
  },
  
  // Firebase settings
  firebase: {
    cacheSize: 100 * 1024 * 1024, // 100MB cache
    enableOfflineSupport: true,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Error handling settings
  errorHandling: {
    suppressFirebaseConnectionErrors: true,
    showOfflineIndicator: true,
    logNetworkErrors: false, // Reduce console noise
  },
  
  // Bulk import settings
  bulkImport: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['.xlsx', '.xls', '.csv'],
    maxRows: 10000,
    autoMappingEnabled: true,
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  config.performance.enabled = false; // Disable in development to reduce noise
  config.errorHandling.logNetworkErrors = true; // Enable in development for debugging
}
