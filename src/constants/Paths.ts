import { resolve } from 'path';

const resolvePath = (path: string) => resolve(__dirname, path);

export class Path {
    public static readonly env: string = resolvePath('../../.env');
    public static readonly settings: string = resolvePath('../../data/settings.json');
    public static readonly prodLog: string = resolvePath('../../data/prod.log');
    public static readonly debugLog: string = resolvePath('../../data/debug.log');
    public static readonly cert: string = resolvePath('/etc/letsencrypt/live/api.suzuki3jp.xyz/fullchain.pem');
    public static readonly key: string = resolvePath('/etc/letsencrypt/live/api.suzuki3jp.xyz/privkey.pem');
}
