import ChatService from "~~/server/service/ChatService"
import { findOwnedSession, requireAuthUser } from "~~/server/utils/global"

export default defineEventHandler(async (event) => {
    const { chatId } = event.context.params as { chatId: string }
    const user = await requireAuthUser(event)
    await findOwnedSession(String(user._id), chatId)
    const chatService=new ChatService()
    await chatService.deleteChat(chatId)
    return {
        success:true,
        message:"Chat Deleted Succcessfully",
    }
})
