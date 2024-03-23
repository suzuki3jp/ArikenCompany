import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import type { ArikenCompany } from '@/ArikenCompany';
import { BaseErrorRes, BaseRes, ErrorCode, MiddlewareUtils, ReqBodyUtils } from '@/api/utils';
import { PublicUserData, UserManager } from '@/managers';
import { Logger } from '@/packages';
import { rootLogger } from '@/initializer';

export class UserService implements RouteT {
    public readonly path = '/user';
    public readonly requiredRole: RouteT['requiredRole'] = {
        get: 'admin',
        post: null,
        put: 'normal',
        delete: 'normal',
    };

    private logger: Logger = rootLogger.createChild('UserService');

    constructor(private ac: ArikenCompany) {}

    async get(req: Request, res: Response) {
        const params = ReqBodyUtils.extractRequiredBody(req, ['id']);

        // ボディにidが含まれていなかった場合すべてのユーザーを取得する
        if (params.isFailure()) {
            this.logger.debug('Getting all users...');
            const users = await this.ac.um.getAll();
            const data: BaseRes<PublicUserData[]> = {
                data: users,
            };
            res.status(HttpStatusCode.Ok).json(data);
            return;
        }

        if (!UserManager.isUUID(params.data.id)) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `id is invalid value.`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }
        const user = await this.ac.um.getById(params.data.id);

        if (!user) {
            const data: BaseErrorRes = {
                code: ErrorCode.notFound,
                message: `user not found`,
            };
            res.status(HttpStatusCode.NotFound).json(data);
            return;
        }

        const data: BaseRes<PublicUserData> = {
            data: user,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }

    async post(req: Request, res: Response) {
        const params = ReqBodyUtils.extractRequiredBody(req, ['name', 'password']);

        if (params.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `${params.data.join(', ')} are required.`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }

        const { name, password } = params.data;
        const result = await this.ac.um.add(name, password);

        if (result.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.conflict,
                message: result.data,
            };
            res.status(HttpStatusCode.Conflict).json(data);
            return;
        }

        const user = result.data;
        const data: BaseRes<PublicUserData> = {
            data: user,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }

    async put(req: Request, res: Response) {
        const params = ReqBodyUtils.extractOptionalBody(req, ['name', 'display_name']);
        const user = MiddlewareUtils.getUser(res);

        if (params.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `Invalid request body`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }

        if (user.isFailure()) {
            this.logger.error(`Auth error. PUT ${this.path}`);
            const data: BaseErrorRes = {
                code: ErrorCode.internal,
                message: 'Internal Error. If this persists, please contact the extractRequiredBody.',
            };
            res.status(HttpStatusCode.InternalServerError).json(data);
            return;
        }

        const { name, display_name } = params.data;
        const userData = user.data;

        if (!name && !display_name) {
            const data: BaseRes<PublicUserData> = {
                data: userData,
            };
            res.status(HttpStatusCode.Ok).json(data);
            return;
        }

        const result = await this.ac.um.edit(userData.id, { name, displayName: display_name });

        if (result.isSuccess()) {
            const data: BaseRes<PublicUserData> = {
                data: result.data,
            };
            res.status(HttpStatusCode.Ok).json(data);
            return;
        } else {
            const data: BaseErrorRes = {
                code: result.data.code === 404 ? ErrorCode.notFound : ErrorCode.invalidValue,
                message: result.data.message,
            };
            res.status(result.data.code).json(data);
            return;
        }
    }

    async delete(req: Request, res: Response) {
        const user = MiddlewareUtils.getUser(res);

        if (user.isFailure()) {
            this.logger.error(`Auth Error. DELETE ${this.path}`);
            const data: BaseErrorRes = {
                code: ErrorCode.internal,
                message: 'Internal Error. If this persists, please contact the extractRequiredBody.',
            };
            res.status(HttpStatusCode.InternalServerError).json(data);
            return;
        }

        const result = await this.ac.um.remove(user.data.id);

        if (result.isFailure()) {
            const data: BaseErrorRes = {
                code: result.data.code === 404 ? ErrorCode.notFound : ErrorCode.invalidValue,
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
