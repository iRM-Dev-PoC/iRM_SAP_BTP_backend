import { HttpStatus, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth/src';

@Injectable()
export class ValidateUserMiddleware {
  constructor(private authService: AuthService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: 'Unauthorized', statuscode: HttpStatus.UNAUTHORIZED });
    } else {
      let token: string = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    next();
  }
}
