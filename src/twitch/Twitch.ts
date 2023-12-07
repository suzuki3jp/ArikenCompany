import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

import { ArikenCompany } from '../ArikenCompany';
import { ADD_COMMAND, EDIT_COMMAND, REMOVE_COMMAND, COOLDOWN, SET_COOLDOWN } from '../constants';
import type { CommandT } from '../database';
import { CommandManager } from '../managers';
import { Message, Logger, dayjs } from '../packages';
import { CommandParser, ValueParser } from '../parsers';

export class Twitch {
    public auth: RefreshingAuthProvider;
    public logger: Logger;
    public ac: ArikenCompany;
    public chat: Chat;
    public api: ApiClient;

    constructor(ac: ArikenCompany) {
        this.ac = ac;
        this.logger = this.ac.logger.createChild('Twitch');
        this.auth = this.setupAuth();

        this.chat = new Chat(this);
        this.api = new ApiClient({ authProvider: this.auth });
    }

    private setupAuth(): RefreshingAuthProvider {
        const auth = new RefreshingAuthProvider({
            clientId: this.ac.env.cache.TWITCH_CLIENTID,
            clientSecret: this.ac.env.cache.TWITCH_CLIENTSECRET,
        });
        auth.onRefresh(async (userId, token) => {
            this.logger.info('Refreshed Twitch token.');

            this.ac.env.changeCache({
                TWITCH_TOKEN: token.accessToken,
                TWITCH_REFRESHTOKEN: token.refreshToken ?? undefined,
            });
            this.ac.env.writeFromCache();
        });

        auth.addUser(
            this.ac.settings.cache.twitch.id,
            {
                accessToken: this.ac.env.cache.TWITCH_TOKEN,
                refreshToken: this.ac.env.cache.TWITCH_REFRESHTOKEN,
                expiresIn: 0,
                obtainmentTimestamp: 0,
            },
            ['chat']
        );

        this.logger.info(`Twitch Auth Setup. twitch.user.${this.ac.settings.cache.twitch.id}`);
        return auth;
    }

    start() {
        this.logger.info('Starting Twitch Clients. [Chat]');
        this.chat.start();
    }
}

class Chat {
    public client: ChatClient;

    private logger: Logger;

    constructor(private twitch: Twitch) {
        this.logger = this.twitch.logger.createChild('Chat');
        this.client = new ChatClient({
            authProvider: this.twitch.auth,
            channels: this.twitch.ac.settings.cache.twitch.channels,
        });
    }

    loadEvents() {
        this.logger.info('Loading twitch events.');
        this.client.onMessage((...args) => this.onMessage(...args));
    }

    start() {
        this.loadEvents();
        this.client.connect();
        this.logger.info(`Connecting Twitch Chat in [${this.twitch.ac.settings.cache.twitch.channels.join(', ')}].`);
    }

    async onMessage(...args: [string, string, string, ChatMessage]) {
        const message = new Message(this.twitch, ...args);
        const chat = new TwitchChat(this.twitch.ac, message);

        if (!chat.isCommand()) return;

        if (chat.isManageCommand()) {
            if (!chat.isManager()) return;
            switch (chat.name) {
                case ADD_COMMAND:
                    chat.reply(await chat.addCommand());
                    break;
                case EDIT_COMMAND:
                    chat.reply(await chat.editCommand());
                    break;
                case REMOVE_COMMAND:
                    chat.reply(await chat.removeCommand());
                    break;
                case COOLDOWN:
                    chat.reply(await chat.getCoolDown());
                    break;
                case SET_COOLDOWN:
                    chat.reply(await chat.setCoolDown());
                    break;
                default:
                    break;
            }
        } else {
            const cmd = await chat.normalCommand();
            if (!cmd) return;
            if (!chat.isCooldown(cmd)) return;
            const r = await new ValueParser(this.twitch.ac, cmd.content, message).parse();
            chat.reply(r.error ?? r.toJSON().parsed);
            chat.updateUsedAt(cmd.name);
        }
    }
}

class TwitchChat {
    public name: string;

    private cmd: CommandManager;
    private parser: CommandParser;

    constructor(private ac: ArikenCompany, private message: Message) {
        this.parser = new CommandParser(this.ac, this.message.content);
        this.cmd = this.ac.cmd;
        this.name = this.parser.name;
    }

    isCommand(): boolean {
        return this.parser.isCommand;
    }

    isManageCommand(): boolean {
        const c = this.parser.name;
        if (c === ADD_COMMAND) return true;
        if (c === EDIT_COMMAND) return true;
        if (c === REMOVE_COMMAND) return true;
        if (c === COOLDOWN) return true;
        if (c === SET_COOLDOWN) return true;
        return false;
    }

    isManager(): boolean {
        if (this.message.user.isBroadCaster) return true;
        if (this.message.user.isMod) return true;
        return false;
    }

    isVip(): boolean {
        if (this.message.user.isBroadCaster) return true;
        if (this.message.user.isMod) return true;
        if (this.message.user.isVip) return true;
        return false;
    }

    async addCommand(): Promise<string> {
        const { name, content } = this.validateCommandData(this.parser.args);

        if (!(name && content)) return 'コマンドの引数が不正です。コマンド名と内容を入力してください。';
        return await this.cmd.addCommand(name, content);
    }

    async editCommand(): Promise<string> {
        const { name, content } = this.validateCommandData(this.parser.args);

        if (!(name && content)) return `コマンドの引数が不正です。コマンド名と内容を入力してください。`;
        return await this.cmd.editCommand(name, content);
    }

    async removeCommand(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        return await this.cmd.removeCommand(name);
    }

    async getCoolDown(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        const r = await this.cmd.getCooldown(name);
        if (!r) return `存在しないコマンド名です。`;
        return `${name} のクールダウンは ${r} 秒です。`;
    }

    async setCoolDown(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);
        const cooldown = Number(this.parser.args[1]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        if (isNaN(cooldown)) return `クールダウンには数字を入力してください。`;
        return await this.cmd.setCooldown(name, cooldown);
    }

    async normalCommand() {
        const name = this.validateCommandName(this.parser.name);
        if (!name) return null;
        return await this.cmd.getCommand(name);
    }

    reply(content: string) {
        this.message.reply(content);
    }

    private validateCommandName(n: string): string | null {
        if (!n) return null;
        return n.toLowerCase();
    }

    public isCooldown(command: CommandT): boolean {
        if (this.isVip()) return true;
        const now = dayjs();
        const lastUsed = dayjs(command.used_at);
        const cooldown = command.cooldown ?? 0;
        const cooldownMilli = cooldown * 1000;
        return now.diff(lastUsed, 'millisecond') > cooldownMilli;
    }

    public updateUsedAt(name: string) {
        return this.cmd.updateUsedAt(name);
    }

    private validateCommandData(args: string[]): { name: string | null; content: string | null } {
        let [name, ...contents]: (string | null)[] = args;
        let content: string | null = contents.join(' ');
        if (!name) name = null;
        if (!content) content = null;
        return { name, content };
    }
}
