import { NestMiddleware } from '@nestjs/common';
import { Role, User } from 'src/schemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        role: Role;
        id: string;
      };
    }
  }
}

export class CurrentUserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const { userRole, userId } = req.session;
    if (userRole && userId) {
      req.currentUser = { role: userRole };
    }

    next();
  }
}
