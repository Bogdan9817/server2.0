import { Expose } from 'class-transformer';

export class QuestionCardDto {
  @Expose()
  text: string;
}
