import ChatService from "~~/server/service/ChatService"

export default defineEventHandler(async (event) => {
    const {chatId,update} = await readBody(event)
    const chatService=new ChatService()
    await chatService.saveSessionDetail(chatId,update)
    return {
        success:true,
        message:"Chat Session Updated Successfully"
    }
})