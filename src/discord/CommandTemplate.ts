import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ModalSubmitInteraction,
} from 'discord.js';

import { ArikenCompany } from '../ArikenCompany';
import { DiscordComponents, DiscordActionRows, DiscordComponentIds } from './DiscordComponents';

export class CommandTemplate {
    private BUTTON_LABEL_MAX_LENGTH = 80;
    private BUTTON_MAX_LENGTH_PER_ROW = 5;
    private ACTIONROW_MAX_LENGTH_PER_MESSAGE = 5;

    constructor(private ac: ArikenCompany) {}

    create(i: ChatInputCommandInteraction) {
        const commandName = i.options.getString('name', true);

        const embed = this.createEmbed(commandName);
        i.reply({ embeds: [embed], components: [DiscordActionRows.templateController] });
    }

    showAddModal(i: ButtonInteraction) {
        i.showModal(DiscordComponents.addTemplateModal);
    }

    async add(i: ModalSubmitInteraction) {
        const content = i.fields.getTextInputValue(DiscordComponentIds.textInput.commandContent);
        if (this.BUTTON_LABEL_MAX_LENGTH < content.length)
            return this.eReply(i, `ボタンのラベルは${this.BUTTON_LABEL_MAX_LENGTH}文字以内にしてください。`);

        const components = i.message?.components;
        if (!components) return this.eReply(i, 'エラーが発生しました。');

        const newButton = DiscordComponents.commandTemplateButton(content);

        const actionRowLength = components.length;
        const lastActionRowComponentLength = components[actionRowLength - 1].components.length;

        if (
            actionRowLength === this.ACTIONROW_MAX_LENGTH_PER_MESSAGE &&
            lastActionRowComponentLength === this.BUTTON_MAX_LENGTH_PER_ROW
        ) {
            return this.eReply(i, 'ボタンの数が上限に達しています。');
        } else if (lastActionRowComponentLength === this.BUTTON_MAX_LENGTH_PER_ROW) {
            // 最後の行のボタンが上限に達している場合
            const newActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(newButton);
            // @ts-expect-error
            components.push(newActionRow);
            await i.message?.edit({ components });
            this.eReply(i, 'ボタンを追加しました。');
        } else {
            // @ts-expect-error
            components[actionRowLength - 1].components.push(newButton);
            await i.message?.edit({ components });
            this.eReply(i, 'ボタンを追加しました。');
        }
    }

    private eReply(i: ModalSubmitInteraction, content: string) {
        i.reply({ content: content, ephemeral: true });
    }

    private createEmbed(commandName: string): EmbedBuilder {
        return new EmbedBuilder().setTitle(commandName).setDescription('ボタンを押すとあらかじめ指定された値に変更');
    }
}
