import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filename: string; // this is the ObjectId string stored in GridFS

  @Prop({ required: true })
  size: number;

  @Prop({ required: false })
  contentType: string; // 👈 Add this line

  @Prop()
  expiresAt?: Date;

  @Prop()
  emailTo?: string;

  @Prop()
  emailFrom?: string;

  @Prop()
  expiryAt:string

  @Prop()
  mimetype: string; 
}

export const FileSchema = SchemaFactory.createForClass(File);
