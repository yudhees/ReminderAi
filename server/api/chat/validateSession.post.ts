import { UserDocument } from "~~/server/models/users"
import AuthSerive from "~~/server/service/AuthService"
import ChatService from "~~/server/service/ChatService"

export default defineEventHandler(async (event) => {
    const payload = await readBody(event)
    const chatService = new ChatService()
    const authuser = new AuthSerive(event)
    const user = await authuser.user() as UserDocument
    const session=await chatService.sessionDetails(String(user._id),payload.sessionId)
    return {
        success: Boolean(session),
    }
})