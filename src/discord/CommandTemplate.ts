import { ChatInputCommandInteraction, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';

import { ArikenCompany } from '../ArikenCompany';
import { DiscordComponents, DiscordActionRows } from './DiscordComponents';

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

    private createEmbed(commandName: string): EmbedBuilder {
        return new EmbedBuilder().setTitle(commandName).setDescription('ボタンを押すとあらかじめ指定された値に変更');
    }
}
