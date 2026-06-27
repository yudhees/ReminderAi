import { defineMongooseModel } from "#nuxt/mongoose";
import type {SchemaDefinition, SchemaOptions } from 'mongoose';

export default function defineModel(name: string,schema:SchemaDefinition,options:SchemaOptions={}) {
    return defineMongooseModel({
        name,
        schema,
        options: {
            collection: name,
            strict:false,
            strictQuery:false,
            timestamps: {
                createdAt: "created_at",
                updatedAt: "updated_at",
            },
            ...options,
        },
    });
}
