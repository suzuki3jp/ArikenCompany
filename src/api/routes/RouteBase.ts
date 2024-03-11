import type { Request, Response } from 'express';

import { Api } from '@/api/Api';

export abstract class RouteBase {
    public static path: string;
    constructor(public api: Api) {}

    public abstract get?(req: Request, res: Response): void;
    public abstract post?(req: Request, res: Response): void;
    public abstract put?(req: Request, res: Response): void;
    public abstract delete?(req: Request, res: Response): void;
}
