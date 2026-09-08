
export default defineEventHandler(async (event) => {
  await sendPushNotification()
  return {
    suces:true,
  }
})