export interface Settings {
    discord: {
        modRoleId: string;
        guildId: string;
        manageCommandChannelId: string;
        manageCommandPanelId: string | null;
    };
    twitch: {
        id: string;
        channels: string[];
    };
    command: {
        /**
         * コマンドのプレフィックスの半角全角を区別するかどうか
         * true -> !
         * false -> ! or ！
         */
        isStrictPrefix: boolean;

        /**
         * コマンドの大文字小文字を区別するかどうか
         * true -> !hoge ≠ !Hoge
         * false -> !hoge = !Hoge
         */
        isStrictCommand: boolean;
    };
    memo: {
        /**
         * メモのチャンネルの分け方の設定
         * true -> 配信ごとに分ける タイトル名: "yyyy/mm/dd#N"
         * false -> 配信の日付ごとに分ける タイトル名: "yyyy/mm/dd"
         */
        isSplitByStream: boolean;
    };
    hostName: string;
}
