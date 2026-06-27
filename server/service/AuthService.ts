import { getServerSession } from "#auth";
import { User } from '../models/users';
import type { H3Event } from "h3";
export default class AuthSerive{
    protected User=User
    protected event:H3Event;
    constructor(eve:H3Event){
        this.event=eve
    }
    public async user() {
        const sessionData=await getServerSession(this.event)
        const user=sessionData?.user
        if(!user)return null;
        return await this.User.findOne({email:user.email})
    }
}