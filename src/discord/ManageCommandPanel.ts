import { APIEmbed, ButtonInteraction, Client, Embed, EmbedBuilder } from 'discord.js';

import { DiscordActionRows } from './DiscordComponents';
import { ArikenCompany } from '../ArikenCompany';
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
        if (!channel?.isTextBased()) return;

        // 最初のページだから戻るボタンは無効にする
        const embeds = await this.createEmbedData();
        const m = await channel.send({
            embeds: [embeds[0]],
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

    async next(i: ButtonInteraction) {
        const embed = i.message.embeds[0];
        const embeds = await this.createEmbedData();
        const currentPageNum = this.getCurrentPage(embed);
        const newPageNum = currentPageNum + 1;
        const totalPages = embeds.length;

        let pageController = this.setPageControllerButtonDisabled({ previous: false, next: false });
        if (newPageNum === totalPages) {
            pageController = this.setPageControllerButtonDisabled({ previous: false, next: true });
        }

        i.message.edit({
            embeds: [embeds[newPageNum - 1]],
            components: [pageController, DiscordActionRows.commandController],
        });
        i.deferUpdate();
    }

    async createEmbedData() {
        const commands = await this.cmd.getAll();
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

    private getCurrentPage(embed: Embed) {
        const footer = embed.footer?.text;
        if (!footer) return 1;
        const [currentPage, totalPages] = footer.split(' ')[1].split('/');
        return Number(currentPage);
    }
}
