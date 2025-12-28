  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  // https://vite.dev/config/
  export default defineConfig({
    plugins: [react()],
    base: './', // CRITICAL for Electron: ensures assets are loaded relative to index.html
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  })
