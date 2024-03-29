import { ChannelType, SlashCommandBuilder } from 'discord.js';

const mcp = new SlashCommandBuilder()
    .setName('mcp')
    .setDescription('Manage command panel')
    .addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a command panel'));

const commandTemplate = new SlashCommandBuilder()
    .setName('template')
    .setDescription('Create command template')
    .addStringOption((o) => o.setName('name').setDescription('コマンド名').setRequired(true));

const sn = new SlashCommandBuilder()
    .setName('sn')
    .setDescription('Stream notification')
    .addSubcommand((s) =>
        s
            .setName('add')
            .setDescription('Add stream notification')
            .addStringOption((o) => o.setName('name').setDescription("Streamer's name").setRequired(true))
            .addChannelOption((o) =>
                o.setName('channel').setDescription('Channel to send notification').setRequired(true)
            )
            .addStringOption((o) => o.setName('memo').setDescription('Channel id to send').setRequired(false))
    )
    .addSubcommand((s) =>
        s
            .setName('remove')
            .setDescription('Remove stream notification')
            .addStringOption((o) => o.setName('name').setDescription("Streamer's name").setRequired(true))
    );

const mp = new SlashCommandBuilder()
    .setName('mp')
    .setDescription('Memo panel')
    .addSubcommand((s) =>
        s
            .setName('setup')
            .setDescription('Setup memo panel')
            .addStringOption((o) => o.setName('name').setDescription("Streamer's name").setRequired(true))
            .addChannelOption((o) =>
                o
                    .setName('channel')
                    .setDescription('チャンネルを指定します。')
                    .addChannelTypes(ChannelType.GuildForum)
                    .setRequired(true)
            )
    );

export const SlashCommands = [mcp, commandTemplate, sn, mp];
