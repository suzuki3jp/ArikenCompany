import { APIEmbed, Client, EmbedBuilder } from 'discord.js';

import { DiscordActionRows } from './DiscordComponents';
import { ArikenCompany } from '../ArikenCompany';
import { CommandT } from '../database';
import type { CommandManager } from '../managers';
import { Logger, splitArrayByNumber } from '../packages';

export class ManageCommandPanel {
    private cmd: CommandManager;
    private logger: Logger;

    private channelId: string;
    private messageId: string | null;
    constructor(private ac: ArikenCompany, private client: Client) {
        this.cmd = this.ac.cmd;
        this.logger = this.ac.logger.createChild('ManageCommandPanel');
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

        // 最初のページだから戻るボタンは無効にする
        const m = await channel.send({
            embeds: [this.createEmbedData(commands)[0]],
            components: [
                this.setPageControllerButtonDisabled({ previous: true, next: false }),
                DiscordActionRows.commandController,
            ],
        });
        this.channelId = m.channelId;
        this.messageId = m.id;
        this.ac.settings.writePartial({
            discord: { manageCommandPanelId: this.messageId, manageCommandChannelId: this.channelId },
        });
        this.logger.info(`Created manage command panel.`);
    }

    /**
     * Create a manage command panel embed data.
     * @params {CommandT[]} commands
     */
    createEmbedData(commands: CommandT[]) {
        const embeds: APIEmbed[] = [];
        const splitedCommands = splitArrayByNumber(commands, 10);
        for (let i = 0; i < splitedCommands.length; i++) {
            const commands = splitedCommands[i];
            const embed = new EmbedBuilder();
            embed.setTitle('コマンド一覧');
            embed
                .setDescription(
                    commands
                        .map((c) => {
                            return `**${c.name}** ${c.content}`;
                        })
                        .join('\n')
                )
                .setFooter({
                    text: `現在のページ: ${i + 1}/${splitedCommands.length}`,
                });
            embeds.push(embed.toJSON());
        }
        return embeds;
    }

    private setPageControllerButtonDisabled(buttons: { previous: boolean; next: boolean }) {
        DiscordActionRows.pageController.components[0].setDisabled(buttons.previous);
        DiscordActionRows.pageController.components[1].setDisabled(buttons.next);
        return DiscordActionRows.pageController;
    }
}
