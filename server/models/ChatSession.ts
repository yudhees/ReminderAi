import defineModel from './default';

export const ChatSession = defineModel("chat_session", {
    heading:{
        type:String,
    },
    remind_time:{type:Date},
    timezone:{type:String},
    userId:{type:String},
})