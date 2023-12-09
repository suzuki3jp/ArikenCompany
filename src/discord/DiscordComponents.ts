import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ModalActionRowComponentBuilder,
} from 'discord.js';

export const DiscordComponentIds = {
    button: {
        previous: 'previousButton',
        next: 'nextButton',
        add: 'addButton',
        edit: 'editButton',
        remove: 'removeButton',
    },
    textInput: {
        commandName: 'commandName',
        commandContent: 'commandContent',
    },
    modal: {
        add: 'addModal',
        edit: 'editModal',
        remove: 'removeModal',
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
    textInput: {
        commandName: '操作するコマンド名(!付き)',
        commandContent: 'コマンド内容',
    },
    modal: {
        add: 'コマンドを追加する',
        edit: 'コマンドを編集する',
        remove: 'コマンドを削除する',
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

const commandNameInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.commandName)
    .setLabel(DiscordComponentLabels.textInput.commandName)
    .setValue('!')
    .setStyle(TextInputStyle.Short);

const commandContentInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.commandContent)
    .setLabel(DiscordComponentLabels.textInput.commandContent)
    .setStyle(TextInputStyle.Paragraph);

const nameActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(commandNameInput);
const contentActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(commandContentInput);

export const DiscordComponents = {
    previousButton,
    nextButton,
    addButton,
    editButton,
    removeButton,
    addModal: new ModalBuilder()
        .setCustomId(DiscordComponentIds.modal.add)
        .setTitle(DiscordComponentLabels.modal.add)
        .addComponents(nameActionRow, contentActionRow),
    editModal: new ModalBuilder()
        .setCustomId(DiscordComponentIds.modal.edit)
        .setTitle(DiscordComponentLabels.modal.edit)
        .addComponents(nameActionRow, contentActionRow),
    removeModal: new ModalBuilder()
        .setCustomId(DiscordComponentIds.modal.remove)
        .setTitle(DiscordComponentLabels.modal.remove)
        .addComponents(nameActionRow),
};

export const DiscordActionRows = {
    pageController: new ActionRowBuilder<ButtonBuilder>().addComponents(previousButton, nextButton),
    commandController: new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, editButton, removeButton),
};
