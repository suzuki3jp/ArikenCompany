import { ValueOf } from 'ts-essentials';

export interface BaseRes<T> {
    data: T;
}

export interface BaseErrorRes {
    code: ValueOf<typeof ErrorCode>;
    message: string;
}

export const ErrorCode = {
    /**
     * リクエストのボディなど渡された値がvalidateに失敗したときやそもそも存在しない時
     */
    invalidParams: 1,

    /**
     * リクエスト中のユーザーでは実行できない操作の時
     */
    missingPermission: 2,

    /**
     * リクエストの認証情報が間違っていた場合 name, password ...
     */
    incorrectCredentials: 3,

    /**
     * 認証が必要な場面で適切な認証が行われていない場合
     */
    unauthorized: 4,

    /**
     * 内部的なエラー
     * **これを出力する場合は適切なデバッグログを出力する**
     */
    internal: 5,

    /**
     * 対象が見つからなかった場合
     */
    notFound: 6,

    /**
     * コンフリクトが起こった場合。
     * ユーザー作成時に既に存在している場合など
     */
    conflict: 7,

    /**
     * 与えられた値がバリデーションをパスしなかった場合
     */
    invalidValue: 8,
} as const;
