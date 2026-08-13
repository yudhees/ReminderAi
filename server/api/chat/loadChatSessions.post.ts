import { ObjectId } from "mongodb"
import { UserDocument } from "~~/server/models/users"
import AuthSerive from "~~/server/service/AuthService"
import ChatsSideBarService from "~~/server/service/ChatsSideBarService"

export default defineEventHandler(async (event) => {
    const payload = await readBody(event)
    const authService=new AuthSerive(event)
    const user=await authService.user() as UserDocument
    const chatSideBarService=new ChatsSideBarService()
    const filters:Record<string,any>={}
    if(payload.chatId){
        filters._id=new ObjectId(payload.chatId)
    }
    const {results,hasMorePages}=await chatSideBarService.getChats(user.id,payload.page??1,payload.limit??20,filters)
    return {results,hasMorePages}
})