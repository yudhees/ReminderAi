import defineModel from './default';

export const Checkpoints = defineModel("checkpoints", {
    checkpoint_id:{type:String},
    task_id:{type:String},
    thread_id:{type:String},
})