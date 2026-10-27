import defineModel from './default';
import { InferSchemaType, HydratedDocument } from "mongoose";


export const User = defineModel("users", {
    name: {
        type: String,
        required: true,
    },
    last_login_at:{
        type:Date,
    },
    provider:{type:String},
    email: {
        type: String,
        required: true,
        unique: true,
    },
    notification_sound:{type:String},
    push_notification:{type:Boolean, default:true},
    email_reminders:{type:Boolean, default:false},
    sound_alerts:{type:Boolean, default:true},
    default_daily_reminders_in_mins:{type:Number, default:15},
    ai_input_language:{type:String, default:"en-US"},
}, {
    indexes: [
        { email: 1 },
    ],
})


type User = InferSchemaType<typeof User>;
export type UserDocument = HydratedDocument<User>;

