import { DeepPartial } from 'ts-essentials';

import { Prisma, StreamNotificationT } from '@/database/Prisma';

export class StreamNotificationDB extends Prisma {
    constructor() {
        super();
    }

    async add(data: StreamNotificationT) {
        return await this.prisma.streamNotification.create({ data });
    }

    async removeById(id: string) {
        return await this.prisma.streamNotification.delete({
            where: {
                id,
            },
        });
    }

    async getById(id: string) {
        return await this.prisma.streamNotification.findFirst({
            where: {
                id,
            },
        });
    }

    async getAll() {
        return await this.prisma.streamNotification.findMany();
    }

    updateById(id: string, data: DeepPartial<StreamNotificationT>) {
        return this.prisma.streamNotification.update({
            where: {
                id,
            },
            data,
        });
    }
}
