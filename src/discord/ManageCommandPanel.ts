import { APIEmbed, Client, EmbedBuilder } from 'discord.js';

import { ArikenCompany } from '../ArikenCompany';
import { CommandT } from '../database';
import type { CommandManager } from '../managers';
import { splitArrayByNumber } from '../packages';

export class ManageCommandPanel {
    private cmd: CommandManager;

    private channelId: string;
    private messageId: string | null;
    constructor(private ac: ArikenCompany, private client: Client) {
        this.cmd = this.ac.cmd;
        this.channelId = this.ac.settings.cache.discord.manageCommandChannelId;
        this.messageId = this.ac.settings.cache.discord.manageCommandPanelId;
    }

    /**
     * Create a manage command panel.
     */
    async create(channelId: string) {
        const channel = await this.client.channels.fetch(channelId);
        const commands = await this.cmd.getAll();
        if (!channel?.isTextBased()) return;
        const m = await channel.send({ embeds: this.createEmbedData(commands) });
        this.messageId = m.id;
        this.ac.settings.writePartial({ discord: { manageCommandPanelId: m.id } });
    }

    /**
     * Create a manage command panel embed data.
     * @params {CommandT[]} commands
     */
    createEmbedData(commands: CommandT[]) {
        const embeds: APIEmbed[] = [];
        const splitedCommands = splitArrayByNumber(commands, 10);
        for (const commands of splitedCommands) {
            const embed = new EmbedBuilder();
            embed.setTitle('コマンド一覧');
            embed.setDescription(
                commands
                    .map((c) => {
                        return `**${c.name}** ${c.content}`;
                    })
                    .join('\n')
            );
            embeds.push(embed.toJSON());
        }
        return embeds;
    }
}
