import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import type { ArikenCompany } from '@/ArikenCompany';
import { BaseErrorRes, BaseRes, ErrorCode, MiddlewareUtils } from '@/api/utils';
import { PublicUserData } from '@/managers';
import { Logger } from '@/packages';
import { rootLogger } from '@/initializer';

export class UserMeService implements RouteT {
    public readonly path = '/user/me';
    public readonly requiredRole: RouteT['requiredRole'] = { get: 'normal', post: null, put: null, delete: null };

    private logger: Logger = rootLogger.createChild('UserMeService');

    constructor(private ac: ArikenCompany) {}

    get(req: Request, res: Response) {
        const user = MiddlewareUtils.getUser(res);

        if (user.isFailure()) {
            this.logger.error(user.data);
            const data: BaseErrorRes = {
                code: ErrorCode.internal,
                message: `Internal Error. If this persists, please contact the developer.`,
            };
            res.status(HttpStatusCode.InternalServerError).json(data);
            return;
        }

        const data: BaseRes<PublicUserData> = {
            data: user.data,
        };
        res.status(200).json(data);
        return;
    }
}
