import { defu } from 'defu';
import { DeepPartial } from 'ts-essentials';

import { readFileSync, writeFileSync } from '../packages';

export class JSONManager<T extends Record<string, any>> {
    public cache: T;

    private path: string;
    constructor(path: string) {
        this.path = path;
        this.cache = this.read();
    }

    read(): T {
        const d = JSON.parse(readFileSync(this.path));
        this.cache = d;
        return d;
    }

    write(data: string | T) {
        const d = typeof data === 'string' ? data : JSON.stringify(data, null, '\t');
        writeFileSync(this.path, d);
        this.read();
    }

    writePartial(data: DeepPartial<T>) {
        const newdata = defu(this.cache, data);
        //@ts-expect-error
        this.write(newdata);
    }
}
