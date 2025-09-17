import React from 'react';
import { config } from './config.js';

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = config.performance.enabled;
  }

  // Start timing a performance metric
  startTimer(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  }

  // End timing a performance metric
  endTimer(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log to console in development
      console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
      
      // Send to analytics if available
      this.sendToAnalytics(name, metric.duration);
    }
  }

  // Measure component render time
  measureRender(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();
    
    this.startTimer(`render_${componentName}`);
    const result = renderFn();
    this.endTimer(`render_${componentName}`);
    
    return result;
  }

  // Measure async operations
  async measureAsync(name, asyncFn) {
    if (!this.isEnabled) return await asyncFn();
    
    this.startTimer(`async_${name}`);
    try {
      const result = await asyncFn();
      this.endTimer(`async_${name}`);
      return result;
    } catch (error) {
      this.endTimer(`async_${name}_error`);
      throw error;
    }
  }

  // Monitor memory usage
  measureMemory() {
    if (!this.isEnabled || !performance.memory) return null;
    
    const memory = performance.memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  // Monitor network performance
  measureNetwork() {
    if (!this.isEnabled || !navigator.connection) return null;
    
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  // Monitor Core Web Vitals
  observeCoreWebVitals() {
    if (!this.isEnabled) return;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 LCP:', lastEntry.startTime.toFixed(2), 'ms');
        this.sendToAnalytics('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('⚡ FID:', entry.processingStart - entry.startTime, 'ms');
          this.sendToAnalytics('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS) - Reduced logging frequency
      let clsValue = 0;
      let lastClsLog = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        // Only log CLS if it changes significantly or at regular intervals
        const now = Date.now();
        if (Math.abs(clsValue - lastClsLog) > config.performance.clsThreshold || 
            now - lastClsLog > config.performance.clsLogInterval) {
          console.log('📐 CLS:', clsValue.toFixed(4));
          this.sendToAnalytics('CLS', clsValue);
          lastClsLog = clsValue;
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Monitor bundle size
  measureBundleSize() {
    if (!this.isEnabled) return;
    
    // This would typically be done at build time
    // For runtime, we can measure script loading time
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const startTime = performance.now();
      script.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`📦 Script loaded: ${script.src} in ${loadTime.toFixed(2)}ms`);
      });
    });
  }

  // Monitor component mount/unmount
  observeComponentLifecycle(componentName) {
    if (!this.isEnabled) return;
    
    return {
      onMount: () => {
        this.startTimer(`mount_${componentName}`);
      },
      onUnmount: () => {
        this.endTimer(`mount_${componentName}`);
      },
    };
  }

  // Monitor re-renders
  observeRenders(componentName) {
    if (!this.isEnabled) return () => {};
    
    let renderCount = 0;
    return () => {
      renderCount++;
      console.log(`🔄 ${componentName} rendered ${renderCount} times`);
    };
  }

  // Send metrics to analytics
  sendToAnalytics(name, value) {
    // Implement your analytics service here
    // Example: Google Analytics, Sentry, etc.
    if (window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(value),
      });
    }
  }

  // Get performance report
  getReport() {
    const report = {
      metrics: Object.fromEntries(this.metrics),
      memory: this.measureMemory(),
      network: this.measureNetwork(),
      timestamp: new Date().toISOString(),
    };
    
    return report;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef(null);

  React.useEffect(() => {
    mountTime.current = performance.now();
    performanceMonitor.startTimer(`mount_${componentName}`);
    
    return () => {
      performanceMonitor.endTimer(`mount_${componentName}`);
    };
  }, [componentName]);

  React.useEffect(() => {
    renderCount.current += 1;
    performanceMonitor.startTimer(`render_${componentName}_${renderCount.current}`);
    
    return () => {
      performanceMonitor.endTimer(`render_${componentName}_${renderCount.current}`);
    };
  });

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    usePerformanceMonitor(componentName);
    return <WrappedComponent {...props} />;
  };
};
