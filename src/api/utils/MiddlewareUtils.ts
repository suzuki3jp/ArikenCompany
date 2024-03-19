import type { Response } from 'express';

import { Result, Success, Failure } from '@/packages';
import { PublicUserData } from '@/managers';

export class MiddlewareUtils {
    public static getUser(res: Response): Result<PublicUserData, string> {
        const user = res.locals.user;

        if (typeof user === 'object') return new Failure('user not found');
        return new Success(user);
    }
}
