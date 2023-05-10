import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Session,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EditorService } from './editor.service';
import { CreateAnswerCardDto } from './dtos/create-answer-card.dto';
import { CardDto } from './dtos/card.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AnswerCardDto } from './dtos/answer-card.dto';
import { EditorGuard } from 'src/guards/editor.guard';

export type Deck = 'answers' | 'questions';

@Controller('editor')
@Serialize(CardDto)
@UseGuards(EditorGuard)
export class EditorController {
  constructor(private editorService: EditorService) {}

  @Get('/:deck')
  getAllCards(@Param('deck') deck: Deck) {
    return this.editorService.getAllCards(deck);
  }

  @Post('/:deck')
  addCard(
    @Body() body: CreateAnswerCardDto,
    @Session() session: any,
    @Param('deck') deck: Deck,
  ) {
    return this.editorService.addCard(body, session.userId, deck);
  }

  @Patch('/:deck')
  updateCard(
    @Body() body: Partial<AnswerCardDto>,
    @Param('deck') deck: Deck,
    @Query('cardId') cardId: string,
  ) {
    return this.editorService.editCard(body, deck, cardId);
  }

  @Delete('/:deck')
  deleteCard(@Query('cardId') cardId: string, @Param('deck') deck: Deck) {
    return this.editorService.deleteCard(cardId, deck);
  }
}
