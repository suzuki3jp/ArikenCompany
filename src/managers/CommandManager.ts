import { CommandDB, CommandT } from '@/database';
import { rootLogger } from '@/initializer';
import { Logger, Result, Success, Failure } from '@/packages';
import { ValueValidater } from '@/parsers';
import { ArikenCompany } from '@/ArikenCompany';
import type { OperationMetadata } from '@/typings';

export class CommandManager {
    private c: CommandDB;
    private logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.c = new CommandDB();
        this.logger = rootLogger.createChild('Command');
    }

    async addCommand(name: string, content: string, metadata: OperationMetadata): Promise<Result<CommandT, string>> {
        const isExistCommand = Boolean(await this.c.getByName(name));
        const isValidContent = new ValueValidater(content).validate();

        if (isExistCommand) {
            return new Failure('そのコマンドはすでに登録されています。');
        }
        if (typeof isValidContent === 'string') {
            return new Failure(isValidContent);
        }

        const cmd = await this.c.add(name, content);
        this.ac.discord.mcp.reloadPanel();

        this.logger.info(`Added ${cmd.name} by ${metadata.name} from ${metadata.provider}.`);
        return new Success(cmd);
    }

    async editCommand(
        name: string,
        options: {
            content?: string;
            isOnlyMod?: boolean;
            alias?: string;
        },
        metadata: OperationMetadata
    ): Promise<Result<CommandT, string>> {
        const oldCommand = await this.c.getByName(name);
        const { content, isOnlyMod, alias } = options;

        if (content) {
            const isValidContent = new ValueValidater(content).validate();
            if (typeof isValidContent === 'string') {
                return new Failure(isValidContent);
            }
        }

        if (!oldCommand) {
            return new Failure('存在しないコマンド名です。');
        }

        const cmd = await this.c.updateById(oldCommand.id, { content, mod_only: isOnlyMod, alias });
        this.ac.discord.mcp.reloadPanel();

        this.logger.info(`Edited ${cmd.name} to ${cmd.content} by ${metadata.name} from ${metadata.provider}.`);
        return new Success(cmd);
    }

    async removeCommand(name: string, metadata: OperationMetadata): Promise<Result<CommandT, string>> {
        const oldCommand = await this.c.getByName(name);

        if (!oldCommand) {
            return new Failure('存在しないコマンド名です。');
        }

        const cmd = await this.c.removeById(oldCommand.id);
        this.ac.discord.mcp.reloadPanel();

        this.logger.info(`Removed ${cmd.name} by ${metadata.name} from ${metadata.provider}.`);
        return new Success(cmd);
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
