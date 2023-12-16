import { sign, verify } from 'jsonwebtoken';

import { UserT } from '../database';
import { ArikenCompany } from '../ArikenCompany';

export class TokenManager {
    constructor(private ac: ArikenCompany) {}

    async generateToken(payload: UserT) {
        return sign(payload, this.ac.env.cache.SECRET);
    }

    async verifyToken(token: string) {
        return verify(token, this.ac.env.cache.SECRET) as UserT;
    }
}
