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
})


type User = InferSchemaType<typeof User>;
export type UserDocument = HydratedDocument<User>;

