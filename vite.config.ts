import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// Quick-Obs deployes til GitHub Pages under et undermappe-repo:
// https://johnfinmann-ctrl.github.io/quick-obs/
// Uden "base" ville alle genererede asset-stier (JS/CSS/manifest/ikoner)
// pege paa domaenets rod og give 404 paa Pages.
export default defineConfig({
  base: '/quick-obs/',
  plugins: [
    react(),
    VitePWA({
      // Vores eget public/manifest.webmanifest (med felter og ikonstier
      // vi allerede kontrollerer) forbliver kilden - VitePWA styrer kun
      // selve service workeren.
      manifest: false,
      // "prompt" i stedet for "autoUpdate": brugeren skal selv bekraefte
      // en opdatering, saa appen ikke uventet genindlaeses midt i
      // udfyldelse af en rapport i felten.
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        // App-shell-cache: alt der skal til for at koere appen offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // SPA-fallback, saa navigation til /quick-obs/ virker offline -
        // husk base-praefikset.
        navigateFallback: '/quick-obs/index.html',
        // Undgaa at cache admin-/eksport-relaterede blob-URLs eller andet dynamisk.
        navigateFallbackDenylist: [/^\/quick-obs\/assets\/.*\.map$/],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
