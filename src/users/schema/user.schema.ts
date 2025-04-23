// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>

@Schema({timestamps:true})
export class User{
    @Prop()
    name:string
    @Prop()
    password:string
    @Prop()
    email:string
}
export const UserSchema = SchemaFactory.createForClass(User)