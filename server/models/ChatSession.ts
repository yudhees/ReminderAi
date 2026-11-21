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
    // 'daily' | 'weekly' | 'monthly' | 'yearly', or null for a one-time reminder
    recurrence:{type:String, default:null},
    // original schedule of a recurring reminder whose current occurrence was snoozed
    recurrence_anchor:{type:Date, default:null},
}, {
    indexes: [
        { userId: 1, remind_time: 1 },
        { userId: 1 },
        { notification_sent: 1, remind_time: 1 },
    ],
})