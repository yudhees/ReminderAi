import defineModel from './default';

export const ChatSession = defineModel("chat_session", {
    heading:{
        type:String,
    },
    remind_time:{type:Date},
    timezone:{type:String},
    userId:{type:String},
    notification_sent:{type:Boolean, default:false},
    notification_sent_at:{type:Date},
    notification_sent_via:{type:String},
}, {
    indexes: [
        { userId: 1, remind_time: 1 },
        { userId: 1 },
    ],
})