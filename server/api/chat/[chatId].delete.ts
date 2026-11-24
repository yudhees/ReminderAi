import ChatService from "~~/server/service/ChatService"
import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"
import { isAlerting, sendStopRinging } from "~~/server/utils/sentpush"

export default defineEventHandler(async (event) => {
    const { chatId } = event.context.params as { chatId: string }
    const user = await requireAuthUser(event)
    const session: any = await findOwnedSession(String(user._id), chatId)
    const chatService=new ChatService()
    await chatService.deleteChat(chatId)
    // Deleted while still ringing: silence it on every device.
    if (isAlerting(session)) await sendStopRinging(String(user._id), chatId, { deleted: true })
    return {
        success:true,
        message:"Chat Deleted Succcessfully",
    }
})
