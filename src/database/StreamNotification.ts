import { DeepPartial } from 'ts-essentials';

import { Prisma, StreamNotificationT } from './Prisma';

export class StreamNotification extends Prisma {
    constructor() {
        super();
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
