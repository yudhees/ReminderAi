import nodemailer from 'nodemailer';
import { User } from '../models/users';

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

    async sendReminderEmail(userEmail: string, reminderHeading: string, remindTime: Date) {
        try {
            
            const info = await this.transporter.sendMail({
                from: process.env.GMAIL_EMAIL,
                to: userEmail,
                subject: `Reminder: ${reminderHeading}`,
                text: `This is a reminder for: ${reminderHeading}\n\nTime: ${remindTime.toLocaleString()}`,
                html: `
                    <h2>Reminder: ${reminderHeading}</h2>
                    <p>This is a reminder for your scheduled task.</p>
                    <p><strong>Time:</strong> ${remindTime.toLocaleString()}</p>
                `,
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }
    }
}
