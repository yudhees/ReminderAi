
export function usePushNotifications() {
  const { register, unregister, browserSubscriptionDetails } = useServiceWorker()
  const { isSupported: isSupportedWeb, permissionGranted } = useWebNotification()
  const isSupported = computed(() => isSupportedWeb.value && permissionGranted.value)

  // Only check subscription details on client side
  const hasAlreadySubscribed = ref(false)

  if (process.client) {
    onMounted(async () => {
      hasAlreadySubscribed.value = await subscriptionDetails()
    })
  }

  async function enableNotifications() {
    if (!isSupportedWeb.value) {
      const text = "Push notifications are not supported"
      alert(text)
      throw new Error(text)
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      const text = "Notification permission denied"
      alert(text)
      throw new Error(text)
    }
    if (permission == 'granted') {
      await register()
    }
  }

  async function subscriptionDetails() {
    try {
      const details = (await browserSubscriptionDetails())?.toJSON()
      if (!details?.keys) return false
      const res = await $fetch('/api/push/subscription', {
        method: "POST",
        body: { keys: details?.keys, endpoint: details?.endpoint }
      })
      return res.subscriptionExists
    } catch (error) {
      console.error('Failed to check subscription details:', error)
      return false
    }
  }

  return {
    unregister,
    isSupported,
    hasAlreadySubscribed,
    enableNotifications
  }
}