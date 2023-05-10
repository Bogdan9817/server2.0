import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private async generateId(): Promise<string> {
    // Generate ID
    const id = uuidv4();

    const isExists = await this.userModel.findOne({ id });
    if (isExists) {
      this.generateId();
    } else {
      return id;
    }
  }

  async signUp({ name, password }) {
    const user = await this.userModel.findOne({ name });

    //  Check if user with same name exists
    if (user) {
      throw new BadRequestException('User already exists');
    }

    //  Hash password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    // Generate unique ID
    const id = await this.generateId();

    // Create User Instance
    const createdUser = new this.userModel({ name, id, password: result });

    return createdUser.save();
  }

  async signIn({ name, password }) {
    const user = await this.userModel.findOne({ name });

    // Check if user exists
    if (!user) {
      throw new NotFoundException("User doesn't exist!");
    }

    // Hash password
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Compare hashed password with store hash
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Incorrect password');
    }

    return user;
  }
}
