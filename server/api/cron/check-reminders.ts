import { ChatSession } from '../../models/ChatSession';
import { User } from '../../models/users';
import EmailService from '../../service/EmailService';
import { sendPushNotification } from '../../utils/sentpush';
import { nextOccurrence, normalizeRecurrence } from '../../utils/recurrence';
import { deleteReminderChat, finishedOneTimeFilter } from '../../utils/reminderCleanup';

// After the first alert, keep re-alerting the phone this many times (one per cron run, ~1 min apart)
// until the user taps, snoozes, stops or swipes the notification away.
const RING_REPEATS = 4;
const RING_INTERVAL_MS = 60 * 1000;
const soundFile = (user: any) => (user?.notification_sound ? `${user.notification_sound}.mp3` : 'alarm.mp3');

/**
 * Sends every due reminder once.
 * - One-time reminders are marked as sent, kept while they ring (so they can still be snoozed),
 *   and their chat is deleted once the user stops them or a minute after the last alert.
 * - Recurring reminders are moved to their next occurrence.
 * Each reminder is claimed with a conditional update before sending, so two
 * overlapping cron runs can't deliver the same reminder twice.
 */
export default defineEventHandler(async (event) => {
    try {
        const now = new Date();

        const dueReminders = await ChatSession.find({
            remind_time: { $lte: now, $ne: null },
            notification_sent: { $ne: true },
        }).lean();

        console.log(`Found ${dueReminders.length} due reminders`);

        const userIds = [...new Set(dueReminders.map((r: any) => String(r.userId)).filter(Boolean))];
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const usersById = new Map(users.map((u: any) => [String(u._id), u]));

        const emailService = new EmailService();
        const results = [];

        for (const reminder of dueReminders as any[]) {
            const recurrence = normalizeRecurrence(reminder.recurrence);
            const nextTime = recurrence
                ? nextOccurrence(reminder.recurrence_anchor ?? reminder.remind_time, recurrence, reminder.timezone, now)
                : null;

            // Claim the reminder: only succeeds if nobody else changed it since we read it.
            const claimUpdate: Record<string, any> = nextTime
                ? { $set: { remind_time: nextTime, recurrence_anchor: null, notification_sent_at: now } }
                : { $set: { notification_sent: true, notification_sent_at: now } };
            // Clear any ringing left over from a previous occurrence.
            claimUpdate.$set.alert_repeats_left = 0;
            claimUpdate.$set.alert_next_at = null;
            const claim = await ChatSession.updateOne(
                { _id: reminder._id, remind_time: reminder.remind_time, notification_sent: { $ne: true } },
                claimUpdate
            );
            if (!claim.modifiedCount) continue;

            const user: any = usersById.get(String(reminder.userId));
            const sentMethods: string[] = [];

            if (user?.push_notification) {
                try {
                    const pushResults = await sendPushNotification(
                        String(user._id),
                        'Reminder',
                        reminder.heading,
                        String(reminder._id),
                        soundFile(user),
                        { ring: true, attempt: 1, oneTime: !nextTime, ...(nextTime ? {} : { url: '/dashboard' }) }
                    );
                    if (pushResults.some((r: any) => r.success)) sentMethods.push('push');
                } catch (error) {
                    console.error('Push notification failed:', error);
                }
            }

            if (user?.email_reminders) {
                const emailResult = await emailService.sendReminderEmail(
                    user.email,
                    reminder.heading,
                    reminder.remind_time,
                    {
                        timezone: reminder.timezone,
                        recurrence: reminder.recurrence,
                        reminderId: String(reminder._id),
                        oneTime: !nextTime,
                    }
                );
                if (emailResult.success) sentMethods.push('email');
            }

            const ringSet: Record<string, any> = {};
            if (sentMethods.includes('push') && user?.sound_alerts !== false) {
                ringSet.alert_repeats_left = RING_REPEATS;
                ringSet.alert_next_at = new Date(now.getTime() + RING_INTERVAL_MS);
            } else if (!nextTime && sentMethods.length > 0) {
                // Not ringing: give a one-time reminder one minute to be snoozed, then the cleanup below deletes it.
                ringSet.alert_repeats_left = 0;
                ringSet.alert_next_at = new Date(now.getTime() + RING_INTERVAL_MS);
            }
            await ChatSession.updateOne(
                { _id: reminder._id },
                { $set: { notification_sent_via: sentMethods.join(',') || 'none', ...ringSet } }
            );

            if (!user) console.error('User not found for reminder', String(reminder._id));
            results.push({
                reminderId: String(reminder._id),
                sentMethods,
                success: sentMethods.length > 0,
                nextOccurrence: nextTime,
            });
        }

        // Second pass: re-alert reminders that are still ringing (not acknowledged yet).
        const ringing = await ChatSession.find({
            alert_next_at: { $lte: now, $ne: null },
            alert_repeats_left: { $gt: 0 },
        }).lean();
        let reAlerted = 0;
        for (const reminder of ringing as any[]) {
            const left = reminder.alert_repeats_left - 1;
            const claim = await ChatSession.updateOne(
                { _id: reminder._id, alert_next_at: reminder.alert_next_at, alert_repeats_left: reminder.alert_repeats_left },
                // After the last alert, a one-time reminder keeps one more minute (for Snooze) before it is deleted.
                { $set: { alert_repeats_left: left, alert_next_at: (left > 0 || !normalizeRecurrence(reminder.recurrence)) ? new Date(now.getTime() + RING_INTERVAL_MS) : null } }
            );
            if (!claim.modifiedCount) continue;
            const user: any = usersById.get(String(reminder.userId)) ?? await User.findById(reminder.userId).lean();
            if (!user?.push_notification) continue;
            try {
                await sendPushNotification(
                    String(user._id),
                    'Reminder (still ringing)',
                    reminder.heading,
                    String(reminder._id),
                    soundFile(user),
                    { ring: true, attempt: RING_REPEATS - left + 1, oneTime: !normalizeRecurrence(reminder.recurrence), ...(normalizeRecurrence(reminder.recurrence) ? {} : { url: '/dashboard' }) }
                );
                reAlerted++;
            } catch (error) {
                console.error('Re-alert failed:', error);
            }
        }

        // Third pass: delete the chats of one-time reminders that are finished.
        const finished = await ChatSession.find(finishedOneTimeFilter(now), { _id: 1 }).lean();
        let deleted = 0;
        for (const reminder of finished as any[]) {
            try {
                await deleteReminderChat(String(reminder._id));
                deleted++;
            } catch (error) {
                console.error('Cleanup failed for', String(reminder._id), error);
            }
        }

        return {
            success: true,
            processed: results.length,
            reAlerted,
            deleted,
            results
        };
    } catch (error) {
        console.error('Error in cron job:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        });
    }
});
