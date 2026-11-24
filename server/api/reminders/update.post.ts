import * as z from "zod"
import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { normalizeRecurrence } from "~~/server/utils/recurrence"

const bodySchema = z.object({
    id: z.string(),
    heading: z.string().trim().min(1).max(200).optional(),
    remind_time: z.string().optional(),
    // 'none', daily/weekly/monthly/yearly, weekdays/weekends, days:mon,wed or every:3h / every:2d / every:2w
    recurrence: z.string().trim().max(60).optional(),
})

export default defineEventHandler(async (event) => {
    const parsed = bodySchema.safeParse(await readBody(event))
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid reminder update' })
    }
    const { id, heading, remind_time, recurrence } = parsed.data
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), id)

    const update: Record<string, any> = {}
    if (heading !== undefined) update.heading = heading
    if (recurrence !== undefined) {
        const normalized = normalizeRecurrence(recurrence)
        if (!normalized && recurrence.toLowerCase() !== 'none') {
            throw createError({ statusCode: 400, statusMessage: 'Invalid repeat' })
        }
        update.recurrence = normalized
        update.recurrence_anchor = null
    }
    if (remind_time !== undefined) {
        const date = new Date(remind_time)
        if (isNaN(date.getTime())) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
        }
        if (date.getTime() <= Date.now()) {
            throw createError({ statusCode: 400, statusMessage: 'Reminder time must be in the future' })
        }
        update.remind_time = date
        update.recurrence_anchor = null
        update.notification_sent = false
        update.alert_repeats_left = 0
        update.alert_next_at = null
    }
    if (!Object.keys(update).length) {
        throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
    }

    session.set(update)
    await session.save()
    return {
        success: true,
        reminder: {
            _id: String(session._id),
            heading: session.heading,
            remind_time: session.remind_time,
            recurrence: session.recurrence ?? null,
            notification_sent: Boolean(session.notification_sent),
        },
    }
})
