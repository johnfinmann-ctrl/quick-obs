import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Quick-Obs deployes til GitHub Pages under et undermappe-repo:
// https://johnfinmann-ctrl.github.io/quick-obs/
// Uden "base" ville alle genererede asset-stier (JS/CSS/manifest/ikoner)
// pege paa domaenets rod og give 404 paa Pages.
export default defineConfig({
  base: '/quick-obs/',
  plugins: [react()],
})
