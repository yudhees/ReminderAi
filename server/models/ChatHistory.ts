import defineModel from './default';

export const ChatHistory = defineModel("chat_history", {
    text:{type:String},
    type:{type:String},
    sessionId:{type:String},
})