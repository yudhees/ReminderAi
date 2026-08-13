import ChatService from "~~/server/service/ChatService"

export default defineEventHandler(async (event) => {
    const { chatId } = event.context.params as { chatId: string }
    const chatService=new ChatService()
    await chatService.deleteChat(chatId)
    return {
        success:true,
        message:"Chat Deleted Succcessfully",
    }
})