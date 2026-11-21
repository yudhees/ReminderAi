import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { normalizeRecurrence } from "~~/server/utils/recurrence"

const MAX_SNOOZE_MINUTES = 7 * 24 * 60

export default defineEventHandler(async (event) => {
    const { chatId, minutes } = await readBody(event)
    const mins = Number(minutes)
    if (!Number.isFinite(mins) || mins < 1 || mins > MAX_SNOOZE_MINUTES) {
        throw createError({ statusCode: 400, statusMessage: 'Snooze must be between 1 minute and 7 days' })
    }
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), chatId)
    if (!session.remind_time) {
        throw createError({ statusCode: 400, statusMessage: 'This chat has no reminder to snooze yet' })
    }

    const snoozedUntil = new Date(Date.now() + Math.round(mins) * 60 * 1000)
    snoozedUntil.setSeconds(0, 0)
    const update: Record<string, any> = {
        remind_time: snoozedUntil,
        notification_sent: false,
    }
    // For a repeating reminder, remember the regular schedule so only this occurrence moves.
    if (normalizeRecurrence(session.recurrence) && !session.recurrence_anchor) {
        update.recurrence_anchor = session.remind_time
    }
    session.set(update)
    await session.save()

    return {
        success: true,
        remind_time: snoozedUntil,
    }
})
