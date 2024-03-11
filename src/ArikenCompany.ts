import { Api } from '@/api/Api';
import { Discord } from '@/discord/Discord';
import { CommandManager, UserManager } from '@/managers';
import { Twitch } from '@/twitch/Twitch';
import { Logger, Cron } from '@/packages/index';

export const rootLogger = new Logger('ArikenCompany');

export class ArikenCompany {
    public cmd: CommandManager;
    public um: UserManager;
    public logger: Logger;
    public twitch: Twitch;
    public discord: Discord;
    public api: Api;
    public cron: Cron;

    constructor() {
        this.logger = rootLogger;
        this.cmd = new CommandManager(this);
        this.um = new UserManager();
        this.discord = new Discord(this);
        this.twitch = new Twitch(this);
        this.api = new Api(this);
        this.cron = new Cron();

        // デバッグログファイルをリフレッシュするジョブを設定
        // 毎週日曜朝５時に実行
        this.cron.createWeeklyJob(() => {
            this.logger.info('Refreshing debug log file...');
            this.logger.file.refreshDebugLogFile();
        });
    }

    async start() {
        this.logger.system('Starting ArikenCompany.');
        this.discord.start();
        this.twitch.start();
        this.api.start();
    }
}

process.on('uncaughtException', (err, origin) => {
    rootLogger.error('CRITICAL ERROR: ' + err.name + `(${err.message})`, `ERROR ORIGIN: ${origin}`);
    process.exit(1);
});
