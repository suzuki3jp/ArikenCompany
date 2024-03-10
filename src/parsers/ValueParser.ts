import { Agent } from 'https';

import { ArikenCompany } from '@/ArikenCompany';
import { Message, countBy, fetch, dayjs, ValRank, ValWins, secondsToHHMMSS } from '@/packages';

const STARTING_DELIMITER = '${';
const ENDING_DELIMITER = '}';

export class ValueParser {
    constructor(private ac: ArikenCompany, private content: string, private message: Message) {}

    async parse() {
        const result = new ValueParseResult();
        const startingDelimiterLength = countBy(this.content, STARTING_DELIMITER);
        const endingDelimiterLength = countBy(this.content, ENDING_DELIMITER);

        if (startingDelimiterLength > endingDelimiterLength) {
            result.setError('コマンドの内容が不正です。${}の対応関係が崩れています。');
            return result;
        }

        while (this.content.length > 0) {
            let startingDelimiterIndexOf = this.content.indexOf(STARTING_DELIMITER);
            let endingDelimiterIndexOf = this.content.indexOf(ENDING_DELIMITER, startingDelimiterIndexOf);

            if (startingDelimiterIndexOf !== -1) {
                const code = this.content.slice(
                    startingDelimiterIndexOf + STARTING_DELIMITER.length,
                    endingDelimiterIndexOf
                );
                result.pushToParsed(this.content.slice(0, startingDelimiterIndexOf));
                const parseCodeResult = await this.parseCode(code);

                // エラーが出ている場合はエラーをセット
                if (parseCodeResult.error) result.setError(parseCodeResult.error);
                result.pushToParsed(parseCodeResult.toJSON().parsed);

                this.content = this.content.slice(endingDelimiterIndexOf + 1);
            } else {
                result.pushToParsed(this.content);
                this.content = '';
            }
        }
        return result;
    }

    private async parseCode(code: string) {
        const r = new ValueParseResult();
        code = code.trim();
        const [f, ...args] = code.split(' ');

        switch (f) {
            case 'fetch':
                reflectResult(await this.parseFetch(...args), r);
                break;
            case 'title':
                r.pushToParsed(await this.parseTitle());
                break;
            case 'game':
                r.pushToParsed(await this.parseGame());
                break;
            case 'uptime':
                r.pushToParsed(await this.parseUptime(...args));
                break;
            case 'vlrank':
                reflectResult(await this.parseVlrank(...args), r);
                break;
            case 'vlwins':
                reflectResult(await this.parseVlwins(...args), r);
                break;
            default:
                break;
        }
        return r;
    }

    private async parseFetch(...args: string[]): Promise<ValueParseResult> {
        const r = new ValueParseResult();
        const url = args[0];

        if (!url) r.setError('fetch関数には第一引数にurlを渡す必要があります');

        const res = await fetch(url, { httpsAgent: new Agent({ rejectUnauthorized: false }) });
        if (res.status !== 200) r.setError(`サーバーからエラーコード${res.status}が返されました。`);
        r.pushToParsed(String(res.data));
        return r;
    }

    private async parseTitle(): Promise<string> {
        const stream = await this.ac.twitch.api.streams.getStreamByUserName(this.message.channel.name);

        if (!stream) return 'タイトルの取得に失敗しました。';
        return stream.title;
    }

    private async parseGame(): Promise<string> {
        const stream = await this.ac.twitch.api.streams.getStreamByUserName(this.message.channel.name);

        if (!stream) return 'ゲームの取得に失敗しました。';
        return stream?.gameName || 'ゲーム未設定';
    }

    private async parseUptime(...args: string[]): Promise<string> {
        const target = args[0] || this.message.channel.name;
        const stream = await this.ac.twitch.api.streams.getStreamByUserName(target);

        if (!stream) return '配信はオフラインです。';
        const now = dayjs();
        const startedAt = dayjs(stream.startDate);
        const diff = now.diff(startedAt, 'second');
        const diffHHMMSS = secondsToHHMMSS(diff);
        return `${diffHHMMSS.hours.length === 1 ? `0${diffHHMMSS.hours}` : diffHHMMSS.hours}時間${
            diffHHMMSS.minutes.length === 1 ? `0${diffHHMMSS.minutes}` : diffHHMMSS.minutes
        }分${diffHHMMSS.seconds.length === 1 ? `0${diffHHMMSS.seconds}` : diffHHMMSS.seconds}秒}`;
    }

    private async parseVlrank(...args: string[]): Promise<ValueParseResult> {
        const r = new ValueParseResult();
        const id = args[0];
        if (!id) return r.setError('vlrank関数には第一引数にidを渡す必要があります。');

        const [name, tag] = id.split('#');
        if (!name || !tag) return r.setError('idの形式が不正です。name#tagの形式で渡してください。');

        const rank = await new ValRank().get(name, tag);
        if (typeof rank === 'number') r.setError(`サーバーからエラーコード${rank}が返されました。`);
        r.pushToParsed(rank);
        return r;
    }

