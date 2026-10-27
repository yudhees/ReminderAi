
import webpush from "web-push";
import { Subscription } from '~~/server/models/Subscription';

const initWebPush = () => {
    const config = useRuntimeConfig()
    const vapidPrivateKey = config.vapidPrivateKey
    const validPublicKey = config.public.vapidPublicKey
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL || "mailto:noreply@reminza.com",
        validPublicKey,
        vapidPrivateKey
    );
}

export const sendPushNotification = async (userId: string, title: string, body: string, reminderId: string) => {
    initWebPush()
    const subscriptions = await Subscription.find({ userId })

    const results = []
    for (const subscription of subscriptions) {
        try {
            const data = {
                endpoint: subscription.endpoint,
                expirationTime: null,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                }
            }
            await webpush.sendNotification(
                data,
                JSON.stringify({
                    title,
                    body,
                    reminderId,
                    icon: '/icons/web-app-manifest-192x192.png'
                })
            );
            results.push({ success: true, endpoint: subscription.endpoint })
        } catch (error) {
            console.error('Push notification failed for', subscription.endpoint, error);
            results.push({ success: false, endpoint: subscription.endpoint, error })
        }
    }
    return results
}