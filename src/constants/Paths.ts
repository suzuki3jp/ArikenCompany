import { resolve } from 'path';

const resolvePath = (path: string) => resolve(__dirname, path);

export class Path {
    public static readonly env: string = resolvePath('../../.env');
    public static readonly settings: string = resolvePath('../../data/settings.json');
}
