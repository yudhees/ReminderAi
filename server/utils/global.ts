
import type { H3Event } from "h3";
import AuthSerive from '../service/AuthService';
export const getAuthUser=async(event:H3Event)=>{
    const auth=new AuthSerive(event)
    return auth.user()
}