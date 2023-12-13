import { CommandDB } from '../database';
import { Logger } from '../packages';
import { ValueValidater } from '../parsers';
import { ArikenCompany } from '../ArikenCompany';

export class CommandManager {
    private c: CommandDB;
    private logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.c = new CommandDB();
        this.logger = this.ac.logger.createChild('Command');
    }

    async addCommand(name: string, content: string): Promise<string> {
        const isExistCommand = Boolean(await this.c.getByName(name));
        const isValidContent = new ValueValidater(content).validate();

        if (isExistCommand) return 'そのコマンドはすでに登録されています。';
        if (typeof isValidContent === 'string') return isValidContent;
        const cmd = await this.c.add(name, content);
        this.ac.discord.mcp.reloadPanel();
        this.logger.info(`Added ${cmd.name}.`);
        return `${cmd.name} を作成しました。`;
    }

    async editCommand(name: string, content: string): Promise<string> {
        const oldCommand = await this.c.getByName(name);
        const isValidContent = new ValueValidater(content).validate();

        if (!oldCommand) return `存在しないコマンド名です。`;
        if (typeof isValidContent === 'string') return isValidContent;
        const cmd = await this.c.editContentById(oldCommand.id, content);
        this.ac.discord.mcp.reloadPanel();
        this.logger.info(`Edited ${cmd.name} to ${cmd.content}.`);
        return `${cmd.name} を編集しました。`;
    }

    async removeCommand(name: string): Promise<string> {
        const oldCommand = await this.c.getByName(name);

        if (!oldCommand) return `存在しないコマンド名です。`;
        const cmd = await this.c.removeById(oldCommand.id);
        this.ac.discord.mcp.reloadPanel();
        this.logger.info(`Removed ${cmd.name}.`);
        return `${cmd.name} を削除しました。`;
    }

    async getCommand(name: string) {
        return await this.c.getByName(name);
    }

    async getCooldown(name: string): Promise<number | null> {
        const cmd = await this.c.getByName(name);
        return cmd === null ? null : cmd.cooldown;
    }

    async setCooldown(name: string, cooldown: number): Promise<string> {
        const cmd = await this.c.getByName(name);
        if (!cmd) return `存在しないコマンド名です。`;
        await this.c.setCooldownById(cmd.id, cooldown);
        this.logger.info(`Set ${cmd.name}'s cooldown to ${cooldown}.`);
        return `${cmd.name} のクールダウンを ${cooldown} 秒に設定しました。`;
    }

    async updateUsedAt(name: string): Promise<string> {
        const cmd = await this.c.getByName(name);
        if (!cmd) return `存在しないコマンド名です。`;
        await this.c.updateUsedAtById(cmd.id);
        return `${cmd.name} の used_at を更新しました。`;
    }

    async getAll() {
        return await this.c.getAll();
    }
}
