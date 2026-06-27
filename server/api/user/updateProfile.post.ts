import { UserDocument } from "~~/server/models/users";
import UserService from "~~/server/service/UserService";
import { getAuthUser } from "~~/server/utils/global";

export default defineEventHandler(async (event) => {
  const payload=await readBody(event)
  const authUser=await getAuthUser(event) as UserDocument
  const user=new UserService()  
  await user.updateUser(authUser,payload)
  return {
     success:true,
     message:"User Updated successfully"
  }
})
