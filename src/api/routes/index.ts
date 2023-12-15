import { Request, Response } from 'express';

import { RouteImpl } from '../RouteImpl';
import { Api } from '../Api';

class RootService implements RouteImpl {
    constructor(public path: string, public api: Api) {}

    public get(req: Request, res: Response): void {
        res.send('Root OK');
    }
}

export default RootService;
