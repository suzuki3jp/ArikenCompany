import type { Request, Response } from 'express';

import { RouteBase } from '../../RouteBase';
import { Api } from '../../../Api';

export class RegisterService implements RouteBase {
    public static path = '/user/register';

    constructor(public api: Api) {}

    public async post(req: Request, res: Response) {
        const { name, password } = req.body;
        const addUserResult = (await this.api.ac.um.add(name, password)).toJSON();
        if (addUserResult.status === 200) this.api.logger.info('User added ' + addUserResult.data?.name);
        res.status(addUserResult.status).json(addUserResult);
    }
}

export default RegisterService;
