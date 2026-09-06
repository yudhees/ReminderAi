
export function usePushNotifications() {
  const config = useRuntimeConfig()
 const {isSupported:isSupportedWeb,permissionGranted}=useWebNotification()

  const isSupported = computed(() =>isSupportedWeb.value && permissionGranted.value)

  async function enableNotifications() {
    if (!isSupported.value) {
      throw new Error(
        'Push notifications are not supported'
      )
    }

    const permission =
      await Notification.requestPermission()

    if (permission !== 'granted') {
      throw new Error(
        'Notification permission denied'
      )
    }

    const registration =
      await navigator.serviceWorker.ready

    let subscription =
      await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              config.public.vapidPublicKey
            )
        })
    }

    await $fetch('/api/push/subscribe', {
      method: 'POST',

      body: subscription
    })

    return subscription
  }

  return {
    isSupported,
    enableNotifications
  }
}

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    '='.repeat(
      (4 - (base64String.length % 4)) % 4
    )

  const base64 =
    (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

  const rawData =
    window.atob(base64)

  return Uint8Array.from(
    [...rawData].map(
      char => char.charCodeAt(0)
    )
  )
}