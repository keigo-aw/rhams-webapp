import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base defaults to '/' for local dev; the Pages workflow sets VITE_BASE to '/<repo>/'
// so the deployed build loads assets from the correct GitHub Pages subpath.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
