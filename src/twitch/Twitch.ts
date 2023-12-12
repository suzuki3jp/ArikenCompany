import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, ChatMessage } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

import { ArikenCompany } from '../ArikenCompany';
import { Command } from './Command';
import { ADD_COMMAND, EDIT_COMMAND, REMOVE_COMMAND, COOLDOWN, SET_COOLDOWN } from '../constants';
import { Message, Logger } from '../packages';
import { ValueParser } from '../parsers';

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
        const command = new Command(this.twitch.ac, message);

        if (!command.isCommand()) return;

        if (command.isManageCommand()) {
            if (!command.isManager()) return;
            switch (command.name) {
                case ADD_COMMAND:
                    command.reply(await command.addCommand());
                    break;
                case EDIT_COMMAND:
                    command.reply(await command.editCommand());
                    break;
                case REMOVE_COMMAND:
                    command.reply(await command.removeCommand());
                    break;
                case COOLDOWN:
                    command.reply(await command.getCoolDown());
                    break;
                case SET_COOLDOWN:
                    command.reply(await command.setCoolDown());
                    break;
                default:
                    break;
            }
        } else {
            const cmd = await command.normalCommand();
            if (!cmd) return;
            if (!command.isCooldown(cmd)) return;
            const r = await new ValueParser(this.twitch.ac, cmd.content, message).parse();
            command.reply(r.error ?? r.toJSON().parsed);
            command.updateUsedAt(cmd.name);
        }
    }
}
