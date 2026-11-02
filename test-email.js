import { config } from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
config();

async function testEmail() {
  const args = process.argv.slice(2);
  const to = args[0] || process.env.GMAIL_EMAIL; // Recipient email (defaults to sender email for testing)
  const heading = args[1] || 'Test Reminder';
  const remindTime = args[2] ? new Date(args[2]) : new Date(Date.now() + 5 * 60 * 1000);

  console.log('Testing email sending...');
  console.log('From (sender):', process.env.GMAIL_EMAIL);
  console.log('To (recipient):', to);
  console.log('Heading:', heading);
  console.log('Time:', remindTime.toLocaleString());
  console.log('---');

  if (!to) {
    console.error('Error: No recipient email provided and GMAIL_EMAIL not set in .env');
    process.exit(1);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: to,
      subject: `Reminder: ${heading}`,
      text: `This is a reminder for: ${heading}\n\nTime: ${remindTime.toLocaleString()}`,
      html: `
        <h2>Reminder: ${heading}</h2>
        <p>This is a reminder for your scheduled task.</p>
        <p><strong>Time:</strong> ${remindTime.toLocaleString()}</p>
      `,
    });

    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testEmail();
