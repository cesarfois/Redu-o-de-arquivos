import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for DocuWare Platform API
      '/DocuWare': {
        target: 'https://rcsangola.docuware.cloud',
        changeOrigin: true,
        secure: true,
      },
      // Proxy for Identity Service (login)
      '/docuware-proxy': {
        target: 'https://login-emea.docuware.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/docuware-proxy/, ''),
        secure: true,
      },
    },
  },
});
