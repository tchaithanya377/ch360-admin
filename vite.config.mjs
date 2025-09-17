import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'firebase/firestore': path.resolve(__dirname, 'src/firebase-stubs/firestore.js'),
      'firebase/auth': path.resolve(__dirname, 'src/firebase-stubs/auth.js'),
      'firebase/storage': path.resolve(__dirname, 'src/firebase-stubs/storage.js'),
    },
  },
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://campushub-backend1.onrender.com http://127.0.0.1:8000 http://localhost:8000 http://13.232.220.214:8000 http://13.232.220.214:* https://13.232.220.214:8000 https://13.232.220.214:*; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  assetsInclude: ['**/*.manifest.json', '**/*.webmanifest'],
  define: {
    __VITE_APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});


