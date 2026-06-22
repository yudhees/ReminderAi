interface User {
  name: string
  email: string
  image: string
}

export const useAuthStore = defineStore('auth', () => {
  const { data } = useAuth()

  const user = computed(() => {
    return data.value?.user ?? null as User| null
  })

  const isLoggedIn = computed(() => !!data.value?.user)

  return {
    user,
    isLoggedIn,
  }
})