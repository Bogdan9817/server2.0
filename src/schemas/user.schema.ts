import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Mongoose } from 'mongoose';
import { AnswerCard } from './answer-card.schema';
import { QuestionCard } from './question-card.schema';

export type Role = 'user' | 'editor' | 'admin';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: Role;

  @Prop({ unique: true })
  id: string;

  @Prop({
    type: Map,
    of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnswerCard',
    },
    default: {},
  })
  answers: Map<string, AnswerCard>;

  @Prop({
    type: Map,
    of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionCard',
    },
    default: {},
  })
  questions: Map<string, QuestionCard>;
}

export const UserSchema = SchemaFactory.createForClass(User);
