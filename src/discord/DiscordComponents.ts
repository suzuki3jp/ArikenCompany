import { ButtonBuilder, ButtonStyle } from 'discord.js';

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
    .setStyle(ButtonStyle.Primary)
    .toJSON();

const nextButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.next)
    .setLabel(DiscordComponentLabels.button.next)
    .setStyle(ButtonStyle.Primary)
    .toJSON();

const addButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.add)
    .setLabel(DiscordComponentLabels.button.add)
    .setStyle(ButtonStyle.Primary)
    .toJSON();

const editButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.edit)
    .setLabel(DiscordComponentLabels.button.edit)
    .setStyle(ButtonStyle.Primary)
    .toJSON();

const removeButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.remove)
    .setLabel(DiscordComponentLabels.button.remove)
    .setStyle(ButtonStyle.Primary)
    .toJSON();

export const DiscordComponents = { previousButton, nextButton, addButton, editButton, removeButton };
