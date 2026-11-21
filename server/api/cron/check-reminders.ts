import { ChatSession } from '../../models/ChatSession';
import { User } from '../../models/users';
import EmailService from '../../service/EmailService';
import { sendPushNotification } from '../../utils/sentpush';
import { nextOccurrence, normalizeRecurrence } from '../../utils/recurrence';

/**
 * Sends every due reminder once.
 * - One-time reminders are marked as sent (kept so they still show in history).
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
                        user.notification_sound ? `${user.notification_sound}.mp3` : 'alarm.mp3'
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
                    reminder.remind_time
                );
                if (emailResult.success) sentMethods.push('email');
            }

            await ChatSession.updateOne(
                { _id: reminder._id },
                { $set: { notification_sent_via: sentMethods.join(',') || 'none' } }
            );

            if (!user) console.error('User not found for reminder', String(reminder._id));
            results.push({
                reminderId: String(reminder._id),
                sentMethods,
                success: sentMethods.length > 0,
                nextOccurrence: nextTime,
            });
        }

        return {
            success: true,
            processed: results.length,
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
