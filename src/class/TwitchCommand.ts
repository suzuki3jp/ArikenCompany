import { CommandParser } from '@suzuki3jp/twitch.js';
import type { TwitchClient, Message } from '@suzuki3jp/twitch.js';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

import { CommandManager } from './Command';

// paths
const managersPath = path.resolve(__dirname, '../data/Managers.json');
const messageCounterPath = path.resolve(__dirname, '../data/MessageCounter.json');
const commandsPath = path.resolve(__dirname, '../data/Commands.json');

export class TwitchCommand extends CommandManager {
    public client: TwitchClient;
    public command: CommandParser;
    public message: Message;

    constructor(client: TwitchClient, message: Message, manageCommands: string[]) {
        super();
        this.client = client;
        this.command = new CommandParser(message.content, { manageCommands });
        this.message = message;
    }

    isCommand(): boolean {
        return this.command.isCommand();
    }

    isManageCommand(): boolean {
        return this.command.isManageCommand();
    }

    isManager(): boolean {
        const managersData: { managers: string[] } = JSON.parse(
            readFileSync(managersPath, {
                encoding: 'utf-8',
            })
        );
        if (this.message.member.isMod) return true;
        if (this.message.member.isBroadCaster) return true;
        if (managersData.managers.includes(this.message.member.name)) return true;
        return false;
    }

    isVip(): boolean {
        const managersData: { managers: string[] } = JSON.parse(
            readFileSync(managersPath, {
                encoding: 'utf-8',
            })
        );
        if (this.message.member.isVip) return true;
        if (this.message.member.isBroadCaster) return true;
        if (this.message.member.isMod) return true;
        if (managersData.managers.includes(this.message.member.name)) return true;
        return false;
    }

    countMessage(): void {
        const MessageCounter = JSON.parse(readFileSync(messageCounterPath, 'utf-8'));
        if (MessageCounter[this.message.member.name]) {
            MessageCounter[this.message.member.name] = MessageCounter[this.message.member.name] + 1;
            const newData = JSON.stringify(MessageCounter, null, '\t');
            writeFileSync(messageCounterPath, newData, 'utf-8');
        } else {
            MessageCounter[this.message.member.name] = 1;
            const newData = JSON.stringify(MessageCounter, null, '\t');
            writeFileSync(messageCounterPath, newData, 'utf-8');
        }
    }

    manageCommandName():
        | '!oncom'
        | '!offcom'
        | '!addcom'
        | '!editcom'
        | '!rmcom'
        | '!cooltime'
        | '!setcooltime'
        | '!allow'
        | '!deny'
        | 'none' {
        const commandName = this.command.commandName;

        switch (commandName) {
            case '!oncom':
                return '!oncom';
            case '!offcom':
                return '!offcom';
            case '!addcom':
                return '!addcom';
            case '!editcom':
                return '!editcom';
            case '!removecom':
                return '!rmcom';
            case '!rmcom':
                return '!rmcom';
            case '!cooltime':
                return '!cooltime';
            case '!ct':
                return '!cooltime';
            case '!setcooltime':
                return '!setcooltime';
            case '!setct':
                return '!setcooltime';
            case '!allow':
                return '!allow';
            case '!deny':
                return '!deny';
            default:
                return 'none';
        }
    }

    isOnCom(): boolean {
        return super.currentCommandStatus();
    }

    onCom(): string {
        return super.on();
    }

    offCom(): string {
        return super.off();
    }

    async addCom(): Promise<string> {
        const targetCommand = this.command.commandsArg[0];
        const value = this.command.commandsArg.slice(1).join(' ');
        return await super.addCom(targetCommand, value, this.message);
    }

    async editCom(): Promise<string> {
        const targetCommand = this.command.commandsArg[0];
        const value = this.command.commandsArg.slice(1).join(' ');
        return await super.editCom(targetCommand, value, this.message);
    }

    removeCom(): string {
        const targetCommand = this.command.commandsArg[0];
        return super.removeCom(targetCommand);
    }

    commandValue(): string | null {
        const Commands: Record<string, string> = JSON.parse(readFileSync(commandsPath, 'utf-8'));
        const result = Commands[this.command.commandName];
        return result ?? null;
    }

    coolTime(): string {
        return String(super.currentCoolTime());
    }

    isPassedCooltime(): boolean {
        return super.isPassedCoolTime(this);
    }

    saveCooltime(): void {
        super.save(this);
    }

    changeCoolTime(): string {
        const newCoolTime = this.command.commandsArg[0];
        return super.changeCoolTime(newCoolTime);
    }

    allow(): string {
        const allowManager = this.command.commandsArg[0];
        return super.allow(allowManager);
    }

    deny(): string {
        const denyManager = this.command.commandsArg[0];
        return super.deny(denyManager);
    }
}
