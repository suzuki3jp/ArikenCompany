import {
    APIEmbed,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    Client,
    Embed,
    EmbedBuilder,
    ModalSubmitInteraction,
} from 'discord.js';

import { rootLogger } from '@/initializer';
import { ArikenCompany } from '@/ArikenCompany';
import { settings, type CommandManager } from '@/managers';
import { Logger, splitArrayByNumber } from '@/packages';
import { DiscordActionRows, DiscordComponents, DiscordComponentIds } from '@/discord/DiscordComponents';
import { OperationMetadata } from '@/typings';

export class ManageCommandPanel {
    private cmd: CommandManager;
    private logger: Logger;

    private channelId: string;
    private messageId: string | null;
    constructor(private ac: ArikenCompany, private client: Client) {
        this.cmd = this.ac.cmd;
        this.logger = rootLogger.createChild('ManageCommandPanel');
        this.channelId = settings.cache.discord.manageCommandChannelId;
        this.messageId = settings.cache.discord.manageCommandPanelId;
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
            components: [this.disablePCButton(1, embeds.length), DiscordActionRows.commandController],
        });
        this.channelId = m.channelId;
        this.messageId = m.id;
        settings.writePartial({
            discord: { manageCommandPanelId: this.messageId, manageCommandChannelId: this.channelId },
        });
        this.logger.info(`Created manage command panel.`);
    }

    async previous(i: ButtonInteraction) {
        const embed = i.message.embeds[0];
        const embeds = await this.createEmbedData();
        const currentPageNum = this.getCurrentPage(embed);
        const newPageNum = currentPageNum - 1;

        i.message.edit({
            embeds: [embeds[newPageNum - 1]],
            components: [this.disablePCButton(newPageNum, embeds.length), DiscordActionRows.commandController],
        });
        i.deferUpdate();
    }

    async next(i: ButtonInteraction) {
        const embed = i.message.embeds[0];
        const embeds = await this.createEmbedData();
        const currentPageNum = this.getCurrentPage(embed);
        const newPageNum = currentPageNum + 1;

        i.message.edit({
            embeds: [embeds[newPageNum - 1]],
            components: [this.disablePCButton(newPageNum, embeds.length), DiscordActionRows.commandController],
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

        const metadata: OperationMetadata = {
            provider: 'DISCORD',
            name: i.user.username,
        };

        const r = await this.cmd.addCommand(name, content, metadata);

        if (r.isSuccess()) {
            this.eReply(i, r.data.name + 'を追加しました。');
        } else {
            this.eReply(i, r.data.message);
        }
    }

    async editCommand(i: ModalSubmitInteraction) {
        const name = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandName);
        const content = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandContent);

        const metadata: OperationMetadata = {
            provider: 'DISCORD',
            name: i.user.username,
        };

        const r = await this.cmd.editCommand(name, { content }, metadata);

        if (r.isSuccess()) {
            this.eReply(i, r.data.name + 'を編集しました。');
        } else {
            this.eReply(i, r.data.message);
        }
    }

    async removeCommand(i: ModalSubmitInteraction) {
        const name = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandName);

        const metadata: OperationMetadata = {
            provider: 'DISCORD',
            name: i.user.username,
        };

        const r = await this.cmd.removeCommand(name, metadata);

        if (r.isSuccess()) {
            this.eReply(i, r.data.name + 'を削除しました。');
        } else {
            this.eReply(i, r.data.message);
        }
    }

    async createEmbedData() {
        const commands = await this.cmd.getAll();
        if (commands.length === 0)
            return [
                {
                    title: 'コマンド一覧',
                    description: 'コマンドがありません。',
                },
            ];
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
                            return `**${c.name}** ${c.content} ${c.mod_only ? ':crossed_swords:' : ''}`;
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
        const pageController = this.disablePCButton(currentPageNum, embeds.length);

        message.edit({
            embeds: [embeds[currentPageNum - 1]],
            components: [pageController, DiscordActionRows.commandController],
        });
    }

    private disablePCButton(currentPageNum: number, totalPages: number) {
        const pageController = DiscordActionRows.pageController;
        if (currentPageNum === 1) {
            if (totalPages === 1) {
                this.setPageControllerButtonDisabled(pageController, { previous: true, next: true });
            } else {
                this.setPageControllerButtonDisabled(pageController, { previous: true, next: false });
            }
        } else if (currentPageNum === totalPages) {
            this.setPageControllerButtonDisabled(pageController, { previous: false, next: true });
        } else {
            this.setPageControllerButtonDisabled(pageController, { previous: false, next: false });
        }
        return pageController;
    }

    private setPageControllerButtonDisabled(
        c: ActionRowBuilder<ButtonBuilder>,
        buttons: { previous: boolean; next: boolean }
    ) {
        c.components[0].setDisabled(buttons.previous);
        c.components[1].setDisabled(buttons.next);
        return c;
    }

    private getCurrentPage(embed: Embed) {
        const footer = embed.footer?.text;
        if (!footer) return 1;
        const [currentPage, totalPages] = footer.split(' ')[1].split('/');
        return Number(currentPage);
    }

    /**
     * インタラクションにephemeral状態でリプライする
     */
    private eReply(i: ModalSubmitInteraction, content: string) {
        return i.reply({ content, ephemeral: true });
    }
}
