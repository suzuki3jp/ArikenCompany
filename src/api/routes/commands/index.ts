import type { Request, Response } from 'express';

import { RouteBase } from '@/api/routes/RouteBase';
import { Api } from '@/api/Api';
import { HttpResult } from '@/packages';
import { CommandT } from '@/database';
import type { OperationMetadata } from '@/typings';

export class CommandService implements RouteBase {
    public static path = '/commands';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const c = await this.api.ac.cmd.getAll();
        const r = new HttpResult<CommandT[]>().setStatus(200).setData(c).toJSON();
        res.status(r.status).json(r);
    }

    public async post(req: Request, res: Response) {
        const { name, content } = req.body;
        if (!name || !content) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name or content').toJSON();
            res.status(r.status).json(r);
            return;
        }

        let executer: string | null = null;
        try {
            executer = res.locals.user.name;
        } catch {
            executer = null;
        }
        const metadata: OperationMetadata = {
            provider: 'API',
            name: executer ?? 'unknown',
        };

        const r = new HttpResult<CommandT>();
        const addCommandResult = await this.api.ac.cmd.addCommand(name, content, metadata);

        if (addCommandResult.isSuccess()) {
            this.api.logger.info('Command added ' + addCommandResult.data.name);
            r.setStatus(200).setData(addCommandResult.data);
        } else {
            r.setStatus(400).setMessage(addCommandResult.data);
        }

        const result = r.toJSON();
        res.status(result.status).json(result);
    }

    public async delete(req: Request, res: Response) {
        const { name } = req.body;
        if (!name) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name').toJSON();
            res.status(r.status).json(r);
            return;
        }

        let executer: string | null = null;
        try {
            executer = res.locals.user.name;
        } catch {
            executer = null;
        }
        const metadata: OperationMetadata = {
            provider: 'API',
            name: executer ?? 'unknown',
        };

        const r = new HttpResult<CommandT>();
        const deleteCommandResult = await this.api.ac.cmd.removeCommand(name, metadata);

        if (deleteCommandResult.isSuccess()) {
            this.api.logger.info('Command deleted ' + deleteCommandResult.data.name);
            r.setStatus(200).setData(deleteCommandResult.data);
        } else {
            r.setStatus(400).setMessage(deleteCommandResult.data);
        }

        const result = r.toJSON();
        res.status(result.status).json(result);
    }

    public async put(req: Request, res: Response) {
        const { name, content, mod_only, alias } = req.body;
        let isOnlyMod = Number(mod_only) === 1;
        if (!name) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name').toJSON();
            res.status(r.status).json(r);
            return;
        }

        if ((content && typeof content !== 'string') || (alias && typeof alias !== 'string')) {
            const r = new HttpResult().setStatus(400).setMessage('Invalid body argument type').toJSON();
            res.status(r.status).json(r);
            return;
        }

        let executer: string | null = null;
        try {
            executer = res.locals.user.name;
        } catch {
            executer = null;
        }
        const metadata: OperationMetadata = {
            provider: 'API',
            name: executer ?? 'unknown',
        };

        const r = new HttpResult<CommandT>();
        const updateCommandResult = await this.api.ac.cmd.editCommand(name, { content, isOnlyMod, alias }, metadata);

        if (updateCommandResult.isSuccess()) {
            this.api.logger.info('Command updated ' + updateCommandResult.data.name);
            r.setStatus(200).setData(updateCommandResult.data);
        } else {
            r.setStatus(400).setMessage(updateCommandResult.data);
        }

        const result = r.toJSON();
        res.status(result.status).json(result);
    }
}
