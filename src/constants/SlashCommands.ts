import { SlashCommandBuilder } from 'discord.js';

const mcp = new SlashCommandBuilder()
    .setName('mcp')
    .setDescription('Manage command panel')
    .addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a command panel'));

const commandTemplate = new SlashCommandBuilder()
    .setName('template')
    .setDescription('Create command template')
    .addStringOption((o) => o.setName('name').setDescription('コマンド名').setRequired(true));

export const SlashCommands = [mcp, commandTemplate];
