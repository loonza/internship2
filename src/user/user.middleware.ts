import {Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.session) {
            if (req.session.user) {
                res.locals.user = req.session.user;
            } else if (req.session.userId) {
                res.locals.user = {id: req.session.userId};
            }
        }
        next();
    }
}