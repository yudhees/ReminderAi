import { UserDocument } from "~~/server/models/users";
import { getAuthUser } from "~~/server/utils/global";
import { RemindersService } from "../service/RemindersService";

export default defineEventHandler(async (event) => {
  const payload=getQuery(event)
  const authUser=await getAuthUser(event) as UserDocument
  if(!authUser)return {}
  const userId=String(authUser._id)
  const remindersService=new RemindersService()
  const reminders=await remindersService.reminders(userId,payload)
  return {
    suces:true,
    reminders
  }
})