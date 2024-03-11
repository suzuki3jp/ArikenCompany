import { sign, verify } from 'jsonwebtoken';

import { env } from '@/managers';

export class TokenManager {
    constructor() {}

    async generateToken(payload: TokenData) {
        return sign(payload, env.cache.SECRET, { expiresIn: '7d' });
    }

    async verifyToken(token: string) {
        const payload = verify(token, env.cache.SECRET);
        // @ts-expect-error stringにiatプロパティが存在しないが、おそらくstringが返ってくることはないためignore
        delete payload.iat;
        return payload as TokenData;
    }
}

export interface TokenData {
    id: number;
    name: string;
    password: string;
}
