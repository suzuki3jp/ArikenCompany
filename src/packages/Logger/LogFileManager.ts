// Imports native modules.
import fs from 'fs';

// Imports modules.
import { Path } from '../../constants';

/**
 * ログファイルに関するクラス
 */
export class LogFileManager {
    private prodPath: string = Path.prodLog;
    private debugPath: string = Path.debugLog;

    constructor() {}

    /**
     * 本番ログをファイルに追記する
     * @param data
     * @returns
     */
    public appendProdLog(data: string) {
        data = data + '\n';
        this.isExistLogFiles();
        return this.appendFileSync(this.prodPath, data);
    }

    /**
     * デバッグログをファイルに追記する。
     * @param data
     * @returns
     */
    public appendDebugLog(data: string) {
        data = data + '\n';
        this.isExistLogFiles();
        return this.appendFileSync(this.debugPath, data);
    }

    /**
     * ログファイルが存在するか確認する
     * @param isCreateFiles - 存在しなかった場合空のファイルを作成するかどうか
     */
    public isExistLogFiles(isCreateFiles: boolean = true): boolean {
        const isExistProdLog = fs.existsSync(this.prodPath);
        const isExistDebugLog = fs.existsSync(this.debugPath);

        if (isCreateFiles) {
            // 存在しなかった場合ファイルを作成する
            if (!isExistProdLog) {
                this.writeFileSync(this.prodPath, '');
            }

            if (!isExistDebugLog) {
                this.writeFileSync(this.debugPath, '');
            }

            return true;
        }
        return isExistProdLog && isExistDebugLog;
    }

    /**
     * ファイルを作成する
     * fs.writeFileSyncのラッパー関数
     * @param path
     * @param data
     */
    private writeFileSync(path: string, data: string) {
        return fs.writeFileSync(path, data, 'utf-8');
    }

    /**
     * ファイルに追記する
     * fs.appendFileSyncのラッパー関数
     * @param path
     * @param data
     * @returns
     */
    private appendFileSync(path: string, data: string) {
        return fs.appendFileSync(path, data, 'utf-8');
    }
}
