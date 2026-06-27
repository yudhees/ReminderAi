import UserService from "~~/server/service/UserService";
import { getAuthUser } from "~~/server/utils/global";

export default defineEventHandler(async (event) => {
  const payload=await readBody(event)
  const authUser=await getAuthUser(event)
  const user=new UserService()
  console.log(authUser);
  return {
     success:true,
     message:"User Updated successfully"
  }
})
