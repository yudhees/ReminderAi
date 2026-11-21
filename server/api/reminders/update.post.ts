import * as z from "zod"
import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { normalizeRecurrence, RECURRENCE_OPTIONS } from "~~/server/utils/recurrence"

const bodySchema = z.object({
    id: z.string(),
    heading: z.string().trim().min(1).max(200).optional(),
    remind_time: z.string().optional(),
    recurrence: z.enum(RECURRENCE_OPTIONS).optional(),
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
    if (recurrence !== undefined) update.recurrence = normalizeRecurrence(recurrence)
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
