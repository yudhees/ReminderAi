// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  tailwindcss: {
    cssPath: "~/assets/theme.css",
  },
  runtimeConfig: {
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY
    }
  },
  app: {
    head: {
      link: [
         {
          rel: 'icon',
          type: 'image/png',
          href: '/icons/favicon.png',
          sizes:"96x96"
        },
         {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/icons/favicon.svg',
        },
         {
          rel: 'shortcut icon',
          href: '/icons/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/icons/apple-touch-icon.png',
          sizes:"80x180"
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'
        },
      ],
      meta:[
        {name:"description",content:"Easy Reminders"},
        {name: 'apple-mobile-web-app-title',content: 'Reminder'}
      ],
      title: "Reminza"
    }
  },
  mongoose: {
    uri: process.env.NUXT_MONGOOSE_URI,
    options: {
      readPreference: "primaryPreferred",
      readConcernLevel: "majority",
      retryWrites: true,
      dbName: "ReminderAI",
      autoIndex: true,
    },
    modelsDir: 'models',
  },
  auth: {
    provider: {
      type: 'authjs',
      defaultProvider: "google",
    },
    globalAppMiddleware: true,
  },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", '@sidebase/nuxt-auth', 'nuxt-mongoose', '@vueuse/nuxt','@vite-pwa/nuxt'],
  pwa: {
    register: true,
    strategies: 'generateSW',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    manifest: {
      name: 'Reminza - AI Reminders',
      short_name: 'Reminza',
      description: 'Easy AI-powered reminders',
      theme_color: '#0f0f15',
      background_color: '#0f0f15',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/web-app-manifest-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/web-app-manifest-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})