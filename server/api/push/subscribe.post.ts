import { UserDocument } from "~~/server/models/users"
import { getAuthUser } from '../../utils/global';

export default defineEventHandler(async (event) => {
  const subscription = await readBody(event)

  if (
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    throw createError({
      statusCode: 400,
      message: 'Invalid push subscription'
    })
  }

  // Get your logged-in user here
  const authUser=await getAuthUser(event) as UserDocument
  console.log(subscription);
  
  // Save in your database
//   await db.pushSubscriptions.upsert({
//     userId: user.id,
//     endpoint: subscription.endpoint,
//     p256dh: subscription.keys.p256dh,
//     auth: subscription.keys.auth
//   })

  return {
    success: true
  }
})