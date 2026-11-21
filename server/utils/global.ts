
import type { H3Event } from "h3";
import AuthSerive from '../service/AuthService';
import { ChatSession } from '../models/ChatSession';
export const getAuthUser=async(event:H3Event)=>{
    const auth=new AuthSerive(event)
    return auth.user()
}
/** Returns the signed-in user or throws 401. */
export const requireAuthUser=async(event:H3Event)=>{
    const user=await getAuthUser(event)
    if(!user){
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    return user
}

/** Loads a chat session/reminder owned by the user, or throws 404. */
export const findOwnedSession=async(userId:string,sessionId:unknown)=>{
    if(typeof sessionId!=='string' || !/^[a-f0-9]{24}$/i.test(sessionId)){
        throw createError({ statusCode: 400, statusMessage: 'Invalid reminder id' })
    }
    const session=await ChatSession.findOne({_id:sessionId,userId})
    if(!session){
        throw createError({ statusCode: 404, statusMessage: 'Reminder not found' })
    }
    return session
}
