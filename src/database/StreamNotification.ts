import { Prisma } from './Prisma';

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
}
