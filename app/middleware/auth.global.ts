export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  // Skip middleware for service worker, PWA files, and public assets
  if (to.path === '/sw.js' || to.path === '/push-sw.js' || to.path === '/site.webmanifest' || to.path.startsWith('/icons/') || to.path.startsWith('/sounds/')) {
    return
  }

  // Return immediately if user is already authenticated
  if (status.value != 'authenticated' && to.path!='/') {
    return navigateTo("/")
  }
  return true;
})  