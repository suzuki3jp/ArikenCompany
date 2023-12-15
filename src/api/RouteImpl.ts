import type { Request, Response } from 'express';

export abstract class RouteImpl {
    constructor(public path: string) {}

    public abstract get?(req: Request, res: Response): void;
    public abstract post?(req: Request, res: Response): void;
    public abstract put?(req: Request, res: Response): void;
    public abstract delete?(req: Request, res: Response): void;
}
