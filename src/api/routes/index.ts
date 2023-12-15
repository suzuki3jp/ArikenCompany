import { Request, Response } from 'express';

import { RouteImpl } from '../RouteImpl';

class RootService implements RouteImpl {
    constructor(public path: string) {}

    public get(req: Request, res: Response): void {
        res.send('Root OK');
    }
}

export default RootService;
