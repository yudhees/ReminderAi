import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"

// Called by the service worker (or the in-app alarm) when the user taps, stops or dismisses a reminder alert.
export default defineEventHandler(async (event) => {
    const { reminderId } = await readBody(event)
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), reminderId)
    session.set({ alert_repeats_left: 0, alert_next_at: null })
    await session.save()
    return { success: true }
})
