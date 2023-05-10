import * as mongoose from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

@Schema()
export class AnswerCard {
  @Prop({ required: true, unique: true })
  text: string;

  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}

const AnswerCardSchema = SchemaFactory.createForClass(AnswerCard);

export { AnswerCardSchema };
