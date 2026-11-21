import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"

// Only the heading can be changed here (sidebar rename). Time and repeat changes go through /api/reminders/update.
export default defineEventHandler(async (event) => {
    const { chatId } = event.context.params as { chatId: string }
    const { update } = await readBody(event)
    const heading = typeof update?.heading === 'string' ? update.heading.trim().slice(0, 200) : ''
    if (!heading) {
        throw createError({ statusCode: 400, statusMessage: 'Heading is required' })
    }
    const user = await requireAuthUser(event)
    const session = await findOwnedSession(String(user._id), chatId)
    session.set({ heading })
    await session.save()
    return {
        success:true,
        message:"Chat Session Updated Successfully"
    }
})
