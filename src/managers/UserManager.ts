import { hashSync, compareSync } from 'bcrypt';
import { DeepPartial } from 'ts-essentials';

import { UserDB, UserT } from '../database';
import { ArikenCompany } from '../ArikenCompany';
import { HttpResult } from '../packages';

/**
 * Manager for user db.
 */
export class UserManager {
    private db: UserDB;
    constructor(private ac: ArikenCompany) {
        this.db = new UserDB();
    }

    async login(name: string, password: string): Promise<HttpResult<UserT>> {
        const r = new HttpResult<UserT>();
        const user = await this.db.getByName(name);
        if (!user) {
            r.setStatus(400).setMessage('User not found.');
            return r;
        }
        const isPasswordCorrect = this.comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            r.setStatus(400).setMessage('Password is incorrect.');
            return r;
        }
        r.setStatus(200).setData(user);
        return r;
    }

    async add(name: string, password: string): Promise<HttpResult<UserT>> {
        const r = new HttpResult<UserT>();
        const isExistUser = Boolean(await this.db.getByName(name));
        if (isExistUser) {
            r.setStatus(400).setMessage('User already exist.');
            return r;
        }
        const data = await this.db.add(name, this.hashPassword(password));
        r.setStatus(200).setData(data);
        return r;
    }

    updateByName(name: string, data: DeepPartial<UserT>) {}

    private hashPassword(password: string) {
        return hashSync(password, 10);
    }

    private comparePassword(password: string, hash: string) {
        return compareSync(password, hash);
    }
}
