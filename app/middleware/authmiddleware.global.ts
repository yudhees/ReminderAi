export default defineNuxtRouteMiddleware((to, from) => {
    if (to.path == '/') {
        return true;
    }
    const notAuthenticated=false;
    if(!notAuthenticated){
        return navigateTo("/")
    }

})
