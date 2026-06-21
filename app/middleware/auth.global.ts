export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  // Return immediately if user is already authenticated
  if (status.value != 'authenticated' && to.path!='/') {
    return navigateTo("/")
  }
  return true;
})  