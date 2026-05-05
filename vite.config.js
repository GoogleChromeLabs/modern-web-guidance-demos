import { defineConfig } from 'vite';

export default defineConfig({
  root: 'bookstore-app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
