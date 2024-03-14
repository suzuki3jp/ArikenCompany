import type { Request } from 'express';

import { Result, Success, Failure } from '@/packages';

export class ReqBodyUtils {
    /**
     * リクエストボディから値を取得し、存在するかどうか確かめる
     * @param req
     * @param keys
     */
    public static extractBody<T extends string>(req: Request, keys: T[]): Result<Record<T, string>, T[]> {
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
}
