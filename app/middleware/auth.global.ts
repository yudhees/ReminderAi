export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  // Skip middleware for service worker, PWA files, and public assets
  const skipPaths = [
    '/sw.js',
    '/manifest.webmanifest',
    '/site.webmanifest',
    '/_nuxt/sw.js',
    '/_nuxt/workbox-',
    '/dev-sw-dist'
  ]

  const shouldSkip = skipPaths.some(path => to.path.startsWith(path)) ||
                     to.path.startsWith('/icons/') ||
                     to.path.startsWith('/sounds/') ||
                     to.path.includes('workbox-') ||
                     to.path.endsWith('.map') ||
                     to.path.startsWith('/.nuxt/')

  if (shouldSkip) {
    return
  }

  // Return immediately if user is already authenticated
  if (status.value != 'authenticated' && to.path!='/') {
    return navigateTo("/")
  }
  return true;
})  