import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.jpeg'],
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
            src: 'icon-512.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
        ],
      },
    }),
  ],
  base: '/worldcup2026_v2/',
})
