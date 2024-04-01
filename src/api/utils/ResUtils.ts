import { ErrorCode, BaseErrorRes, BaseRes } from './ResBaseTypes';

export class ResUtils {
    /**
     * 対象が見つからなかった場合のエラーを返す
     * @param target 対象の名前
     */
    static notFoundError(target: string): BaseErrorRes {
        return {
            code: ErrorCode.notFound,
            message: `${target} not found.`,
        };
    }

    static internalError(): BaseErrorRes {
        return {
            code: ErrorCode.internal,
            message: 'Internal Error. If this persists, please contact the developer.',
        };
    }
}
