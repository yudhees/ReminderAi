import moment from "moment-timezone"
import { ChatSession } from "~~/server/models/ChatSession"
import { requireAuthUser } from "~~/server/utils/global"

export default defineEventHandler(async (event) => {
    const user = await requireAuthUser(event)
    const userId = String(user._id)
    const query = getQuery(event)
    const timezone = typeof query.timezone === 'string' && moment.tz.zone(query.timezone) ? query.timezone : 'UTC'
    const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 20)

    const now = new Date()
    const endOfToday = moment.tz(timezone).endOf('day').toDate()
    const pending = { userId, remind_time: { $ne: null }, notification_sent: { $ne: true } }

    const [upcoming, dueToday, upcomingCount, recurringCount, doneCount] = await Promise.all([
        ChatSession.find({ ...pending, remind_time: { $gte: now } }, { heading: 1, remind_time: 1, recurrence: 1, notification_sent: 1 })
            .sort({ remind_time: 1 }).limit(limit).lean(),
        ChatSession.countDocuments({ ...pending, remind_time: { $gte: now, $lte: endOfToday } }),
        ChatSession.countDocuments({ ...pending, remind_time: { $gte: now } }),
        ChatSession.countDocuments({ userId, remind_time: { $ne: null }, recurrence: { $nin: [null, 'none'] } }),
        ChatSession.countDocuments({ userId, notification_sent: true }),
    ])

    return {
        success: true,
        counts: { dueToday, upcoming: upcomingCount, recurring: recurringCount, done: doneCount },
        upcoming: upcoming.map((r: any) => ({
            _id: String(r._id),
            heading: r.heading,
            remind_time: r.remind_time,
            recurrence: r.recurrence ?? null,
            notification_sent: Boolean(r.notification_sent),
        })),
    }
})
