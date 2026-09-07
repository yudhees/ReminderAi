import defineModel from './default';

export const Subscription = defineModel("push_subscription", {
    userId:{type:String},
    endpoint:{type:String},
    p256dh:{type:String},
    auth:{type:String},
})