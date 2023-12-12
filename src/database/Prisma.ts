import { Prisma as P, PrismaClient } from '@prisma/client';

export class Prisma {
    public prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
}

export type CommandT = P.CommandCreateInput;
export type StreamNotificationT = P.StreamNotificationCreateInput;
