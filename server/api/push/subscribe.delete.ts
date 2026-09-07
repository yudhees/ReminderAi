import { UserDocument } from "~~/server/models/users"
import { getAuthUser } from '../../utils/global';
import { Subscription } from "~~/server/models/Subscription";

export default defineEventHandler(async (event) => {
    const subscription = await readBody(event)

    if (
        !subscription?.endpoint
    ) {
        throw createError({
            statusCode: 400,
            message: 'Invalid push subscription'
        })
    }

    // Get your logged-in user here
    const authUser = await getAuthUser(event) as UserDocument
    await Subscription.deleteOne(
        { userId: authUser.id, endpoint: subscription.endpoint }
    )
    return {
        success: true
    }
})