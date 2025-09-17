import React from "react";

export const Notice = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  
  const styles = type === 'error'
    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    : type === 'success'
      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      
  return (
    <div className={`border ${styles} rounded-lg px-4 py-3 flex items-start justify-between shadow-sm`}>
      <div className="text-sm font-medium">{message}</div>
      {onClose && (
        <button 
          className="ml-4 text-xs opacity-70 hover:opacity-100 transition-opacity duration-200" 
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const Spinner = ({ size = 'sm' }) => {
  const dims = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <div className={`inline-block ${dims} border-2 border-gray-300 dark:border-gray-600 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin`} />
  );
};

// Form controls with enhanced styling
const baseInput = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200";

export const Field = ({ label, children, hint, error, required }) => (
  <div className="space-y-1">
    {label && (
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {hint && !error && (
      <div className="text-xs text-gray-500 dark:text-gray-400">{hint}</div>
    )}
    {error && (
      <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <span>⚠</span>
        {error}
      </div>
    )}
  </div>
);

export const TextInput = (props) => (
  <input {...props} className={`${baseInput} ${props.className||''}`} />
);

export const NumberInput = (props) => (
  <input type="number" {...props} className={`${baseInput} ${props.className||''}`} />
);

export const Select = ({ children, className, ...rest }) => (
  <select {...rest} className={`${baseInput} ${className||''}`}>
    {children}
  </select>
);

export const TextArea = (props) => (
  <textarea {...props} className={`${baseInput} ${props.className||''}`} />
);

// Additional UI components
export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "", header, footer }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    {header && (
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        {header}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
    {footer && (
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        {footer}
      </div>
    )}
  </div>
);


