import { ChatSession } from '../models/ChatSession'
import { ChatHistory } from '../models/ChatHistory'
import { CheckPointWrites } from '../models/CheckPointWrites'
import { Checkpoints } from '../models/CheckPoints'
import { normalizeRecurrence } from './recurrence'

/** One-time = no repeat schedule. */
export const isOneTimeReminder = (reminder: { recurrence?: unknown }) => !normalizeRecurrence(reminder?.recurrence)

/**
 * A finished one-time reminder whose chat should now be deleted:
 * it fired, nobody snoozed it, alerts are over, and its grace minute has passed.
 */
export const finishedOneTimeFilter = (now: Date) => ({
    recurrence: { $in: [null, 'none'] },
    notification_sent: true,
    alert_repeats_left: { $lte: 0 },
    alert_next_at: { $lte: now, $ne: null },
})

/** Deletes the reminder's chat: messages, AI memory and the session itself. */
export async function deleteReminderChat(sessionId: string) {
    await ChatHistory.deleteMany({ sessionId })
    await CheckPointWrites.deleteMany({ thread_id: sessionId })
    await Checkpoints.deleteMany({ thread_id: sessionId })
    await ChatSession.deleteOne({ _id: sessionId })
}
