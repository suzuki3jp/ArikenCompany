import { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import { BaseErrorRes, BaseRes, ErrorCode, ReqBodyUtils } from '@/api/utils';
import { ArikenCompany } from '@/ArikenCompany';
import { AuthManager } from '@/managers';
import { Logger } from '@/packages';
import { rootLogger } from '@/initializer';

export class LoginService implements RouteT {
    public readonly path = '/auth/login';
    public readonly requiredRole: RouteT['requiredRole'] = { get: null, post: null, put: null, delete: null };

    private logger: Logger = rootLogger.createChild('LoginService');

    constructor(private ac: ArikenCompany) {}

    async post(req: Request, res: Response) {
        // リクエストボディに不足がないか判定
        const params = ReqBodyUtils.extractBody(req, ['name', 'password']);
        if (params.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `${params.data.join(', ')} are required.`,
            };
            res.status(400).json(data);
            return;
        }

        // リクエストボディからの情報で認証
        const { name, password } = params.data;
        const result = await this.ac.um.isCorrectPass(name, password);
        if (result.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.incorrectCredentials,
                message: `Authentication failed. Incorrect name or password.`,
            };
            res.status(401).json(data);
            return;
        }

        // 認証を通過し、トークンを発行する
        const token = AuthManager.signToken(result.data.id);
        const data: BaseRes<{ token: string }> = {
            data: {
                token,
            },
        };
        res.status(200).json(data);
        this.logger.info(`${result.data.name}(${result.data.id}) logged in.`);
        return;
    }
}
