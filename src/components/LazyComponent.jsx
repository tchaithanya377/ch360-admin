import React, { Suspense, lazy } from 'react';

// Loading spinner component
const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
};

// Skeleton loader component
const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded mb-2"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
    </div>
  );
};

// Lazy component wrapper with error boundary
export const LazyComponent = ({ 
  importFunc, 
  fallback = <LoadingSpinner />,
  errorFallback = null,
  ...props 
}) => {
  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center text-red-600">
          <p>Something went wrong loading this component.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preload component for critical components
export const preloadComponent = (importFunc) => {
  return () => {
    importFunc();
    return null;
  };
};

// Lazy loading with intersection observer
export const LazyComponentWithIntersection = ({ 
  importFunc, 
  fallback = <LoadingSpinner />,
  threshold = 0.1,
  rootMargin = '50px',
  ...props 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [Component, setComponent] = React.useState(null);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          importFunc().then((module) => {
            setComponent(() => module.default);
          });
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [importFunc, isVisible, threshold, rootMargin]);

  if (!isVisible) {
    return <div ref={ref}>{fallback}</div>;
  }

  if (!Component) {
    return <div ref={ref}>{fallback}</div>;
  }

  return <Component {...props} />;
};

export { LoadingSpinner, SkeletonLoader };
