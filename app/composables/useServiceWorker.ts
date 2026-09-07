

export const useServiceWorker = () => {
    const config = useRuntimeConfig()
    const api = (options: RequestInit) => {
        return fetch('/api/push/subscribe', options)
    }
    const register = async () => {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register(
                '/service-worker.js'
            );

            console.log('Service worker registered:', registration);
        }
        const registration = await getRegistration()
        let subscription = await browserSubscriptionDetails()
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: config.public.vapidPublicKey
            });
        }
        await api({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        });
    }
    const getRegistration = async () => await navigator.serviceWorker.ready;
    const browserSubscriptionDetails = async () => {
        const registration = await getRegistration()
        const subscription = await registration.pushManager.getSubscription();
        return subscription
    }
    const unregister = async () => {
        const subscription = await browserSubscriptionDetails()
        if (subscription) {
            await api({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });
            await subscription.unsubscribe();
            console.log('Push subscription removed');
        }
    }
    return { register, unregister,browserSubscriptionDetails}
}