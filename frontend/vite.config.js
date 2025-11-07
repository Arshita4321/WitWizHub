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
  build: {
    outDir: 'dist', // 👈 This tells Vercel where to find your built files
  },
  base: '/', // 👈 Ensures all routes resolve correctly after refreshing
});
