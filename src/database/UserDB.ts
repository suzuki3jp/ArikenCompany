import { randomUUID, UUID } from 'crypto';
import type { DeepPartial } from 'ts-essentials';

import { CreateUserT, Prisma, UserT } from '@/database/Prisma';

export class UserDB extends Prisma {
    constructor() {
        super();
    }

    async add(name: string, password: string) {
        const data: CreateUserT = {
            id: randomUUID(),
            name,
            display_name: name,
            role: 'normal',
            password,
        };
        return await this.prisma.user.create({ data });
    }

    async updateById(id: UUID, data: DeepPartial<UserT>) {
        return await this.prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }

    async removeById(id: UUID) {
        return await this.prisma.user.delete({
            where: {
                id,
            },
        });
    }

    async getByName(name: string) {
        return await this.prisma.user.findFirst({
            where: {
                name,
            },
        });
    }

    async getById(id: UUID) {
        return await this.prisma.user.findFirst({
            where: {
                id,
            },
        });
    }

    async getAll() {
        return await this.prisma.user.findMany();
    }
}
