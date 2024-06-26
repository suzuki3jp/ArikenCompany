import { DeepPartial } from 'ts-essentials';

import { dayjs } from '@/packages';
import { CommandT, Prisma } from '@/database/Prisma';

export class CommandDB extends Prisma {
    constructor() {
        super();
    }

    async add(name: string, content: string) {
        const data = {
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

    async updateById(id: number, data: DeepPartial<CommandT>) {
        return await this.prisma.command.update({
            where: {
                id,
            },
            data,
        });
    }

    async updateUsedAtById(id: number) {
        return await this.prisma.command.update({
            where: {
                id,
            },
            data: {
                used_at: dayjs().toDate(),
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

    async getById(id: number) {
        return await this.prisma.command.findFirst({
            where: {
                id,
            },
        });
    }

    async getAll() {
        return await this.prisma.command.findMany();
    }
}
