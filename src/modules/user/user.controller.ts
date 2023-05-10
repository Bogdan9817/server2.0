import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from 'src/schemas/user.schema';
import { AdminGuard } from 'src/guards/admin.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';

@Controller('user')
// @Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  getAll() {
    return this.userService.getAllUsers();
  }

  @Get('/myinfo')
  getUser(@Session() session: any) {
    return this.userService.getUser(session.userId);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  updateUserRole(@Param('id') id: string, @Query('role') role: Role) {
    return this.userService.updateUserRole(id, role);
  }
}
