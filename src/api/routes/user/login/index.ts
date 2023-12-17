import type { Request, Response } from 'express';

import { RouteBase } from '../../RouteBase';
import { Api } from '../../../Api';
import { HttpResult } from '../../../../packages';

export class LoginService implements RouteBase {
    public static path = '/user/login';

    constructor(public api: Api) {}

    public async post(req: Request, res: Response) {
        const { name, password } = req.body;
        if (!name || !password) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name or password').toJSON();
            res.status(r.status).json(r);
            return;
        }
        const loginUserResult = (await this.api.ac.um.login(name, password)).toJSON();
        if (loginUserResult.status === 200)
            this.api.logger.info('User logged in ' + loginUserResult.data?.name + ' from ' + req.ip);
        res.status(loginUserResult.status).json(loginUserResult);
    }
}
