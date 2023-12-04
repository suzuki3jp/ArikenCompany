import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

import { ArikenCompany } from '../ArikenCompany';
import { ADD_COMMAND, EDIT_COMMAND, REMOVE_COMMAND, COOLDOWN, SET_COOLDOWN } from '../constants';
import { CommandManager } from '../managers';
import { Message, Logger } from '../packages';
import { CommandParser } from '../parsers';

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
                    break;
                case SET_COOLDOWN:
                    break;
                default:
                    break;
            }
        } else {
            const cmdContent = await chat.normalCommand();
            if (!cmdContent) return;
            chat.reply(cmdContent);
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

    async addCommand(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);
        const content = this.validateCommandContent(this.parser.args[1]);

        if (!(name && content)) return 'コマンドの引数が不正です。コマンド名と内容を入力してください。';
        return await this.cmd.addCommand(name, content);
    }

    async editCommand(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);
        const content = this.validateCommandContent(this.parser.args[1]);

        if (!(name && content)) return `コマンドの引数が不正です。コマンド名と内容を入力してください。`;
        return await this.cmd.editCommand(name, content);
    }

    async removeCommand(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        return await this.cmd.removeCommand(name);
    }

    async normalCommand(): Promise<string | null> {
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

    private validateCommandContent(c: string): string | null {
        if (!c) return null;
        return c;
    }
}
