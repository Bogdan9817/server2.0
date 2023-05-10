import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { UserDto } from '../user/dtos/user.dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signin')
  async signIn(@Body() body: any, @Session() session: any) {
    const user = await this.authService.signIn(body);
    session.userId = user.id;
    session.userRole = user.role;
    return user;
  }

  @Post('/signup')
  async signUp(@Body() body: any, @Session() session: any) {
    const user = await this.authService.signUp(body);
    session.userId = user.id;
    session.userRole = user.role;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
    session.userRole = null;
  }
}
