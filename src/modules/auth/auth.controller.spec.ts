import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/schemas/user.schema';

const testUser = {
  name: 'testUserName',
  password: 'testUserPassword',
};

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    //  Create fake copy of users collection
    const users: User[] = [];

    fakeAuthService = {
      signUp: ({ name, password }) => {
        const user = {
          name,
          password,
          id: `${Math.floor(Math.random() * 99999)}`,
        } as any;
        users.push(user);
        return Promise.resolve(user);
      },
      signIn: ({ name, password }) => {
        const user = users.reduce((acc, cur) => {
          if (cur.name === name && cur.password === password) {
            acc = cur;
          }
          return acc;
        }, {}) as any;

        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
