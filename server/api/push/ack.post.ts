import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { deleteReminderChat, isOneTimeReminder } from "~~/server/utils/reminderCleanup"

// Called by the service worker (or the in-app alarm) when the user taps, stops or dismisses a reminder alert.
export default defineEventHandler(async (event) => {
    const { reminderId } = await readBody(event)
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), reminderId)
    // A one-time reminder that already fired is finished once the user stops it: delete its chat.
    if (session.notification_sent && isOneTimeReminder(session)) {
        await deleteReminderChat(String(session._id))
        return { success: true, deleted: true }
    }
    session.set({ alert_repeats_left: 0, alert_next_at: null })
    await session.save()
    return { success: true, deleted: false }
})
