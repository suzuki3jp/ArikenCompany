import type { Request, Response } from 'express';

import { RouteBase } from '../RouteBase';
import { getSafeUserDataFromRes } from '../../Utils';
import { Api } from '../../Api';
import { HttpResult } from '../../../packages';

export class UserService implements RouteBase {
    public static path = '/user';

    constructor(public api: Api) {}

    public async get(req: Request, res: Response) {
        const user = getSafeUserDataFromRes(res);
        if (!user) {
            const r = new HttpResult().setStatus(401).setMessage('Unauthorized').toJSON();
            res.status(r.status).json(r);
            return;
        }
        const r = new HttpResult().setStatus(200).setData(user).toJSON();
        res.status(r.status).json(r);
    }

    public async delete(req: Request, res: Response) {
        const user = getSafeUserDataFromRes(res);
        if (!user) {
            const r = new HttpResult().setStatus(401).setMessage('Unauthorized').toJSON();
            res.status(r.status).json(r);
            return;
        }
        const deleteUserResult = (await this.api.ac.um.remove(user.id)).toJSON();
        console.log(deleteUserResult);
        if (deleteUserResult.status === 200) this.api.logger.info('User deleted ' + user.name);
        res.status(deleteUserResult.status).json(deleteUserResult);
    }
}
