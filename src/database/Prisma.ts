import { Prisma as P, PrismaClient } from '@prisma/client';

export class Prisma {
    public prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
}

export interface CommandT extends P.CommandCreateInput {
    id: number;
}
export interface StreamNotificationT extends P.StreamNotificationCreateInput {}

export interface UserT extends P.UserCreateInput {
    id: number;
}
