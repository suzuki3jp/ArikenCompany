import { Request, Response } from 'express';

import { RouteBase } from './RouteBase';
import { Api } from '../Api';

export class RootService implements RouteBase {
    public static path = '/';

    constructor(public api: Api) {
        this.api.logger.info('Route loaded: ' + RootService.path);
    }

    public get(req: Request, res: Response): void {
        res.send('Root OK');
    }
}
