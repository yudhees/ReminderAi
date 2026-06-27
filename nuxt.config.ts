// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  tailwindcss: {
    cssPath: "~/assets/theme.css",
  },
   runtimeConfig: {
    public: {
      // apiBase: process.env.NUXT_PUBLIC_API_BASE,
      // appUrl:process.env.NUXT_APP_URL
    }
  },
  app: {
    head: {
      link: [
        // { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        // { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // { rel: 'shortcut icon',href:`${process.env.NUXT_PUBLIC_API_BASE}assets/img/favicon.png`, type:"image/x-icon"},
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'
        },
      ],
      script:[
   
      ],
      title:"Reminza"
    }
  },
  mongoose: {
    uri: process.env.NUXT_MONGOOSE_URI,
    options: {
      readPreference:"primaryPreferred",
      readConcernLevel:"majority",
      retryWrites:true,
      dbName:"ReminderAI",
      autoIndex:true,
    },
    modelsDir: 'models',
  },
  auth: {
    provider: {
      type: 'authjs',
      defaultProvider:"google",
    },
    globalAppMiddleware:true,
  },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", '@sidebase/nuxt-auth', 'nuxt-mongoose']
})