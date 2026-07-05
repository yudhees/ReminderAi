import AuthSerive from "~~/server/service/AuthService"
import ChatService from "~~/server/service/ChatService"

export default defineEventHandler(async (event) => {
    const payload = await readBody(event)
    const chatService=new ChatService()
    const chats=await chatService.getChats(payload.sessionId)
    return chats
})