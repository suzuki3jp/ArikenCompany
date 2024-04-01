import { HttpStatusCode } from 'axios';
import type { Request, Response, NextFunction } from 'express';

import { UserRoleT } from '@/database';
import { BaseErrorRes, ErrorCode, ResUtils } from '@/api/utils';
import { rootLogger } from '@/initializer';
import { ArikenCompany } from '@/ArikenCompany';

const logger = rootLogger.createChild('AuthMiddleware');

export const AuthMiddleware = (requiredRole: UserRoleT | null, ac: ArikenCompany) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        logger.debug(`Authenticating... requiredRole: ${requiredRole}`);
        const unauthError = (m: string): BaseErrorRes => ({
            code: ErrorCode.unauthorized,
            message: 'Unauthorized. ' + m,
        });

        // 認証が必要ない場合は何もせずnext
        if (requiredRole === null) return next();

        // リクエストにトークンが含まれているか確認する
        const bearer = req.headers.authorization;
        if (!bearer) {
            logger.debug(`token is undefined.`);
            res.status(HttpStatusCode.Unauthorized).json(unauthError('token is required.'));
            return;
        }
        const [_, token] = bearer.split(' ');

        // トークンを検証する
        const decoded = ac.am.verifyToken(token);
        if (decoded.isFailure()) {
            res.status(HttpStatusCode.Unauthorized).json(unauthError(decoded.data));
            return;
        }
        logger.debug(`Successfully decoded token. id: ${decoded.data.id}`);

        // ユーザーを取得し、ロールを確認するk
        const user = await ac.um.getById(decoded.data.id);
        if (!user) {
            res.status(HttpStatusCode.Unauthorized).json(unauthError('token user can not found.'));
            return;
        }
        if (!ac.am.isUserRole(user.role)) {
            logger.error(`Invaild user role. userId: ${user.id}, role: ${user.role}`);
            res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
            return;
        }

        const hasPermission = ac.am.isEnoughRole(user.role, requiredRole);
        if (hasPermission.isFailure()) {
            rootLogger.error(hasPermission.data);
            res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
            return;
        }

        // 権限不足だった場合
        if (!hasPermission.data) {
            const data: BaseErrorRes = {
                code: ErrorCode.missingPermission,
                message: `Missing permissions. the endpoint requires ${requiredRole} or higher role.`,
            };
            res.status(HttpStatusCode.Forbidden).json(data);
            return;
        }

        logger.debug(`Assigned user data${user.id} to res.locals.user.`);
        res.locals.user = user;
        next();
    };
};
