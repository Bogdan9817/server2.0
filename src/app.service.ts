import { Injectable } from '@nestjs/common';
require('dotenv').config();

@Injectable()
export class AppService {
  getHello(): string {
    console.log(process.env.SOCKET_ORIGIN);
    console.log(process.env.COOKIE_KEY);
    console.log(process.env.DATABASE_URL);
    return 'Hello World!';
  }
}
