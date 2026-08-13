import defineModel from './default';

export const CheckPointWrites = defineModel("checkpoint_writes", {
    checkpoint_id:{type:String},
    task_id:{type:String},
    thread_id:{type:String},
})