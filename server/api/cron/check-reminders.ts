import { ChatSession } from '../../models/ChatSession';
import { User } from '../../models/users';
import EmailService from '../../service/EmailService';
import { sendPushNotification } from '../../utils/sentpush';

export default defineEventHandler(async (event) => {
    // Verify this is called by Vercel cron (optional security check)
    const authHeader = getHeader(event, 'authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        });
    }

    try {
        const now = new Date();

        // Find reminders that are due and not yet sent
        const dueReminders = await ChatSession.find({
            remind_time: { $lte: now, $ne: null },
            notification_sent: false
        });

        console.log(`Found ${dueReminders.length} due reminders`);

        const emailService = new EmailService();
        const results = [];

        for (const reminder of dueReminders) {
            const user = await User.findById(reminder.userId);
            if (!user) {
                console.error('User not found for reminder', reminder._id);
                continue;
            }

            const sentMethods = [];

            // Send push notification if enabled
            if (user.push_notification) {
                try {
                    await sendPushNotification(
                        String(user._id),
                        'Reminder',
                        reminder.heading,
                        String(reminder._id)
                    );
                    sentMethods.push('push');
                } catch (error) {
                    console.error('Push notification failed:', error);
                }
            }

            // Send email if enabled
            if (user.email_reminders) {
                try {
                    await emailService.sendReminderEmail(
                        user.email,
                        reminder.heading,
                        reminder.remind_time
                    );
                    sentMethods.push('email');
                } catch (error) {
                    console.error('Email notification failed:', error);
                }
            }

            // Mark as sent
            if (sentMethods.length > 0) {
                await ChatSession.updateOne(
                    { _id: reminder._id },
                    {
                        $set: {
                            notification_sent: true,
                            notification_sent_at: new Date(),
                            notification_sent_via: sentMethods.join(',')
                        }
                    }
                );
                console.log(`Reminder ${reminder._id} sent via ${sentMethods.join(', ')}`);
                results.push({
                    reminderId: String(reminder._id),
                    sentMethods,
                    success: true
                });
            } else {
                results.push({
                    reminderId: String(reminder._id),
                    sentMethods: [],
                    success: false,
                    reason: 'No notification methods enabled'
                });
            }
        }

        return {
            success: true,
            processed: dueReminders.length,
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
