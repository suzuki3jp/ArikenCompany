import { ObjectUtils } from '@suzuki3jp/utils';
import { Message as TwitchMessage } from '@suzuki3jp/twitch.js';
import { Message as DiscordMessage } from 'discord.js';
import { ValueParser, PubValueParser, DiscordValueParser } from './ValueParser';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { CommandManagersManager } from './CommandManagers';

const commandsFilePath = resolve(__dirname, '../data/Commands.json');
const publicCommandsPath = resolve(__dirname, '../data/PublicCommands.json');

export class CommandManager extends CommandManagersManager {
    public valueParser: ValueParser;
    public discordValueParser: DiscordValueParser;
    constructor() {
        super();
        this.valueParser = new ValueParser();
        this.discordValueParser = new DiscordValueParser();
    }

    async addCom(commandName: string, value: string, message: TwitchMessage | DiscordMessage): Promise<string> {
        if (message instanceof DiscordMessage) {
            // discord
            const commands = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
            const name = commandName.toLowerCase();
            if (commands[name]) return manageCommandError.existCommandName;

            const valueResult = await this.discordValueParser.parse(value, message);
            if (valueResult.status !== 200) return valueResult.content;

            commands[name] = value;
            const writeData = JSON.stringify(commands, null, '\t');
            writeFileSync(commandsFilePath, writeData, 'utf-8');
            this.createPublicList();
            return `${name} を追加しました`;
        } else {
            // twitch
            const commands = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
            const name = commandName.toLowerCase();
            if (commands[name]) return manageCommandError.existCommandName;

            const valueResult = await this.valueParser.parse(value, message);
            if (valueResult.status !== 200) return valueResult.content;

            commands[name] = value;
            const writeData = JSON.stringify(commands, null, '\t');
            writeFileSync(commandsFilePath, writeData, 'utf-8');
            this.createPublicList();
            return `${name} を追加しました`;
        }
    }

    async editCom(commandName: string, value: string, message: TwitchMessage | DiscordMessage): Promise<string> {
        if (message instanceof DiscordMessage) {
            const commands = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
            const name = commandName.toLowerCase();
            if (!commands[name]) return manageCommandError.notExistCommandName;

            const valueResult = await this.discordValueParser.parse(value, message);
            if (valueResult.status !== 200) return valueResult.content;

            commands[name] = value;
            const writeData = JSON.stringify(commands, null, '\t');
            writeFileSync(commandsFilePath, writeData, 'utf-8');
            this.createPublicList();
            return `${name} を ${value} に変更しました`;
        } else {
            const commands = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
            const name = commandName.toLowerCase();
            if (!commands[name]) return manageCommandError.notExistCommandName;

            const valueResult = await this.valueParser.parse(value, message);
            if (valueResult.status !== 200) return valueResult.content;

            commands[name] = value;
            const writeData = JSON.stringify(commands, null, '\t');
            writeFileSync(commandsFilePath, writeData, 'utf-8');
            this.createPublicList();
            return `${name} を ${value} に変更しました`;
        }
    }

    removeCom(commandName: string): string {
        const commands = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
        const name = commandName.toLowerCase();
        if (!commands[name]) return manageCommandError.notExistCommandName;
        delete commands[name];
        const writeData = JSON.stringify(commands, null, '\t');
        writeFileSync(commandsFilePath, writeData, 'utf-8');
        this.createPublicList();
        return `${name} を削除しました`;
    }

    createPublicList(): Record<string, string> {
        const commands: Record<string, string> = JSON.parse(readFileSync(commandsFilePath, 'utf-8'));
        let publicCommands: Record<string, string> = {};
        ObjectUtils.forEach(commands, (key, value) => {
            if (typeof value !== 'string' || typeof key !== 'string') return;
            const parsedData = new PubValueParser().parse(value);
            publicCommands[key] = parsedData.content;
        });

        const writeData = JSON.stringify(publicCommands, null, '\t');
        writeFileSync(publicCommandsPath, writeData, 'utf-8');
        return publicCommands;
    }
}

const manageCommandError = {
    existCommandName: '存在するコマンド名です',
    notExistCommandName: '存在しないコマンド名です',
};
