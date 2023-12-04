import { Discord } from './discord/Discord';
import { SettingsManager, CommandManager } from './managers';
import { Env } from './utils';
import { Twitch } from './twitch/Twitch';
import { Logger } from './packages/index';

export class ArikenCompany {
    public cmd: CommandManager;
    public env: Env;
    public settings: SettingsManager;
    public logger: Logger;
    public twitch: Twitch;

    private discord: Discord;
    constructor() {
        this.logger = new Logger('ArikenCompany');
        this.env = new Env(this);
        this.cmd = new CommandManager(this);
        this.settings = new SettingsManager();
        this.discord = new Discord(this);
        this.twitch = new Twitch(this);
    }

    async start() {
        this.logger.system('Starting ArikenCompany.');
        this.discord.start();
        this.twitch.start();
    }
}