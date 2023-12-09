import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export const DiscordComponentIds = {
    button: {
        previous: 'previousButton',
        next: 'nextButton',
        add: 'addButton',
        edit: 'editButton',
        remove: 'removeButton',
    },
};

const DiscordComponentLabels = {
    button: {
        previous: '◀️',
        next: '▶️',
        add: '追加',
        edit: '編集',
        remove: '削除',
    },
};

const previousButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.previous)
    .setLabel(DiscordComponentLabels.button.previous)
    .setStyle(ButtonStyle.Primary);

const nextButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.next)
    .setLabel(DiscordComponentLabels.button.next)
    .setStyle(ButtonStyle.Primary);

const addButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.add)
    .setLabel(DiscordComponentLabels.button.add)
    .setStyle(ButtonStyle.Success);

const editButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.edit)
    .setLabel(DiscordComponentLabels.button.edit)
    .setStyle(ButtonStyle.Success);

const removeButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.remove)
    .setLabel(DiscordComponentLabels.button.remove)
    .setStyle(ButtonStyle.Danger);

export const DiscordComponents = { previousButton, nextButton, addButton, editButton, removeButton };
export const DiscordActionRows = {
    pageController: new ActionRowBuilder<ButtonBuilder>().addComponents(previousButton, nextButton),
    commandController: new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, editButton, removeButton),
};
