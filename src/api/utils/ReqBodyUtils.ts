import type { Request } from 'express';

import { Result, Success, Failure } from '@/packages';

export class ReqBodyUtils {
    /**
     * リクエストボディから値を取得し、存在するかどうか確かめる
     * @param req
     * @param keys
     */
    public static extractRequiredBody<T extends string>(req: Request, keys: T[]): Result<Record<T, string>, T[]> {
        const notFoundKeys: T[] = [];
        // @ts-expect-error {} で初期化できないが、resultを返却するときは必ず値が設定されているため
        const result: Record<T, string> = {};
        keys.forEach((k) => {
            const value = req.body[k];

            if (typeof value !== 'string') return notFoundKeys.push(k);
            result[k] = value;
        });

        if (notFoundKeys.length !== 0) return new Failure(notFoundKeys);
        return new Success(result);
    }

    /**
     * リクエストボディから値を取得する
     * @param req
     * @param keys
     */
    public static extractOptionalBody<T extends string>(
        req: Request,
        keys: T[]
    ): Result<Record<T, string | undefined>, T[]> {
        const invalidKeys: T[] = [];
        const result: Record<T, string | undefined> = {} as Record<T, string | undefined>;

        keys.forEach((k) => {
            const value = req.body[k];

            if (typeof value !== 'string' && typeof value !== 'undefined') return invalidKeys.push(k);
            result[k] = value;
            return;
        });

        if (invalidKeys.length !== 0) return new Failure(invalidKeys);
        return new Success(result);
    }
}
