import defineModel from './default';


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
})
