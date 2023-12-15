import { Request, Response } from 'express';

import { RouteBase } from './RouteBase';
import { Api } from '../Api';

export class RootService implements RouteBase {
    public static path = '/';

    constructor(public api: Api) {}

    public get(req: Request, res: Response): void {
        res.send('Root OK');
    }
}
