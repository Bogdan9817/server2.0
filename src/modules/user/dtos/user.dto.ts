import { Expose } from 'class-transformer';
import { Role } from 'src/schemas/user.schema';

export class UserDto {
  @Expose()
  name: string;

  @Expose()
  role: Role;
}
