import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('pwa:swReady', (registration) => {
    console.log('PWA Service Worker is ready', registration)
  })

  nuxtApp.hook('pwa:registered', (registration) => {
    console.log('PWA Service Worker registered', registration)
  })

  nuxtApp.hook('pwa:cached', (registration) => {
    console.log('PWA content cached', registration)
  })

  nuxtApp.hook('pwa:updatefound', (registration) => {
    console.log('PWA update found', registration)
  })

  nuxtApp.hook('pwa:updated', (registration) => {
    console.log('PWA content updated', registration)
    // Reload page to apply update
    if (confirm('New content available, reload to update?')) {
      window.location.reload()
    }
  })
})
