import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/thailand-game/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'lib',   dest: '.' },
        { src: 'js',    dest: '.' },
        { src: 'img',   dest: '.' },
        { src: 'icons', dest: '.' },
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      manifest: {
        name: 'Thailand Avontuur',
        short_name: 'Thailand',
        description: 'Een avontuurlijk spel voor kinderen over jullie Thailand-reis',
        theme_color: '#0288D1',
        background_color: '#0D1B4B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/thailand-game/',
        scope: '/thailand-game/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
