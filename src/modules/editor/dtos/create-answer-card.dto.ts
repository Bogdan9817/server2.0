import { Expose } from 'class-transformer';

export class CreateAnswerCardDto {
  @Expose()
  text: string;
}
