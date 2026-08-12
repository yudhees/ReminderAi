import { UserDocument } from "~~/server/models/users"
import AuthSerive from "~~/server/service/AuthService"
import ChatsSideBarService from "~~/server/service/ChatsSideBarService"

export default defineEventHandler(async (event) => {
    const payload = await readBody(event)
    const authService=new AuthSerive(event)
    const user=await authService.user() as UserDocument
    const chatSideBarService=new ChatsSideBarService()
    const {results,hasMorePages}=await chatSideBarService.getChats(user.id,payload.page,20)
    return {results,hasMorePages}
})