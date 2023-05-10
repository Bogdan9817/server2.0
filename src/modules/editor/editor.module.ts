import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerCard, AnswerCardSchema } from 'src/schemas/answer-card.schema';
import {
  QuestionCard,
  QuestionCardSchema,
} from 'src/schemas/question-card.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AnswerCard.name,
        schema: AnswerCardSchema,
        collection: 'answers_base_deck',
      },
      {
        name: QuestionCard.name,
        schema: QuestionCardSchema,
        collection: 'questions_base_deck',
      },
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users',
      },
    ]),
  ],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
