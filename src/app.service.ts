import { Injectable } from '@nestjs/common';
require('dotenv').config();

@Injectable()
export class AppService {
  getHello(): string {
    return `{
      "SOCKET_ORIGIN":${process.env.SOCKET_ORIGIN}
      "COOKIE_KEY":${process.env.COOKIE_KEY}
      "DATABASE_URL":${process.env.DATABASE_URL}
    }`;
  }
}
