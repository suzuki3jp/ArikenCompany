import { Command } from '../database';
import { Logger } from '../packages';
import { ArikenCompany } from '../ArikenCompany';

export class CommandManager {
    private c: Command;
    private logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.c = new Command();
        this.logger = this.ac.logger.createChild('Command');
    }

    async addCommand(name: string, content: string): Promise<string> {
        const isExistCommand = Boolean(await this.c.getByName(name));

        if (isExistCommand) return 'そのコマンドはすでに登録されています。';
        const cmd = await this.c.add(name, content);
        this.logger.info(`Added ${cmd.name}.`);
        return `${cmd.name} を作成しました。`;
    }

    async editCommand(name: string, content: string): Promise<string> {
        const oldCommand = await this.c.getByName(name);

        if (!oldCommand) return `存在しないコマンド名です。`;
        const cmd = await this.c.editContentById(oldCommand.id, content);
        this.logger.info(`Edited ${cmd.name} to ${cmd.content}.`);
        return `${cmd.name} を編集しました。`;
    }

    async removeCommand(name: string): Promise<string> {
        const oldCommand = await this.c.getByName(name);

        if (!oldCommand) return `存在しないコマンド名です。`;
        const cmd = await this.c.removeById(oldCommand.id);
        this.logger.info(`Removed ${cmd.name}.`);
        return `${cmd.name} を削除しました。`;
    }

    async getCommand(name: string): Promise<string | null> {
        return (await this.c.getByName(name))?.content ?? null;
    }
}
