import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
    }),
  ],

  server: {
    host: true,        // OR "0.0.0.0"
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: 'dist',
  },

  base: '/',
});