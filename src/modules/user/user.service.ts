import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateUserRole(id: string, role: Role) {
    const user = await this.getUser(id);

    // Check if user exists
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    // Switch role
    user.role = role;
    return user.save();
  }

  getUser(id: string) {
    return this.userModel
      .findOne({ id }, 'name role id answers questions')
      .populate('answers questions');
  }

  getAllUsers() {
    return this.userModel
      .find({}, 'name role id answers questions')
      .populate('answers questions');
  }
}
