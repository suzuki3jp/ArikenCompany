import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import type { ArikenCompany } from '@/ArikenCompany';
import { BaseErrorRes, BaseRes, ErrorCode, MiddlewareUtils } from '@/api/utils';
import { PublicUserData } from '@/managers';
import { Logger } from '@/packages';
import { rootLogger } from '@/initializer';

export class PublicCommandsService implements RouteT {
    public readonly path = '/commands/public';
    public readonly requiredRole: RouteT['requiredRole'] = { get: null, post: null, put: null, delete: null };

    private logger: Logger = rootLogger.createChild('PublicCommandsService');

    constructor(private ac: ArikenCompany) {}

    async get(req: Request, res: Response) {
        const commands = await this.ac.cmd.getAll();

        const publicCommands = commands.map<PublicCommandData>((c) => ({
            name: c.name,
            content: c.content,
            cooldown: c.cooldown,
            mod_only: c.mod_only,
            alias: c.alias ?? undefined,
        }));

        const data: BaseRes<PublicCommandData[]> = {
            data: publicCommands,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }
}

export interface PublicCommandData {
    name: string;
    content: string;
    cooldown: number;
    mod_only: boolean;
    alias?: string;
}
