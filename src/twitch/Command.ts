import { ArikenCompany } from '@/ArikenCompany';
import { ADD_COMMAND, EDIT_COMMAND, REMOVE_COMMAND, COOLDOWN, SET_COOLDOWN } from '@/constants';
import { CommandT } from '@/database';
import { dayjs, Message } from '@/packages';
import { CommandManager } from '@/managers';
import { CommandParser } from '@/parsers';
import type { OperationMetadata } from '@/typings';

export class Command {
    public name: string;

    private cmd: CommandManager;
    private parser: CommandParser;

    constructor(private ac: ArikenCompany, private message: Message) {
        this.parser = new CommandParser(this.ac, this.message.content);
        this.cmd = this.ac.cmd;
        this.name = this.parser.name;
    }

    isCommand(): boolean {
        return this.parser.isCommand;
    }

    isManageCommand(): boolean {
        const c = this.parser.name;
        if (c === ADD_COMMAND) return true;
        if (c === EDIT_COMMAND) return true;
        if (c === REMOVE_COMMAND) return true;
        if (c === COOLDOWN) return true;
        if (c === SET_COOLDOWN) return true;
        return false;
    }

    isManager(): boolean {
        if (this.message.user.isBroadCaster) return true;
        if (this.message.user.isMod) return true;
        return false;
    }

    isVip(): boolean {
        if (this.message.user.isBroadCaster) return true;
        if (this.message.user.isMod) return true;
        if (this.message.user.isVip) return true;
        return false;
    }

    async addCommand(): Promise<string> {
        const { name, content } = this.validateCommandData(this.parser.args);
        const metadata: OperationMetadata = {
            provider: 'TWITCH',
            name: this.message.user.name,
        };

        if (!(name && content)) return 'コマンドの引数が不正です。コマンド名と内容を入力してください。';
        const r = await this.cmd.addCommand(name, content, metadata);

        if (r.isSuccess()) return `コマンド ${name} を追加しました。`;
        return r.data.message;
    }

    async editCommand(): Promise<string> {
        const { name, content } = this.validateCommandData(this.parser.args);
        const metadata: OperationMetadata = {
            provider: 'TWITCH',
            name: this.message.user.name,
        };

        if (!(name && content)) return `コマンドの引数が不正です。コマンド名と内容を入力してください。`;
        const r = await this.cmd.editCommand(name, { content }, metadata);

        if (r.isSuccess()) return `コマンド ${name} を編集しました。`;
        return r.data.message;
    }

    async removeCommand(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);
        const metadata: OperationMetadata = {
            provider: 'TWITCH',
            name: this.message.user.name,
        };

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        const r = await this.cmd.removeCommand(name, metadata);

        if (r.isSuccess()) return `コマンド ${name} を削除しました。`;
        return r.data.message;
    }

    async getCoolDown(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        const r = await this.cmd.getCooldown(name);
        if (!r) return `存在しないコマンド名です。`;
        return `${name} のクールダウンは ${r} 秒です。`;
    }

    async setCoolDown(): Promise<string> {
        const name = this.validateCommandName(this.parser.args[0]);
        const cooldown = Number(this.parser.args[1]);

        if (!name) return `コマンドの引数が不正です。コマンド名を入力してください。`;
        if (isNaN(cooldown)) return `クールダウンには数字を入力してください。`;
        return await this.cmd.setCooldown(name, cooldown);
    }

    async normalCommand(n?: string) {
        const name = this.validateCommandName(n ?? this.parser.name);
        if (!name) return null;
        return await this.cmd.getCommand(name);
    }

    reply(content: string) {
        this.message.reply(content);
    }

    send(content: string) {
        this.message.channel.send(content);
    }

    private validateCommandName(n: string): string | null {
        if (!n) return null;
        return n.toLowerCase();
    }

    public isCooldown(command: CommandT): boolean {
        if (this.isVip()) return true;
        const now = dayjs();
        const lastUsed = dayjs(command.used_at);
        const cooldown = command.cooldown ?? 0;
        const cooldownMilli = cooldown * 1000;
        return now.diff(lastUsed, 'millisecond') > cooldownMilli;
    }

    public updateUsedAt(name: string) {
        return this.cmd.updateUsedAt(name);
    }

    private validateCommandData(args: string[]): { name: string | null; content: string | null } {
        let [name, ...contents]: (string | null)[] = args;
        let content: string | null = contents.join(' ');
        if (!name) name = null;
        if (!content) content = null;
        return { name, content };
    }
}
