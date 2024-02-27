import { NextFunction, Request, Response } from 'express';

export class ValidateUserMiddleware {
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', req.user);
    next();
  }
}
