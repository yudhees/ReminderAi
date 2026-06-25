interface User {
  name: string
  email: string
  image: string
}

export const useAuthStore = defineStore('auth', () => {
  const { data,signOut} = useAuth()

  const user = computed(() => {
    return data.value?.user ?? null as User| null
  })
  const logout=async()=>{
    await signOut()
    window.location.reload()
  }

  const isLoggedIn = computed(() => !!data.value?.user)

  return {
    user,
    isLoggedIn,
    logout,
  }
})