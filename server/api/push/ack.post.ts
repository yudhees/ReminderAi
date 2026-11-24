import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { deleteReminderChat, isOneTimeReminder } from "~~/server/utils/reminderCleanup"
import { isAlerting, sendStopRinging } from "~~/server/utils/sentpush"

// Called by the service worker (or the in-app alarm) when the user taps, stops or dismisses a reminder alert.
export default defineEventHandler(async (event) => {
    const { reminderId, endpoint } = await readBody(event)
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), reminderId)
    // Stopped on this device: silence it on the user's other devices too (only if it was still alerting).
    const stopOthers = (deleted: boolean) => isAlerting(session)
        ? sendStopRinging(String(user._id), String(session._id), { exceptEndpoint: typeof endpoint === 'string' ? endpoint : undefined, deleted })
        : Promise.resolve()
    // A one-time reminder that already fired is finished once the user stops it: delete its chat.
    if (session.notification_sent && isOneTimeReminder(session)) {
        await deleteReminderChat(String(session._id))
        await stopOthers(true)
        return { success: true, deleted: true }
    }
    const wasAlerting = isAlerting(session)
    session.set({ alert_repeats_left: 0, alert_next_at: null })
    await session.save()
    if (wasAlerting) await sendStopRinging(String(user._id), String(session._id), { exceptEndpoint: typeof endpoint === 'string' ? endpoint : undefined })
    return { success: true, deleted: false }
})
