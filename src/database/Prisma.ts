import { Prisma as P, PrismaClient } from '@prisma/client';
import { MarkOptional, MarkRequired } from 'ts-essentials';

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

export type UserDbT = MarkRequired<P.UserCreateInput, 'created_at' | 'updated_at'>;

export interface UserT extends UserDbT {
    role: UserRoleT;
}

export type CreateUserT = MarkOptional<UserT, 'created_at' | 'updated_at'>;

export type UserRoleT = (typeof UserRole)[number];

export const UserRole = ['admin', 'manager', 'normal'] as const;
