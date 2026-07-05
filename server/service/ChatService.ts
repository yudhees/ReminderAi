import { LLmService } from "./LLmService";
import { ChatSession } from "../models/ChatSession";
import moment from "moment-timezone";
import { ChatHistory } from "../models/ChatHistory";
export default class {

    public llm: LLmService;
    constructor() {
        this.llm = new LLmService()
    }
    async sessionDetails(userId:string,sessionId:string){
        try { 
           const session=await ChatSession.findOne({_id:sessionId,userId})
           return session
        } catch (error) {
            return null
        }
    }
    async getChats(sessionId:string){
        const chats=await ChatHistory.find({sessionId},{type:1,text:1,created_at:1},{sort:{created_at:1}})
        return chats
    }
    async interaction(payload: InteractionPayload,userId:string) {
        let { sessionId, input, timezone } = payload
        const isNew=sessionId=='new'
        if(isNew){
            const session=await ChatSession.insertOne({
                timezone,
                userId
            })
            sessionId=String(session._id)
        }
        const constChat={
          sessionId,
          userId,
          created_at:new Date()
        }
        const userChat:Record<string,any>={
          text:input,
          type:'user',
          ...constChat
        }
        const interaction = await this.llm.streamChat(input, payload.timezone, sessionId)
        const responseTime = moment().tz(timezone).format('hh:mm A');
        let response = "SomeThing went wrong please try again", isValidPrompt = false,exact_remind_time=null;
        if (interaction) {
            isValidPrompt = interaction.isValidPrompt
            response = interaction.textForChatResponse
            exact_remind_time=interaction.exact_remind_time
        }
        userChat.isValidPrompt=isValidPrompt
        const aiChat={
           text:response,
           type:'ai',
           ...constChat,
           created_at:new Date()
        }
        const sessionUpdate:Record<string,any>={}
        if(isNew){
           sessionUpdate.heading=interaction?.heading??'Reminder - Error';
        }
        if(isValidPrompt && exact_remind_time!='null' && exact_remind_time){
            const utcDate = moment.parseZone(exact_remind_time).utc().toDate()
            sessionUpdate.remind_time=utcDate
        }
        await ChatSession.updateOne({_id:sessionId},{$set:sessionUpdate})
        await ChatHistory.insertMany([
            userChat,aiChat
        ])
        return {
            text:response,
            time:responseTime,
            sessionId,
        }
    }
}