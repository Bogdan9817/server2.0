import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EditorModule } from './modules/editor/editor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { UserModule } from './modules/user/user.module';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { GameModule } from './modules/game/game.module';

const cookieSession = require('cookie-session');
require('dotenv').config();

@Module({
  imports: [
    EditorModule,
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AuthModule,
    UserModule,
    GameModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [process.env.COOKIE_KEY],
        }),
      )
      .forRoutes('*');

    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
