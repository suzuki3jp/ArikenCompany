import { Prisma, CommandT } from './Prisma';

export class Command extends Prisma {
    constructor() {
        super();
    }

    async add(name: string, content: string) {
        const data: CommandT = {
            name,
            content,
        };
        return await this.prisma.command.create({ data });
    }

    async editContentById(id: number, content: string) {
        return await this.prisma.command.update({
            where: {
                id,
            },
            data: {
                content,
            },
        });
    }

    async setCooldownById(id: number, cooldown: number) {
        return await this.prisma.command.update({
            where: {
                id,
            },
            data: {
                cooldown,
            },
        });
    }

    async removeById(id: number) {
        return await this.prisma.command.delete({
            where: {
                id,
            },
        });
    }

    async getByName(name: string) {
        return await this.prisma.command.findFirst({
            where: {
                name,
            },
        });
    }

    async getAll() {
        return await this.prisma.command.findMany();
    }
}
