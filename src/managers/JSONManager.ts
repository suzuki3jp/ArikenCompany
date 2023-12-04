import { readFileSync as readFileSyncFs, writeFileSync as writeFileSyncFs } from 'fs';

export const readFileSync = (path: string) => readFileSyncFs(path, 'utf-8');
export const writeFileSync = (path: string, data: string) => writeFileSyncFs(path, data, 'utf-8');

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

    writePartial(data: Partial<T>) {
        const newdata = Object.assign(this.cache, data);
        this.write(newdata);
    }
}
