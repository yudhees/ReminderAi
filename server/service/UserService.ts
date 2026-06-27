import type { User as AuthUser } from "next-auth";
import { User } from "../models/users";

export default class UserService{
    protected User=User;
    public async authenticaeUser(authUser:Required<AuthUser>)
    {
       const user=await this.createOrUpdateUser(authUser)
       return user
    }
    protected  async createOrUpdateUser(authUser:Required<AuthUser>)
    {
        const user=await this.User.findOneAndUpdate(
            {email:authUser.email},
            {
                $set:{
                    name:authUser.name,
                    last_login_at:new Date(),
                    provder:"google",
                },
                $setOnInsert:{
                    push_notification:true,
                    email_reminders:false,
                    sound_alerts:true,
                    default_daily_reminders_in_mins:15
                }
            },
            {upsert:true,returnDocument:"after"}
        )
        return user;
    }
    public async user(email:string)
    {
        const user=await this.User.findOne({email})
        return user;
    }
    
}