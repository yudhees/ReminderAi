import { UserDocument } from "~~/server/models/users"
import { getAuthUser } from '../../utils/global';
import { Subscription } from "~~/server/models/Subscription";

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
  const authUser = await getAuthUser(event) as UserDocument
  const data=await Subscription.findOne(
    { userId: authUser.id, endpoint: subscription.endpoint },
    {endpoint:1,_id:1}
  )
  return {
    success: true,
    subscriptionExists:Boolean(data)
  }
})