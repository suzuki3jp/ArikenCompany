export interface Settings {
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
}
