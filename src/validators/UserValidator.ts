import { z } from 'zod';

import { Result, Success, Failure } from '@/packages';

export class UserValidator {
    private static readonly userNameMin = 1;
    private static readonly userNameMax = 20;

    private static readonly passwordMin = 8;
    private static readonly passwordMax = 32;

    /**
     * idを検証する
     * @param id
     */
    public static id(id: string): Result<string, string> {
        const idSchema = z.string().uuid();
        const result = idSchema.safeParse(id);

        if (result.success) return new Success('id is valid uuid');
        return new Failure('id is not valid uuid');
    }

    /**
     * ユーザーネームを検証する
     */
    public static username(name: string): Result<string, string> {
        const usernameSchema = z.string().min(this.userNameMin).max(this.userNameMax);
        const result = usernameSchema.safeParse(name);

        if (result.success) return new Success('name is valid username');
        return new Failure(`name is not valid username`);
    }

    /**
     * パスワードを検証する
     * @param pass
     */
    public static password(pass: string): Result<string, string> {
        const passSchema = z.string().min(this.passwordMin).max(this.passwordMax);
        const result = passSchema.safeParse(pass);

        if (result.success) return new Success('pass is valid password');
        return new Failure(`pass is not valid password`);
    }
}
