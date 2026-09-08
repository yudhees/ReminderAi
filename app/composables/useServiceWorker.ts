import { useNuxtApp } from '#app'

export const useServiceWorker = () => {
    const config = useRuntimeConfig()
    const nuxtApp = useNuxtApp()

    const api = (options: RequestInit) => {
        return fetch('/api/push/subscribe', options)
    }

    const getRegistration = async () => {
        // Check if we're in browser context
        if (process.client && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            try {
                // First try to get existing service worker
                const existingRegistration = await navigator.serviceWorker.getRegistration()
                if (existingRegistration) {
                    return existingRegistration
                }

                // Register the push-specific service worker
                const pushSWRegistration = await navigator.serviceWorker.register(
                    '/push-sw.js',
                    { scope: '/' }
                )
                console.log('Push service worker registered:', pushSWRegistration)
                return pushSWRegistration
            } catch (error) {
                console.error('Push service worker registration failed:', error)
                // Fallback to PWA service worker
                if (nuxtApp.$pwa?.swReady) {
                    return await nuxtApp.$pwa.swReady
                }
            }
        }
        return null
    }

    const browserSubscriptionDetails = async () => {
        const registration = await getRegistration()
        if (!registration) return null
        const subscription = await registration.pushManager.getSubscription();
        return subscription
    }

    const register = async () => {
        const registration = await getRegistration()
        if (!registration) {
            console.error('Service worker registration not available')
            return
        }

        let subscription = await browserSubscriptionDetails()
        if (!subscription) {
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: config.public.vapidPublicKey
                });
            } catch (error) {
                console.error('Push subscription failed:', error)
                throw error
            }
        }

        try {
            await api({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });
            console.log('Push subscription registered successfully')
        } catch (error) {
            console.error('Failed to send subscription to server:', error)
            throw error
        }
    }

    const unregister = async () => {
        const subscription = await browserSubscriptionDetails()
        if (subscription) {
            try {
                await api({
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscription)
                });
                await subscription.unsubscribe();
                console.log('Push subscription removed');
            } catch (error) {
                console.error('Failed to unregister push subscription:', error)
                throw error
            }
        }
    }

    return { register, unregister, browserSubscriptionDetails, getRegistration }
}