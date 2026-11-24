
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

export const sendPushNotification = async (userId: string, title: string, body: string, reminderId: string, sound?: string, extra: Record<string, any> = {}) => {
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
                    icon: '/icons/web-app-manifest-192x192.png',
                    sound: sound || 'alarm.mp3',
                    url: `/chat/${reminderId}`,
                    ...extra,
                }),
                // high urgency + short TTL: deliver right away (wakes Android from doze), drop if stale
                { urgency: 'high', TTL: 300 }
            );
            results.push({ success: true, endpoint: subscription.endpoint })
        } catch (error) {
            console.error('Push notification failed for', subscription.endpoint, error);
            results.push({ success: false, endpoint: subscription.endpoint, error })
        }
    }
    return results
}
/**
 * A reminder was stopped or snoozed on one device: tell the user's other devices to stop ringing it.
 * `exceptEndpoint` is the device that pressed the button, so it isn't sent a needless push.
 */
export const sendStopRinging = async (userId: string, reminderId: string, opts: { exceptEndpoint?: string, deleted?: boolean, snoozed?: boolean } = {}) => {
    initWebPush()
    const subscriptions = await Subscription.find({ userId })
    const payload = JSON.stringify({ type: 'stopRinging', reminderId, deleted: Boolean(opts.deleted), snoozed: Boolean(opts.snoozed) })
    await Promise.all(subscriptions
        .filter((s: any) => s.endpoint && s.endpoint !== opts.exceptEndpoint)
        .map((s: any) => webpush.sendNotification(
            { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { urgency: 'high', TTL: 120 }
        ).catch(error => console.error('Stop-ringing push failed for', s.endpoint, error?.statusCode || error))))
}

/** True while a reminder is still alerting (ringing, or waiting to re-alert). */
export const isAlerting = (session: { alert_next_at?: Date | null, alert_repeats_left?: number | null }) =>
    Boolean(session?.alert_next_at) || Number(session?.alert_repeats_left || 0) > 0
