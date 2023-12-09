import { BitFieldResolvable, Client, GatewayIntentBits, Events, Interaction } from 'discord.js';

import { DiscordComponentIds } from './DiscordComponents';
import { ManageCommandPanel } from './ManageCommandPanel';
import { ArikenCompany } from '../ArikenCompany';
import { SlashCommands } from '../constants';
import type { Logger } from '../packages';

export class Discord {
    private ac: ArikenCompany;
    private client: Client;
    private logger: Logger;
    private mcp: ManageCommandPanel;

    constructor(ac: ArikenCompany) {
        this.ac = ac;
        this.client = new Client({
            intents: Object.values(GatewayIntentBits) as BitFieldResolvable<keyof typeof GatewayIntentBits, number>,
        });
        this.logger = this.ac.logger.createChild('Discord');
        this.mcp = new ManageCommandPanel(this.ac, this.client);
    }

    loadEvents() {
        this.logger.info('Loading discord events.');
        this.client.on(Events.ClientReady, (c: Client<true>) => this.ready());
        this.client.on(Events.InteractionCreate, (i) => this.interactionCreate(i));
    }

    async start() {
        this.logger.info('Starting Discord Client.');
        this.loadEvents();
        this.client.login(this.ac.env.cache.DISCORD_TOKEN);
    }

    async ready() {
        this.logger.info('Discord client is ready.');
        this.client.application?.commands.set(SlashCommands, this.ac.settings.cache.discord.guildId);
    }

    async interactionCreate(i: Interaction) {
        if (i.isChatInputCommand()) {
            if (i.commandName === 'mcp') {
                if (i.options.getSubcommand() === 'create') {
                    this.mcp.create(i.channelId);
                }
            }
        } else if (i.isButton()) {
            if (i.customId === DiscordComponentIds.button.next) {
                this.mcp.next(i);
            }
            if (i.customId === DiscordComponentIds.button.previous) {
                this.mcp.previous(i);
            }
        }
    }
}
