import type { Request, Response } from 'express';

import { RouteImpl } from '../../../RouteImpl';
import { Api } from '../../../Api';

export class RegisterService implements RouteImpl {
    constructor(public path: string, public api: Api) {}

    public async post(req: Request, res: Response) {
        console.log(req.body);
        const { name, password } = req.body;
        const addUserResult = (await this.api.ac.um.add(name, password)).toJSON();
        if (addUserResult.status === 200) this.api.logger.info('User added ' + addUserResult.data?.name);
        res.status(addUserResult.status).json(addUserResult);
    }
}

export default RegisterService;
