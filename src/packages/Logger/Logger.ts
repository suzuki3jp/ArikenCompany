import { LogFileManager } from './LogFileManager';
import { JST } from '../JST/JST';

export class Logger {
    public parent: Logger | null;
    public file: LogFileManager;

    constructor(public name: string, parent?: Logger) {
        this.parent = parent ?? null;

        // 親がいる場合はファイルマネージャーを親からとってくる
        if (this.parent) {
            this.file = this.parent.file;
        } else {
            this.file = new LogFileManager();
        }
    }

    public createChild(name: string): Logger {
        return new Logger(name, this);
    }

    public system(...messages: string[]) {
        this.log('SYSTEM', ...messages);
    }

    public info(...messages: string[]) {
        this.log('INFO', ...messages);
    }

    public debug(...messages: string[]) {
        this.log('DEBUG', ...messages);
    }

    private log(level: LogLevel, ...messages: string[]) {
        const message = this.makeMessage(level, ...messages);
        console.log(message);

        if (level === 'DEBUG') {
            this.file.appendDebugLog(message);
        } else {
            this.file.appendProdLog(message);
        }
    }

    private makeMessage(level: LogLevel, ...messages: string[]): string {
        let parents: Logger[] = [];
        let child: Logger = this;

        while (child.parent) {
            parents.unshift(child.parent);
            child = child.parent;
        }

        return [
            `[${new JST().toString()} JST]`,
            `[${[...parents, this].map((i) => i.name).join('/')}]`,
            `[${level.toUpperCase()}]`,
            ...messages,
        ].join(' ');
    }
}

type LogLevel = 'SYSTEM' | 'INFO' | 'DEBUG';
