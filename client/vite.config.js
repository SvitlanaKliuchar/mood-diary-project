import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When the URL starts with /api, proxy the request to the target
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Optionally rewrite the path: remove /api prefix before sending to backend
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
