import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        'rate-packages': './rate-packages.html',
        'rate-types': './rate-types.html',
        'banks': './banks.html',
        'bankers': './bankers.html',
        'admin-users': './admin-users.html',
        'recommended-packages': './recommended-packages.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});