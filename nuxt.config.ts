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
          rel:"manifest",
          href:"/site.webmanifest"
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
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", '@sidebase/nuxt-auth', 'nuxt-mongoose', '@vueuse/nuxt','@vite-pwa/nuxt']
})