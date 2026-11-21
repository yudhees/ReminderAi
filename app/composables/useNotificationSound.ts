type ActiveAlarm = {
  reminderId: string
  title: string
  body: string
  sound: string
}

// Shared across the app: one alarm audio element and the reminder that is currently ringing.
let audio: HTMLAudioElement | null = null
let unlocked = false
let listenersAttached = false
let stopTimer: ReturnType<typeof setTimeout> | null = null

// Stop ringing on its own after this long, in case the phone is left alone.
const MAX_RING_MS = 60 * 1000

export function useNotificationSound() {
  const activeAlarm = useState<ActiveAlarm | null>('activeAlarm', () => null)
  const needsTap = useState<boolean>('alarmNeedsTap', () => false)

  const ensureAudio = () => {
    if (!audio) {
      audio = new Audio()
      audio.preload = 'auto'
    }
    return audio
  }

  // Browsers only allow sound after the user has touched the page once.
  // A silent play/pause on the first touch "unlocks" the element for later alarms.
  const unlock = () => {
    if (unlocked) return
    const el = ensureAudio()
    el.src = '/sounds/alarm.mp3'
    el.muted = true
    el.play().then(() => {
      el.pause()
      el.currentTime = 0
      el.muted = false
      unlocked = true
    }).catch(() => { el.muted = false })
  }

  const stopSound = () => {
    if (stopTimer) clearTimeout(stopTimer)
    stopTimer = null
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.loop = false
    }
    if ('vibrate' in navigator) navigator.vibrate(0)
  }

  /** Plays a sound once (profile preview) or on loop (alarm). */
  const playSound = async (soundFile: string, loop = false) => {
    const el = ensureAudio()
    el.src = `/sounds/${soundFile || 'alarm.mp3'}`
    el.loop = loop
    el.volume = 1.0
    try {
      await el.play()
      needsTap.value = false
      return true
    } catch (err) {
      console.error('[NotificationSound] Failed to play sound:', err)
      needsTap.value = loop
      return false
    }
  }

  const startAlarm = async (alarm: ActiveAlarm) => {
    activeAlarm.value = alarm
    if ('vibrate' in navigator) navigator.vibrate([800, 300, 800, 300, 800])
    await playSound(alarm.sound, true)
    if (stopTimer) clearTimeout(stopTimer)
    stopTimer = setTimeout(() => stopSound(), MAX_RING_MS)
  }

  // The server deletes a one-time reminder once it's stopped: remove it from the sidebar and leave its chat.
  const nuxtApp = useNuxtApp()
  const onReminderDeleted = (reminderId: string) => {
    nuxtApp.runWithContext(() => {
      try {
        useChatSideBarStore().dropLocal(reminderId)
        const router = nuxtApp.$router as any
        const route = router.currentRoute.value
        if (route.name === 'chat-id' && route.params.id === reminderId) router.replace({ name: 'dashboard' })
      } catch (e) { console.error(e) }
    })
  }

  const closeSystemNotification = async (reminderId: string) => {
    try {
      const reg = await navigator.serviceWorker?.getRegistration('/')
      const notifications = await reg?.getNotifications({ tag: reminderId })
      notifications?.forEach(n => n.close())
    } catch (e) { /* not supported */ }
  }

  /** Stop button: silence the phone and tell the server to stop re-alerting. */
  const dismissAlarm = async () => {
    const alarm = activeAlarm.value
    stopSound()
    activeAlarm.value = null
    needsTap.value = false
    if (!alarm) return
    closeSystemNotification(alarm.reminderId)
    try {
      const res: any = await $fetch('/api/push/ack', { method: 'POST', body: { reminderId: alarm.reminderId } })
      if (res?.deleted) onReminderDeleted(alarm.reminderId)
    } catch (e) { console.error(e) }
  }

  const snoozeAlarm = async (minutes = 10) => {
    const alarm = activeAlarm.value
    stopSound()
    activeAlarm.value = null
    needsTap.value = false
    if (!alarm) return
    closeSystemNotification(alarm.reminderId)
    try {
      await $fetch('/api/chat/snooze', { method: 'POST', body: { chatId: alarm.reminderId, minutes } })
    } catch (e) { console.error(e) }
  }

  /** For the "Tap to play" fallback when the browser blocked autoplay. */
  const retryAlarmSound = () => {
    if (activeAlarm.value) playSound(activeAlarm.value.sound, true)
  }

  if (import.meta.client && !listenersAttached && 'serviceWorker' in navigator) {
    listenersAttached = true
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data
      if (!data) return
      if (data.type === 'playNotificationSound') {
        startAlarm({
          reminderId: data.reminderId,
          title: data.title || 'Reminder',
          body: data.body || '',
          sound: data.sound || 'alarm.mp3',
        })
      } else if (data.type === 'reminderDeleted') {
        onReminderDeleted(data.reminderId)
      } else if (data.type === 'stopNotificationSound') {
        if (!data.reminderId || activeAlarm.value?.reminderId === data.reminderId) {
          stopSound()
          activeAlarm.value = null
          needsTap.value = false
        }
      }
    })

    const handleUserInteraction = () => {
      unlock()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
  }

  return {
    activeAlarm,
    needsTap,
    audioEnabled: computed(() => unlocked),
    playSound,
    startAlarm,
    stopSound,
    dismissAlarm,
    snoozeAlarm,
    retryAlarmSound,
  }
}
