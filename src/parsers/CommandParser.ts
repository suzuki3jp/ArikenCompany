import { ArikenCompany } from '../ArikenCompany';

export class CommandParser {
    public name: string;
    public args: string[];
    public isCommand: boolean;

    constructor(private ac: ArikenCompany, content: string) {
        let [command, ...args] = content.split(' ');

        this.isCommand = false;

        const settings = this.ac.settings;
        if (!settings.cache.command.isStrictCommand) command = command.toLowerCase();
        if (command.startsWith('!')) this.isCommand = true;
        if (!settings.cache.command.isStrictPrefix && command.startsWith('！')) {
            this.isCommand = true;
            command = `!${command.slice(1)}`;
        }
        this.name = command;
        this.args = args;
    }
}
