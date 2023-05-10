import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/modules/user/dtos/user.dto';

export class CardDto {
  @Expose()
  text: string;

  @Expose()
  id: string;

  @Expose()
  @Type(() => UserDto)
  author: UserDto;
}
