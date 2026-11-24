import nodemailer from 'nodemailer';
import { buildReminderEmail, APP_URL } from '../utils/reminderEmail';
import { recurrencePhrase } from '../utils/recurrence';

export interface ReminderEmailOptions {
    timezone?: string | null;
    recurrence?: string | null;
    /** Chat id; recurring reminders link straight to their chat. */
    reminderId?: string;
    /** One-time reminders are deleted after they fire, so they link to the dashboard instead. */
    oneTime?: boolean;
}

export default class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    async sendReminderEmail(userEmail: string, reminderHeading: string, remindTime: Date, options: ReminderEmailOptions = {}) {
        try {
            const url = options.reminderId && !options.oneTime
                ? `${APP_URL}/chat/${encodeURIComponent(options.reminderId)}`
                : `${APP_URL}/dashboard`;
            const { subject, html, text } = buildReminderEmail({
                heading: reminderHeading,
                remindTime,
                timezone: options.timezone,
                recurrence: options.recurrence,
                repeatText: recurrencePhrase(options.recurrence),
                url,
            });
            const info = await this.transporter.sendMail({
                from: { name: 'Reminza', address: process.env.GMAIL_EMAIL || '' },
                to: userEmail,
                subject,
                text,
                html,
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }
    }
}
