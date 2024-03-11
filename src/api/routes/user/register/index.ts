import type { Request, Response } from 'express';

import { RouteBase } from '@/api/routes/RouteBase';
import { Api } from '@/api/Api';
import { HttpResult } from '@/packages';

export class RegisterService implements RouteBase {
    public static path = '/user/register';

    constructor(public api: Api) {}

    public async post(req: Request, res: Response) {
        const { name, password } = req.body;
        if (!name || !password) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name or password').toJSON();
            res.status(r.status).json(r);
            return;
        }
        const addUserResult = (await this.api.ac.um.add(name, password)).toJSON();
        if (addUserResult.status === 200) this.api.logger.info('User added ' + addUserResult.data?.name);
        res.status(addUserResult.status).json(addUserResult);
    }
}
