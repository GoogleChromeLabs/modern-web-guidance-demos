import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'bookstore-app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'bookstore-app/index.html'),
        about: resolve(__dirname, 'bookstore-app/about.html'),
        contact: resolve(__dirname, 'bookstore-app/contact.html'),
      },
    },
  },
});
