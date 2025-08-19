import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/eKapusta/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: '💰 Kapusta - Мої заощадження',
        short_name: 'Kapusta',
        description: 'Відстежуйте свої заощадження та витрати з красивими звітами',
        theme_color: '#3b82f6',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.NODE_ENV === 'production' ? '/eKapusta/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/eKapusta/' : '/',
        lang: 'uk-UA',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Додати заощадження',
            short_name: 'Додати',
            description: 'Швидко додати нове заощадження',
            url: process.env.NODE_ENV === 'production' ? '/eKapusta/?action=add' : '/?action=add',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Переглянути звіти',
            short_name: 'Звіти',
            description: 'Відкрити сторінку звітів',
            url: process.env.NODE_ENV === 'production' ? '/eKapusta/reports' : '/reports',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: process.env.NODE_ENV === 'production' ? '/eKapusta/index.html' : '/index.html',
        navigateFallbackDenylist: [/^\/_/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
