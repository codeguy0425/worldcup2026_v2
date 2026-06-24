import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.png'],
      manifest: {
        name: 'World Cup 2026',
        short_name: 'WC2026',
        description: 'World Cup 2026 — scores, standings, bracket',
        theme_color: '#010120',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/worldcup2026_v2/',
        scope: '/worldcup2026_v2/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Don't precache data files — always fetch fresh
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Network-first for JSON data so live scores are always fresh
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wc-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  base: '/worldcup2026_v2/',
})
