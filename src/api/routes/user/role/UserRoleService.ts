import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import type { ArikenCompany } from '@/ArikenCompany';
import { BaseErrorRes, BaseRes, ErrorCode, ReqBodyUtils } from '@/api/utils';
import { Logger } from '@/packages';
import { rootLogger } from '@/initializer';
import { PublicUserData } from '@/managers';

export class UserRoleService implements RouteT {
    public readonly path = '/user/role';
    public readonly requiredRole: RouteT['requiredRole'] = { get: null, post: 'admin', put: null, delete: null };

    private logger: Logger = rootLogger.createChild('UserRoleService');

    constructor(private ac: ArikenCompany) {}

    async post(req: Request, res: Response) {
        const params = ReqBodyUtils.extractRequiredBody(req, ['id', 'role']);
        if (params.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `id, role are required`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }

        const { id, role } = params.data;
        const result = await this.ac.um.changeRole(id, role);
        if (result.isFailure()) {
            const data: BaseErrorRes = {
                code: result.data.code === 404 ? ErrorCode.notFound : ErrorCode.invalidParams,
                message: result.data.message,
            };
            res.status(result.data.code).json(data);
            return;
        }

        const data: BaseRes<PublicUserData> = {
            data: result.data,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }
}
