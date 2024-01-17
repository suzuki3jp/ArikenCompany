import type { Request, Response } from 'express';

import { RouteBase } from '../RouteBase';
import { Api } from '../../Api';
import { HttpResult } from '../../../packages';

export class StatusService implements RouteBase {
    public static path = '/status';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const r = new HttpResult().setStatus(200).setData('ArikenCompanyApi is available.').toJSON();
        res.status(r.status).json(r);
    }
}
