import type { Request, Response, NextFunction } from 'express';

import { ArikenCompany } from '../ArikenCompany';
import { HttpResult } from '../packages';

export const AuthMiddleware = (ac: ArikenCompany) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { authorization } = req.headers;
        if (!authorization) {
            const r = new HttpResult().setStatus(400).setMessage('Missing authorization').toJSON();
            res.status(r.status).json(r);
            return;
        } else {
            try {
                const token = authorization.split(' ')[1];
                const user = await ac.um.tokenM.verifyToken(token);
                res.locals.user = user;
                next();
            } catch (error) {
                const r = new HttpResult().setStatus(401).setMessage('Invalid token').toJSON();
                res.status(r.status).json(r);
                return;
            }
            next();
        }
    };
};