    private async parseVlwins(...args: string[]): Promise<ValueParseResult> {
        const r = new ValueParseResult();
        const id = args[0];
        if (!id) return r.setError('vlwins関数には第一引数にidを渡す必要があります。');

        const [name, tag] = id.split('#');
        if (!name || !tag) return r.setError('idの形式が不正です。name#tagの形式で渡してください。');

        const wins = await new ValWins().get(name, tag);
        if (typeof wins === 'number') r.setError(`サーバーからエラーコード${wins}が返されました。`);
        r.pushToParsed(wins);
        return r;
    }
}

export class ValueValidater {
    constructor(private content: string) {}

    validate(): true | string {
        const startingDelimiterLength = countBy(this.content, STARTING_DELIMITER);
        const endingDelimiterLength = countBy(this.content, ENDING_DELIMITER);

        if (startingDelimiterLength > endingDelimiterLength)
            return 'コマンドの内容が不正です。${}の対応関係が崩れています。';

        while (this.content.length > 0) {
            let startingDelimiterIndexOf = this.content.indexOf(STARTING_DELIMITER);
            let endingDelimiterIndexOf = this.content.indexOf(ENDING_DELIMITER, startingDelimiterIndexOf);

            if (startingDelimiterIndexOf !== -1) {
                const code = this.content.slice(
                    startingDelimiterIndexOf + STARTING_DELIMITER.length,
                    endingDelimiterIndexOf
                );

                const validateCodeResult = this.validateCode(code);
                if (typeof validateCodeResult === 'string') return validateCodeResult;

                this.content = this.content.slice(endingDelimiterIndexOf + 1);
            } else {
                this.content = '';
            }
        }
        return true;
    }

    private validateCode(code: string): true | string {
        code = code.trim();
        const [f, ...args] = code.split(' ');

        switch (f) {
            case 'fetch':
                return this.validateFetch(...args);
            case 'title':
                return true;
            case 'game':
                return true;
            case 'uptime':
                return true;
            case 'vlrank':
                return this.validateVlrank(...args);
            case 'vlwins':
                return this.validateVlrank(...args);
            default:
                return '存在しない関数です。';
        }
    }

    private validateFetch(...args: string[]): true | string {
        const url = args[0];

        if (!url) return 'fetch関数には第一引数にurlを渡す必要があります';

        return true;
    }

    private validateVlrank(...args: string[]): true | string {
        const id = args[0];
        if (!id) return 'vlrank関数には第一引数にidを渡す必要があります。';

        const [name, tag] = id.split('#');
        if (!name || !tag) return 'idの形式が不正です。name#tagの形式で渡してください。';

        return true;
    }
    private validateVlWins(...args: string[]): true | string {
        const id = args[0];
        if (!id) return 'vlWins関数には第一引数にidを渡す必要があります。';

        const [name, tag] = id.split('#');
        if (!name || !tag) return 'idの形式が不正です。name#tagの形式で渡してください。';

        return true;
    }
}

export class ValuePublisher {
    private result = '';
    constructor(private content: string) {}

    toPublic(): string {
        while (this.content.length > 0) {
            let startingDelimiterIndexOf = this.content.indexOf(STARTING_DELIMITER);
            let endingDelimiterIndexOf = this.content.indexOf(ENDING_DELIMITER, startingDelimiterIndexOf);

            if (startingDelimiterIndexOf !== -1) {
                const code = this.content.slice(
                    startingDelimiterIndexOf + STARTING_DELIMITER.length,
                    endingDelimiterIndexOf
                );

                const publishedCode = this.toPublicCode(code);
                this.result = this.result + publishedCode;

                this.content = this.content.slice(endingDelimiterIndexOf + 1);
            } else {
                this.result = this.content;
                this.content = '';
            }
        }
        return this.result;
    }

    private toPublicCode(code: string): string {
        code = code.trim();
        const [f, ...args] = code.split(' ');
        return `[${f}]`;
    }
}

class ValueParseResult {
    public error: string | null;
    private parsed: string;

    constructor() {
        this.error = null;
        this.parsed = '';
    }

    pushToParsed(content?: string | number) {
        // 以前にエラーが出ている場合プッシュしない
        if (this.error) return;

        // エラー時にリターンしない場合の引数に型を合わせる
        if (typeof content === 'undefined') return;
        this.parsed = `${this.parsed}${content}`;
    }

    setError(error: string) {
        this.error = error;
        return this;
    }

    toJSON() {
        return {
            error: this.error,
            parsed: this.parsed,
        };
    }
}

function reflectResult(oldR: ValueParseResult, newR: ValueParseResult) {
    const j = oldR.toJSON();
    if (j.error) newR.setError(j.error);
    newR.pushToParsed(j.parsed);
    return newR;
}
