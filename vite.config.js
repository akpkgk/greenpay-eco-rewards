
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
        partners: 'partners.html',
        'how-it-works': 'how-it-works.html',
        wallet: 'wallet.html',
        admin: 'admin.html'
      }
    }
  }
}));
