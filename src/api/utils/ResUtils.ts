import { ErrorCode, BaseErrorRes, BaseRes } from './ResBaseTypes';

export class ResUtils {
    static internalError(): BaseErrorRes {
        return {
            code: ErrorCode.internal,
            message: 'Internal Error. If this persists, please contact the developer.',
        };
    }
}
