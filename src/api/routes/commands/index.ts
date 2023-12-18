import type { Request, Response } from 'express';

import { RouteBase } from '../RouteBase';
import { Api } from '../../Api';
import { HttpResult } from '../../../packages';
import { CommandT } from '../../../database';

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
        const addCommandResult = (await this.api.ac.cmd.addCommand(name, content)).toJSON();
        if (addCommandResult.success) {
            this.api.logger.info('Command added ' + addCommandResult.data?.name);
            res.status(200).json(addCommandResult.data);
        } else {
            res.status(400).json({ message: addCommandResult.message });
        }
    }

    public async delete(req: Request, res: Response) {
        const { name } = req.body;
        if (!name) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name').toJSON();
            res.status(r.status).json(r);
            return;
        }
        const deleteCommandResult = (await this.api.ac.cmd.removeCommand(name)).toJSON();
        if (deleteCommandResult.success) {
            this.api.logger.info('Command deleted ' + deleteCommandResult.data?.name);
            res.status(200).json(deleteCommandResult.data);
        } else {
            res.status(400).json({ message: deleteCommandResult.message });
        }
    }

    public async put(req: Request, res: Response) {
        const { name, content, mod_only, alias } = req.body;
        if (!name) {
            const r = new HttpResult().setStatus(400).setMessage('Missing name').toJSON();
            res.status(r.status).json(r);
            return;
        }

        if (
            (content && typeof content !== 'string') ||
            (alias && typeof alias !== 'string') ||
            (mod_only && typeof mod_only !== 'boolean')
        ) {
            const r = new HttpResult().setStatus(400).setMessage('Invalid body argument type').toJSON();
            res.status(r.status).json(r);
            return;
        }

        const updateCommandResult = (await this.api.ac.cmd.editCommand(name, content, mod_only, alias)).toJSON();
        if (updateCommandResult.success) {
            this.api.logger.info('Command updated ' + updateCommandResult.data?.name);
            res.status(200).json(updateCommandResult.data);
        } else {
            res.status(400).json({ message: updateCommandResult.message });
        }
    }
}
