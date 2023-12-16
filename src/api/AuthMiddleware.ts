import type { Request, Response, NextFunction } from 'express';

import { ArikenCompany } from '../ArikenCompany';
import { HttpResult } from '../packages';

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction, ac: ArikenCompany) => {
    const { authorization } = req.headers;
    if (!authorization) {
        const r = new HttpResult().setStatus(400).setMessage('Missing authorization').toJSON();
        res.status(r.status).json(r);
        return;
    }
    try {
        const user = await ac.um.tokenM.verifyToken(authorization);
        res.locals.user = user;
        next();
    } catch (error) {
        const r = new HttpResult().setStatus(401).setMessage('Invalid token').toJSON();
        res.status(r.status).json(r);
        return;
    }
    next();
};