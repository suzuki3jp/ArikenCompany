/**
 * 操作全般に関するログのためのメタデータ
 */
export interface OperationMetadata {
    provider: 'API' | 'TWITCH' | 'DISCORD';

    /**
     * 操作の実行者の名前
     */
    name: string;
}
