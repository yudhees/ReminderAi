import { useNuxtApp } from '#app'

export const useServiceWorker = () => {
    const config = useRuntimeConfig()
    const nuxtApp = useNuxtApp()

    const api = (options: RequestInit) => {
        return fetch('/api/push/subscribe', options)
    }

    const getRegistration = async () => {
        try {
            // Use the PWA service worker (now handles both caching and push)
            // if (nuxtApp.$pwa?.swReady) {
            //     return await nuxtApp.$pwa.swReady
            // }

            // Fallback to manual registration
            const existingRegistration =
                await navigator.serviceWorker.getRegistration('/')       
            console.log(existingRegistration?.active?.scriptURL);
                 
            if (
                existingRegistration &&
                existingRegistration.active?.scriptURL.includes('/sw.js')
            ) {
                return existingRegistration
            }
            // const swRegistration =
            //     await navigator.serviceWorker.register('/sw.js', {
            //         scope: '/',
            //     })

            // console.log('Service worker registered:', swRegistration)
            // return swRegistration
        } catch (error) {
            console.error('Service worker registration failed:', error)
        }
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