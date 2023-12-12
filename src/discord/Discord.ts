import { BitFieldResolvable, Client, GatewayIntentBits, Events, Interaction } from 'discord.js';

import { DiscordComponentIds } from './DiscordComponents';
import { ManageCommandPanel } from './ManageCommandPanel';
import { ArikenCompany } from '../ArikenCompany';
import { SlashCommands } from '../constants';
import type { Logger } from '../packages';
import { CommandTemplate } from './CommandTemplate';

export class Discord {
    private ac: ArikenCompany;
    private client: Client;
    private logger: Logger;
    public mcp: ManageCommandPanel;
    public cp: CommandTemplate;

    constructor(ac: ArikenCompany) {
        this.ac = ac;
        this.client = new Client({
            intents: Object.values(GatewayIntentBits) as BitFieldResolvable<keyof typeof GatewayIntentBits, number>,
        });
        this.logger = this.ac.logger.createChild('Discord');
        this.mcp = new ManageCommandPanel(this.ac, this.client);
        this.cp = new CommandTemplate(this.ac);
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
            switch (i.commandName) {
                case 'mcp':
                    if (i.options.getSubcommand() === 'create') this.mcp.create(i.channelId);
                    break;
                case 'template':
                    this.cp.create(i);
                    break;
                default:
                    break;
            }
        } else if (i.isButton()) {
            switch (i.customId) {
                case DiscordComponentIds.button.next:
                    this.mcp.next(i);
                    break;
                case DiscordComponentIds.button.previous:
                    this.mcp.previous(i);
                    break;
                case DiscordComponentIds.button.add:
                    this.mcp.showAddModal(i);
                    break;
                case DiscordComponentIds.button.edit:
                    this.mcp.showEditModal(i);
                    break;
                case DiscordComponentIds.button.remove:
                    this.mcp.showRemoveModal(i);
                    break;
                default:
                    break;
            }
        } else if (i.isModalSubmit()) {
            switch (i.customId) {
                case DiscordComponentIds.modal.add:
                    this.mcp.addCommand(i);
                    break;
                case DiscordComponentIds.modal.edit:
                    this.mcp.editCommand(i);
                    break;
                case DiscordComponentIds.modal.remove:
                    this.mcp.removeCommand(i);
                    break;
                default:
                    break;
            }
        }
    }
}
