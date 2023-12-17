import { hashSync, compareSync } from 'bcrypt';
import { DeepPartial } from 'ts-essentials';

import { UserDB, UserT } from '../database';
import { ArikenCompany } from '../ArikenCompany';
import { HttpResult } from '../packages';
import { TokenManager } from './TokenManager';
import { HttpStatusCode } from 'axios';

/**
 * Manager for user db.
 */
export class UserManager {
    private db: UserDB;
    public tokenM: TokenManager;

    constructor(private ac: ArikenCompany) {
        this.db = new UserDB();
        this.tokenM = new TokenManager(this.ac);
    }

    async login(name: string, password: string): Promise<HttpResult<UserResponseData>> {
        const r = new HttpResult<UserResponseData>();
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
        const { id } = user;
        const token = await this.tokenM.generateToken(createTokenPayload(user));
        r.setStatus(200).setData({ id, name, token });
        return r;
    }

    async add(name: string, password: string): Promise<HttpResult<UserResponseData>> {
        const r = new HttpResult<UserResponseData>();
        const isExistUser = Boolean(await this.db.getByName(name));
        if (isExistUser) {
            r.setStatus(400).setMessage('User already exist.');
            return r;
        }
        const data = await this.db.add(name, this.hashPassword(password));
        const { id } = data;
        const token = await this.tokenM.generateToken(createTokenPayload(data));
        r.setStatus(200).setData({ id, name, token });
        return r;
    }

    async remove(id: number): Promise<HttpResult<string>> {
        const r = new HttpResult<string>();
        const isExistUser = Boolean(await this.db.getById(id));
        if (!isExistUser) {
            r.setStatus(404).setMessage('User not found.');
            return r;
        }
        const removedUser = await this.db.removeById(id);
        r.setStatus(200).setData(removedUser.name);
        return r;
    }

    private hashPassword(password: string) {
        return hashSync(password, 10);
    }

    private comparePassword(password: string, hash: string) {
        return compareSync(password, hash);
    }

    private toPublicUser(user: UserT): PublicUserData {
        return {
            name: user.name,
        };
    }
}

interface PublicUserData {
    name: string;
}

export interface UserResponse {
    status: keyof HttpStatusCode;
    message?: string;
    data?: UserResponseData;
}

export interface UserResponseData {
    id: number;
    name: string;
    token: string;
}

export function createTokenPayload(user: UserT) {
    return {
        id: user.id,
        name: user.name,
        password: user.password,
    };
}
