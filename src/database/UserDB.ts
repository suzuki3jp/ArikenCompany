import type { DeepPartial } from 'ts-essentials';

import { Prisma, UserT } from './Prisma';

export class UserDB extends Prisma {
    constructor() {
        super();
    }

    async add(name: string, password: string) {
        const data: UserT = {
            name,
            password,
        };
        return await this.prisma.user.create({ data });
    }

    async updateById(id: number, data: DeepPartial<UserT>) {
        return await this.prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }

    async removeById(id: number) {
        return await this.prisma.user.delete({
            where: {
                id,
            },
        });
    }

    async getById(id: number) {
        return await this.prisma.user.findFirst({
            where: {
                id,
            },
        });
    }

    async getAll() {
        return await this.prisma.command.findMany();
    }
}
