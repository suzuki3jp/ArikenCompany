import type { Request, Response } from 'express';

import { RouteBase } from '../RouteBase';
import { Api } from '../../Api';
import { HttpResult } from '../../../packages';

export class UserService implements RouteBase {
    public static path = '/user';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const r = new HttpResult().setStatus(200).setData(res.locals.user).toJSON();
        res.status(r.status).json(r);
    }
}

export default UserService;
