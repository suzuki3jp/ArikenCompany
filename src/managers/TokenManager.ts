import { sign, verify } from 'jsonwebtoken';

import { UserT } from '../database';
import { ArikenCompany } from '../ArikenCompany';

export class TokenManager {
    constructor(private ac: ArikenCompany) {}

    async generateToken(payload: TokenData) {
        return sign(payload, this.ac.env.cache.SECRET, { expiresIn: '7d' });
    }

    async verifyToken(token: string) {
        const payload = verify(token, this.ac.env.cache.SECRET);
        // @ts-expect-error
        delete payload.iat;
        return payload as TokenData;
    }
}

export interface TokenData {
    id: number;
    name: string;
    password: string;
}
