import type { Request, Response } from 'express';

import { RouteBase } from '../RouteBase';
import { Api } from '../../Api';
import { HttpResult, secondsToHHMMSS } from '../../../packages';

export class StatusService implements RouteBase {
    public static path = '/status';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const r = new HttpResult()
            .setStatus(200)
            .setData({ uptime: { ...secondsToHHMMSS(Math.floor(process.uptime())) } })
            .toJSON();
        res.status(r.status).json(r);
    }
}
