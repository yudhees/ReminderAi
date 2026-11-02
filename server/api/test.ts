
export default defineEventHandler(async (event) => {
  // Test push notification with custom sound
  // You'll need to provide actual userId, title, body, and reminderId
  await sendPushNotification(
    'test-user-id',
    'Test Notification',
    'This is a test notification with custom sound',
    'test-reminder-id',
    'urgent_alert.mp3'
  )
  return {
    success: true,
  }
})