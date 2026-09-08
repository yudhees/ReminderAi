
import webpush from "web-push";
import { Subscription } from '~~/server/models/Subscription';

const initWebPush = () => {
    const config = useRuntimeConfig()
    const vapidPrivateKey = config.vapidPrivateKey
    const validPublicKey = config.public.vapidPublicKey
    webpush.setVapidDetails(
        "mailto:yudees479@gmail.com",
        validPublicKey,
        vapidPrivateKey
    );

}
export const sendPushNotification = async () => {
    initWebPush()
    const subscription = await Subscription.findOne()
    const data =
    {
        "endpoint": subscription.endpoint,
        "expirationTime": null,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth
        }
    }
    await webpush.sendNotification(
            data,
            JSON.stringify({
                title: "Reminder",
                body: "Pay electricity bill",
                reminderId: "123"
            })
        );
    }