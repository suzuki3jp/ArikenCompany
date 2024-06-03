import { config } from 'dotenv';

import { rootLogger } from '@/initializer';
import { Path } from '@/constants/index';
import { toEnv, writeFileSync, Logger } from '@/packages/index';
import { EnvCache } from '@/typings/index';

export class EnvManager {
    public cache: EnvCache;

    private logger: Logger;
    constructor() {
        this.logger = rootLogger.createChild('EnvManager');
        const env = config().parsed;

        this.logger.info(`Loaded env data. [${env ? Object.keys(env).join(', ') : ''}]`);

        const {
            DISCORD_TOKEN,
            TWITCH_CLIENTID,
            TWITCH_CLIENTSECRET,
            TWITCH_TOKEN,
            TWITCH_REFRESHTOKEN,
            DATABASE_URL,
            SECRET,
            HENRIKAPI_TOKEN,
        } = process.env;

        if (!DISCORD_TOKEN) throw envError('DISCORD_TOKEN');
        if (!TWITCH_CLIENTID) throw envError('TWITCH_CLIENTID');
        if (!TWITCH_CLIENTSECRET) throw envError('TWITCH_CLIENTSECRET');
        if (!TWITCH_TOKEN) throw envError('TWITCH_TOKEN');
        if (!TWITCH_REFRESHTOKEN) throw envError('TWITCH_REFRESHTOKEN');
        if (!DATABASE_URL) throw envError('DATABASE_URL');
        if (!SECRET) throw envError('SECRET');
        if (!HENRIKAPI_TOKEN) throw envError('HENRIKAPI_TOKEN');

        this.cache = {
            DISCORD_TOKEN,
            TWITCH_CLIENTID,
            TWITCH_CLIENTSECRET,
            TWITCH_REFRESHTOKEN,
            TWITCH_TOKEN,
            DATABASE_URL,
            SECRET,
            HENRIKAPI_TOKEN,
        };
    }

    changeCache(cache: Partial<EnvCache>) {
        const { DISCORD_TOKEN, TWITCH_CLIENTID, TWITCH_CLIENTSECRET, TWITCH_REFRESHTOKEN, TWITCH_TOKEN } = cache;

        const newCeche: EnvCache = {
            DISCORD_TOKEN: DISCORD_TOKEN ?? this.cache.DISCORD_TOKEN,
            TWITCH_CLIENTID: TWITCH_CLIENTID ?? this.cache.TWITCH_CLIENTID,
            TWITCH_CLIENTSECRET: TWITCH_CLIENTSECRET ?? this.cache.TWITCH_CLIENTSECRET,
            TWITCH_REFRESHTOKEN: TWITCH_REFRESHTOKEN ?? this.cache.TWITCH_REFRESHTOKEN,
            TWITCH_TOKEN: TWITCH_TOKEN ?? this.cache.TWITCH_TOKEN,
            DATABASE_URL: this.cache.DATABASE_URL,
            SECRET: this.cache.SECRET,
            HENRIKAPI_TOKEN: this.cache.HENRIKAPI_TOKEN,
        };
        this.cache = newCeche;
    }

    writeFromCache() {
        const data = toEnv(this.cache);
        writeFileSync(Path.env, data);
    }
}

const envError = (name: string) => new Error(`${name} not found in .env file.`);
