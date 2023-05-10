import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnswerCard } from 'src/schemas/answer-card.schema';
import { QuestionCard } from 'src/schemas/question-card.schema';
import { Deck } from './editor.controller';
import { CreateAnswerCardDto } from './dtos/create-answer-card.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class EditorService {
  constructor(
    @InjectModel(AnswerCard.name) private answers: Model<AnswerCard>,
    @InjectModel(QuestionCard.name)
    private questions: Model<QuestionCard>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  getAllCards(deck: Deck) {
    return this[deck].find().populate('author');
  }

  async addCard(body: CreateAnswerCardDto, authorId: string, deck: Deck) {
    // Generate ID
    const cardId = await this.generateId();

    // Find author
    const author = await this.userModel.findOne({ id: authorId });

    // Create card instance with author ref
    const card = new this[deck]({
      ...body,
      id: cardId,
      author: author,
    });
    // Save changes
    await card.save();
    author[deck].set(cardId, card);
    await author.save();

    return card;
  }

  async deleteCard(cardId: string, deck: Deck) {
    const card = await this[deck].findOneAndDelete({ id: cardId });
    const author = await this.userModel.findById(card.author);
    author[deck].delete(card.id);
    await author.save();
    return 'Card deleted';
  }

  async editCard(
    body: Partial<CreateAnswerCardDto>,
    deck: Deck,
    cardId: string,
  ) {
    const prev = await this[deck].findOneAndUpdate({ id: cardId }, body);
    const current = await this[deck].findOne({ id: cardId });
    return { prev, current, changes: body };
  }

  private async generateId(): Promise<string> {
    // Generate ID
    const id = uuidv4();

    const isExistsInAnswers = await this.answers.findOne({ id });
    const isExistsInQuestions = await this.questions.findOne({ id });

    if (isExistsInAnswers || isExistsInQuestions) {
      this.generateId();
    } else {
      return id;
    }
  }
}
