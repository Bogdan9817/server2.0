import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { RoomService } from './room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerCard, AnswerCardSchema } from '../../schemas/answer-card.schema';
import {
  QuestionCard,
  QuestionCardSchema,
} from '../../schemas/question-card.schema';

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
    ]),
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, RoomService],
})
export class GameModule {}
