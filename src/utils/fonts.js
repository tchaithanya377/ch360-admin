// Font loading optimization
// Only import fonts that are actually installed and available
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Additional fonts (only if needed)
// import '@fontsource/open-sans/300.css';
// import '@fontsource/open-sans/400.css';
// import '@fontsource/open-sans/500.css';
// import '@fontsource/open-sans/600.css';
// import '@fontsource/open-sans/700.css';
// import '@fontsource/open-sans/800.css';

// import '@fontsource/poppins/300.css';
// import '@fontsource/poppins/400.css';
// import '@fontsource/poppins/500.css';
// import '@fontsource/poppins/600.css';
// import '@fontsource/poppins/700.css';

// import '@fontsource/montserrat/300.css';
// import '@fontsource/montserrat/400.css';
// import '@fontsource/montserrat/500.css';
// import '@fontsource/montserrat/600.css';
// import '@fontsource/montserrat/700.css';

// Font loading strategy
export const fontLoadingStrategy = {
  // Preload critical fonts
  preload: [
    'Inter',
    'Roboto',
  ],
  
  // Font display strategy
  display: 'swap',
  
  // Font fallbacks
  fallbacks: {
    'Inter': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'Roboto': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Additional fonts can be uncommented when needed
    // 'Open Sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // 'Poppins': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // 'Montserrat': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};

// Font loading utility
export const loadFont = (fontFamily, weights = [400]) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  
  weights.forEach(weight => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = `/fonts/${fontFamily}-${weight}.woff2`;
    document.head.appendChild(fontLink);
  });
};

// Font loading observer
export const observeFontLoading = (fontFamily) => {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`1em ${fontFamily}`).then(() => {
        resolve();
      });
    } else {
      // Fallback for older browsers
      setTimeout(resolve, 100);
    }
  });
};
