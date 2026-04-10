import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // يحدث الـ Service Worker تلقائياً
      manifest: {
        name: 'تجويد - رفيقك في تلاوة القرآن', // اسم التطبيق الكامل
        short_name: 'تجويد', // الاسم المختصر يظهر تحت الأيقونة
        description: 'تطبيق شامل للقرآن الكريم، الأذكار، مواقيت الصلاة، وأسئلة دينية',
        theme_color: '#6B744E', // اللون الأساسي اللي حطيتوه
        background_color: '#ffffff',
        display: 'standalone', // يخلي التطبيق يفتح في نافذة مستقلة
        start_url: '/', // الصفحة اللي تفتح عند بدء التطبيق
        icons: [
          {
            src: '/icons/icon-192x192.png', // المسار لصورة 192x192
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png', // المسار لصورة 512x512
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // يجعل الأيقونة تظهر بشكل أفضل
          },
        ],
      },
    }),
  ],
})
