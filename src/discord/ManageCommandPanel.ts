import { APIEmbed, ButtonInteraction, Client, Embed, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';

import { DiscordActionRows, DiscordComponents, DiscordComponentIds } from './DiscordComponents';
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

    async previous(i: ButtonInteraction) {
        const embed = i.message.embeds[0];
        const embeds = await this.createEmbedData();
        const currentPageNum = this.getCurrentPage(embed);
        const newPageNum = currentPageNum - 1;

        let pageController = this.setPageControllerButtonDisabled({ previous: false, next: false });
        if (newPageNum === 1) {
            pageController = this.setPageControllerButtonDisabled({ previous: true, next: false });
        }

        i.message.edit({
            embeds: [embeds[newPageNum - 1]],
            components: [pageController, DiscordActionRows.commandController],
        });
        i.deferUpdate();
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

    async showAddModal(i: ButtonInteraction) {
        i.showModal(DiscordComponents.addModal);
    }

    async showEditModal(i: ButtonInteraction) {
        i.showModal(DiscordComponents.editModal);
    }

    async showRemoveModal(i: ButtonInteraction) {
        i.showModal(DiscordComponents.removeModal);
    }

    async addCommand(i: ModalSubmitInteraction) {
        const name = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandName);
        const content = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandContent);
        const r = await this.cmd.addCommand(name, content);
        i.reply(r);
    }

    async editCommand(i: ModalSubmitInteraction) {
        const name = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandName);
        const content = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandContent);
        const r = await this.cmd.editCommand(name, content);
        i.reply(r);
    }

    async removeCommand(i: ModalSubmitInteraction) {
        const name = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandName);
        const r = await this.cmd.removeCommand(name);
        i.reply(r);
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

    async reloadPanel() {
        if (!this.messageId) return;

        const channel = await this.client.channels.fetch(this.channelId);
        if (!channel?.isTextBased()) return;
        const message = await channel.messages.fetch(this.messageId);

        const embeds = await this.createEmbedData();
        const currentPageNum = this.getCurrentPage(message.embeds[0]);
        const pageController = this.setPageControllerButtonDisabled({
            previous: currentPageNum === 1,
            next: currentPageNum === embeds.length,
        });

        message.edit({
            embeds: [embeds[currentPageNum - 1]],
            components: [pageController, DiscordActionRows.commandController],
        });
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
