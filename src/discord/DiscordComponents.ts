import { randomUUID } from 'crypto';
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
        addTemplate: 'addTemplateButton',
        commandTemplate: 'template',
        sendMemo: 'sendMemoButton',
    },
    textInput: {
        commandName: 'commandName',
        commandContent: 'commandContent',
        memoThread: 'memoThread',
        streamLength: 'streamLength',
        memoContent: 'memoContent',
    },
    modal: {
        add: 'addModal',
        edit: 'editModal',
        remove: 'removeModal',
        addTemplate: 'addTemplateModal',
        sendMemoModal: 'sendMemoModal',
    },
};

const DiscordComponentLabels = {
    button: {
        previous: '◀️',
        next: '▶️',
        add: '追加',
        edit: '編集',
        remove: '削除',
        addTemplate: '追加',
        sendMemo: '送信',
    },
    textInput: {
        commandName: '操作するコマンド名(!付き)',
        commandContent: 'コマンド内容',
        streamLength: '配信時間',
        memoThread: 'メモを送信するスレッド名',
        memoContent: 'メモ内容',
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

const addTemplateButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.addTemplate)
    .setLabel(DiscordComponentLabels.button.addTemplate)
    .setStyle(ButtonStyle.Danger);

const sendMemoButton = new ButtonBuilder()
    .setCustomId(DiscordComponentIds.button.sendMemo)
    .setLabel(DiscordComponentLabels.button.sendMemo)
    .setStyle(ButtonStyle.Primary);

const commandTemplateButton = (c: string) =>
    new ButtonBuilder()
        .setCustomId(DiscordComponentIds.button.commandTemplate + randomUUID())
        .setLabel(c)
        .setStyle(ButtonStyle.Primary);

const commandNameInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.commandName)
    .setLabel(DiscordComponentLabels.textInput.commandName)
    .setValue('!')
    .setStyle(TextInputStyle.Short);

const commandContentInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.commandContent)
    .setLabel(DiscordComponentLabels.textInput.commandContent)
    .setStyle(TextInputStyle.Paragraph);

const streamLengthInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.streamLength)
    .setLabel(DiscordComponentLabels.textInput.streamLength)
    .setStyle(TextInputStyle.Short);

const memoContentInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.memoContent)
    .setLabel(DiscordComponentLabels.textInput.memoContent)
    .setStyle(TextInputStyle.Short);

const memoThreadInput = new TextInputBuilder()
    .setCustomId(DiscordComponentIds.textInput.memoThread)
    .setLabel(DiscordComponentLabels.textInput.memoThread)
    .setStyle(TextInputStyle.Short);

export const nameActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(commandNameInput);
const contentActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(commandContentInput);
const streamLengthActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(streamLengthInput);
const memoContentActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(memoContentInput);
const memoThreadActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(memoThreadInput);

const addModal = new ModalBuilder()
    .setCustomId(DiscordComponentIds.modal.add)
    .setTitle(DiscordComponentLabels.modal.add)
    .addComponents(nameActionRow, contentActionRow);

const editModal = new ModalBuilder()
    .setCustomId(DiscordComponentIds.modal.edit)
    .setTitle(DiscordComponentLabels.modal.edit)
    .addComponents(nameActionRow, contentActionRow);

const removeModal = new ModalBuilder()
    .setCustomId(DiscordComponentIds.modal.remove)
    .setTitle(DiscordComponentLabels.modal.remove)
    .addComponents(nameActionRow);

const addTemplateModal = new ModalBuilder()
    .setCustomId(DiscordComponentIds.modal.addTemplate)
    .setTitle('テンプレートを追加する')
    .addComponents(contentActionRow);

export const DiscordComponents = {
    previousButton,
    nextButton,
    addButton,
    editButton,
    removeButton,
    addModal,
    editModal,
    removeModal,
    addTemplateModal,
    commandTemplateButton,
};

export const DiscordActionRows = {
    pageController: new ActionRowBuilder<ButtonBuilder>().addComponents(previousButton, nextButton),
    commandController: new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, editButton, removeButton),
    templateController: new ActionRowBuilder<ButtonBuilder>().addComponents(addTemplateButton),
    sendMemoController: new ActionRowBuilder<ButtonBuilder>().addComponents(sendMemoButton),
    streamLengthActionRow,
    memoContentActionRow,
    memoThreadActionRow,
};
