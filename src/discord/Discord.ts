import { BitFieldResolvable, Client, GatewayIntentBits, Events, Interaction } from 'discord.js';

import { ArikenCompany, rootLogger } from '@/ArikenCompany';
import { SlashCommands } from '@/constants';
import type { Logger } from '@/packages';
import { settings, env } from '@/managers';
import { CommandTemplate } from '@/discord/CommandTemplate';
import { DiscordComponentIds } from '@/discord/DiscordComponents';
import { ManageCommandPanel } from '@/discord/ManageCommandPanel';

export class Discord {
    private ac: ArikenCompany;
    public client: Client;
    private logger: Logger;
    public mcp: ManageCommandPanel;
    public ct: CommandTemplate;

    constructor(ac: ArikenCompany) {
        this.ac = ac;
        this.client = new Client({
            intents: Object.values(GatewayIntentBits) as BitFieldResolvable<keyof typeof GatewayIntentBits, number>,
        });
        this.logger = rootLogger.createChild('Discord');
        this.mcp = new ManageCommandPanel(this.ac, this.client);
        this.ct = new CommandTemplate(this.ac);
    }

    loadEvents() {
        this.logger.info('Loading discord events.');
        this.client.on(Events.ClientReady, (c: Client<true>) => this.ready());
        this.client.on(Events.InteractionCreate, (i) => this.interactionCreate(i));
    }

    async start() {
        this.logger.info('Starting Discord Client.');
        this.loadEvents();
        this.client.login(env.cache.DISCORD_TOKEN);
    }

    async ready() {
        this.logger.info('Discord client is ready.');
        settings.cache.discord.guildId.forEach((id) => {
            this.logger.info(`Loading slash commands in guild ${id}.`);
            this.client.application?.commands.set([], id);
            this.client.application?.commands.set(SlashCommands, id);
        });
    }

    async interactionCreate(i: Interaction) {
        if (i.isChatInputCommand()) {
            switch (i.commandName) {
                case 'mcp':
                    if (i.options.getSubcommand() === 'create') this.mcp.create(i.channelId);
                    break;
                case 'template':
                    this.ct.create(i);
                    break;
                case 'sn':
                    if (i.options.getSubcommand() === 'add') this.ac.twitch.eventSub.sn.add(i);
                    if (i.options.getSubcommand() === 'remove') this.ac.twitch.eventSub.sn.remove(i);
                    break;
                case 'mp':
                    if (i.options.getSubcommand() === 'setup') this.ac.twitch.eventSub.sn.setupMemoPanel(i);
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
                case DiscordComponentIds.button.addTemplate:
                    this.ct.showAddModal(i);
                    break;
                case DiscordComponentIds.button.sendMemo:
                    this.ac.twitch.eventSub.sn.showSendMemoModal(i);
                    break;
                default:
                    if (i.customId.startsWith(DiscordComponentIds.button.commandTemplate)) {
                        this.ct.editCommandFromTemplate(i);
                    }
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
                case DiscordComponentIds.modal.addTemplate:
                    this.ct.add(i);
                    break;
                case DiscordComponentIds.modal.sendMemoModal:
                    this.ac.twitch.eventSub.sn.sendMemo(i);
                    break;
                default:
                    break;
            }
        }
    }
}
