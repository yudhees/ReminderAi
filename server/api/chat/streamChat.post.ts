import { LLmService } from "~~/server/service/LLmService"


export default defineEventHandler(async(event)=>{
    const payload=await readBody(event)
    const llmservice=new LLmService()
    const res=await llmservice.streamChat(payload.input,payload.timezone)
    return {
        success:true,
        ...res
    }
})