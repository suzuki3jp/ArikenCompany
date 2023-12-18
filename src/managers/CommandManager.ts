import { CommandDB, CommandT } from '../database';
import { Logger, Result } from '../packages';
import { ValueValidater } from '../parsers';
import { ArikenCompany } from '../ArikenCompany';

export class CommandManager {
    private c: CommandDB;
    private logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.c = new CommandDB();
        this.logger = this.ac.logger.createChild('Command');
    }

    async addCommand(name: string, content: string): Promise<Result<CommandT>> {
        const r = new Result<CommandT>();
        const isExistCommand = Boolean(await this.c.getByName(name));
        const isValidContent = new ValueValidater(content).validate();

        if (isExistCommand) {
            return r.error('そのコマンドはすでに登録されています。');
        }
        if (typeof isValidContent === 'string') {
            return r.error(isValidContent);
        }

        const cmd = await this.c.add(name, content);
        this.ac.discord.mcp.reloadPanel();

        r.toSuccess(cmd);
        this.logger.info(`Added ${cmd.name}.`);
        return r;
    }

    async editCommand(name: string, content: string, isOnlyMod?: boolean, alias?: string): Promise<Result<CommandT>> {
        const r = new Result<CommandT>();
        const oldCommand = await this.c.getByName(name);
        const isValidContent = new ValueValidater(content).validate();

        if (!oldCommand) {
            return r.error('存在しないコマンド名です。');
        }
        if (typeof isValidContent === 'string') {
            return r.error(isValidContent);
        }

        const cmd = await this.c.updateById(oldCommand.id, { content, mod_only: isOnlyMod, alias });
        this.ac.discord.mcp.reloadPanel();

        r.toSuccess(cmd);
        this.logger.info(`Edited ${cmd.name} to ${cmd.content}.`);
        return r;
    }

    async removeCommand(name: string): Promise<Result<CommandT>> {
        const r = new Result<CommandT>();
        const oldCommand = await this.c.getByName(name);

        if (!oldCommand) {
            return r.error('存在しないコマンド名です。');
        }

        const cmd = await this.c.removeById(oldCommand.id);
        this.ac.discord.mcp.reloadPanel();

        r.toSuccess(cmd);
        this.logger.info(`Removed ${cmd.name}.`);
        return r;
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
