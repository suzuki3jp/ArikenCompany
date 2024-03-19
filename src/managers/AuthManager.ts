import { compareSync, hashSync } from 'bcrypt';
import { UUID } from 'crypto';
import jwt from 'jsonwebtoken';

import { env, rootLogger } from '@/initializer';
import { Failure, Logger, Result, Success } from '@/packages';
import { UserManager } from '@/managers/UserManager';
import { UserRoleT, UserRole } from '@/database';

/**
 * JWTやパスワードを安全に扱うためのクラス
 */
export class AuthManager {
    private static logger: Logger = rootLogger.createChild('AuthManager');
    constructor() {}

    /**
     * ユーザーのトークンを発行する
     * @param id
     */
    public static signToken(id: string): string {
        AuthManager.logger.debug(`Signing token id: ${id}`);
        return jwt.sign({ id }, env.cache.SECRET, { expiresIn: '7d' });
    }

    public static verifyToken(token: string): Result<TokenPayload, string> {
        AuthManager.logger.debug(`Verifying token`);
        try {
            const decoded = jwt.verify(token, env.cache.SECRET);
            if (!AuthManager.isTokenPayload(decoded)) return new Failure('token is invalid');
            return new Success(decoded);
        } catch (err) {
            AuthManager.logger.debug('Received error durning token verify');
            if (err instanceof Error) return new Failure(err.message);
            return new Failure('token is invalid');
        }
    }

    public static isTokenPayload(data: string | jwt.JwtPayload | undefined): data is TokenPayload {
        if (typeof data === 'string') return false;
        if (typeof data === 'undefined') return false;

        if (!UserManager.isUUID(data.id)) return false;
        return true;
    }

    /**
     * パスワードをハッシュ化する
     */
    public static hashPass(pass: string): string {
        return hashSync(pass, 10);
    }

    /**
     * パスワードを検証する
     */
    public static comparePass(pass: string, hashed: string) {
        return compareSync(pass, hashed);
    }

    /**
     * ユーザーが十分なロールを持っているか検証する
     * @param userRole
     * @param requiredRole
     */
    public static isEnoughRole(userRole: UserRoleT, requiredRole: UserRoleT): Result<boolean, string> {
        const userRoleIndex = UserRole.indexOf(userRole);
        const requiredRoleIndex = UserRole.indexOf(requiredRole);

        if (userRoleIndex === -1) return new Failure(`userRole not found`);
        if (requiredRoleIndex === -1) return new Failure(`requiredRole not found`);
        return new Success(userRoleIndex <= requiredRoleIndex);
    }

    /**
     * 引数の文字列をUserRoleに型変換する
     */
    public static isUserRole(data: string): data is UserRoleT {
        // @ts-expect-error string
        return UserRole.includes(data);
    }
}

export interface TokenPayload {
    id: UUID;
}
