import EmailService from '../service/EmailService';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { to, heading, remindTime } = body;

    // Default values if not provided
    const testEmail = to || process.env.GMAIL_EMAIL;
    const testHeading = heading || 'Test Reminder';
    const testTime = remindTime ? new Date(remindTime) : new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    if (!testEmail) {
      return {
        success: false,
        error: 'No email provided and GMAIL_EMAIL not set in environment variables'
      };
    }

    const emailService = new EmailService();
    const result = await emailService.sendReminderEmail(
      testEmail,
      testHeading,
      testTime
    );

    return {
      success: result.success,
      message: result.success 
        ? `Test email sent successfully to ${testEmail}` 
        : 'Failed to send test email',
      details: result
    };
  } catch (error) {
    console.error('Email test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});
