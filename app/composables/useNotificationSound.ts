export function useNotificationSound() {
  const audioEnabled = ref(false)
  const audioContext = ref<AudioContext | null>(null)

  // Initialize audio context on first user interaction
  const initAudio = () => {
    if (!audioContext.value) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContext.value = new AudioContextClass()
        audioEnabled.value = true
        console.log('[NotificationSound] Audio context initialized')
      }
    } else if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
      audioEnabled.value = true
      console.log('[NotificationSound] Audio context resumed')
    }
  }

  // Play sound file
  const playSound = (soundFile: string) => {
    if (!audioEnabled.value) {
      console.log('[NotificationSound] Audio not enabled yet, waiting for user interaction')
      return
    }

    try {
      const audio = new Audio(`/sounds/${soundFile}`)
      audio.volume = 1.0
      audio.play().then(() => {
        console.log('[NotificationSound] Playing:', soundFile)
      }).catch(err => {
        console.error('[NotificationSound] Failed to play sound:', err)
      })
    } catch (error) {
      console.error('[NotificationSound] Error creating audio element:', error)
    }
  }

  // Listen for service worker messages
  if (process.client) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'playNotificationSound') {
        console.log('[NotificationSound] Received sound request:', event.data.sound)
        playSound(event.data.sound)
      }
    })

    // Initialize audio on first user interaction (browser autoplay policy)
    const handleUserInteraction = () => {
      initAudio()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
  }

  return {
    audioEnabled,
    playSound
  }
}
