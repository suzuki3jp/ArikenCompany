import type { Request, Response } from 'express';

import { RouteBase } from '@/api/routes/RouteBase';
import { Api } from '@/api/Api';
import { HttpResult } from '@/packages';
import { ValuePublisher } from '@/parsers';

export class PublicCommandsService implements RouteBase {
    public static path = '/commands/public';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const commands = await this.api.ac.cmd.getAll();
        const publicCommandsData: {
            name: string;
            content: string;
            isModOnly: boolean;
        }[] = [];

        commands.forEach((c) => {
            const publicContent = new ValuePublisher(c.content).toPublic();
            publicCommandsData.push({ name: c.name, content: publicContent, isModOnly: c.mod_only });
        });

        const r = new HttpResult().setStatus(200).setData(publicCommandsData).toJSON();
        res.status(r.status).json(r);
    }
}
