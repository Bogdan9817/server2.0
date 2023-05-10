import { Expose } from 'class-transformer';

export class AnswerCardDto {
  @Expose()
  text: string;
}
