export default defineEventHandler((event) => {
  // Handle workbox files and service worker files
  if (event.path.includes('workbox-') || event.path.endsWith('.map') || event.path === '/sw.js') {
    setResponseStatus(event, 200)
    setHeader(event, 'Content-Type', 'application/javascript')
    setHeader(event, 'Cache-Control', 'public, max-age=0')
    return '' // Let the PWA module handle these
  }
  
  setResponseStatus(event, 404)
  return 'Not found'
})
