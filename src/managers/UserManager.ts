import { UUID } from 'crypto';
import { HttpStatusCode } from 'axios';

import { UserDB, UserDbT } from '@/database';
import { Result, Success, Failure, Logger } from '@/packages';
import { AuthManager } from '@/managers';
import { rootLogger } from '@/initializer';
import { UserValidator } from '@/validators';

/**
 * Manager for user db.
 */
export class UserManager {
    private db: UserDB;
    private logger: Logger;

    constructor() {
        this.db = new UserDB();
        this.logger = rootLogger.createChild('UserManager');
    }

    /**
     * 新しいユーザーを追加する
     * この関数でパスワードのハッシュ化を行う
     * @param name
     * @param planePass
     */
    async add(name: string, planePass: string): Promise<Result<PublicUserData, string>> {
        this.logger.debug(`Adding user name: ${name}`);
        // ユーザーがすでに存在してるか検証する
        const isExistUser = await this.isExistUserByName(name);
        if (isExistUser) return new Failure('User already exist.');

        // パスワードをハッシュ化し、ユーザーを登録するk
        const hashedPass = AuthManager.hashPass(planePass);
        const data = await this.db.add(name, hashedPass);

        // 帰ってきたユーザーデータを成形し返却する
        const publicData = this.transformUserToPublic(data);

        this.logger.info(`Added user ${publicData.name}(${publicData.id}) from API.`);
        return new Success(publicData);
    }

    /**
     * ユーザーを編集する
     * @param id
     * @param options
     * @returns
     */
    async edit(
        id: string,
        options: UserEditOptions
    ): Promise<Result<PublicUserData, { code: HttpStatusCode; message: string }>> {
        const { name, displayName } = options;
        this.logger.debug(`Editing user id: ${id}, new name: ${name}, new display_name: ${displayName}`);

        // Validate user data
        if (name) {
            const validateResult = UserValidator.username(name);
            if (validateResult.isFailure()) return new Failure({ code: 400, message: 'name is invalid value' });
        }

        if (!UserManager.isUUID(id)) return new Failure({ code: 400, message: 'id is invalid value' });

        const isExistUser = await this.isExistUserById(id);
        if (!isExistUser) return new Failure({ code: 404, message: 'user not found' });

        const result = await this.db.updateById(id, { name, display_name: displayName });
        const publicData = this.transformUserToPublic(result);

        this.logger.info(`Edited user ${publicData.name}(${publicData.id}) from API`);
        return new Success(publicData);
    }

    /**
     * ユーザーを削除する
     * @param id
     */
    async remove(id: string): Promise<Result<PublicUserData, { code: HttpStatusCode; message: string }>> {
        this.logger.debug(`Removing user id: ${id}`);
        if (!UserManager.isUUID(id)) return new Failure({ code: 400, message: 'id is invalid value' });

        const isExistUser = await this.isExistUserById(id);
        if (!isExistUser) return new Failure({ code: 404, message: 'user not found' });

        const result = await this.db.removeById(id);
        const publicData = this.transformUserToPublic(result);

        this.logger.info(`Removed user ${publicData.name}(${publicData.id}) from API.`);
        return new Success(publicData);
    }

    /**
     * idからユーザーを取得する
     * @param id
     */
    async getById(id: UUID) {
        const user = await this.db.getById(id);
        if (!user) return null;
        return this.transformUserToPublic(user);
    }

    /**
     * ユーザー名とパスワードからパスワードが正しいか確かめる
     * @param name
     * @param pass
     */
    async isCorrectPass(name: string, pass: string): Promise<Result<PublicUserData, string>> {
        const user = await this.db.getByName(name);
        if (!user) return new Failure('User not found');

        const isCorrect = AuthManager.comparePass(pass, user.password);
        if (!isCorrect) return new Failure('password is incorrect');
        return new Success(this.transformUserToPublic(user));
    }

    /**
     * ユーザーのIdからそのユーザーが存在するかどうか取得する
     */
    private async isExistUserById(id: string): Promise<boolean> {
        if (!UserManager.isUUID(id)) return false;

        const user = await this.db.getById(id);
        return Boolean(user);
    }

    /**
     * ユーザーの名前からそのユーザーが存在するかどうか取得する
     * @param name
     */
    private async isExistUserByName(name: string): Promise<boolean> {
        const user = await this.db.getByName(name);
        return Boolean(user);
    }

    /**
     * ユーザーデータをパスワードなどを除外した公開可能なデータに変換する
     * @param sensitiveData
     * @returns
     */
    private transformUserToPublic(sensitiveData: UserDbT): PublicUserData {
        const { id, name, display_name, role, created_at, updated_at } = sensitiveData;

        return {
            id,
            name,
            display_name,
            role,
            created_at: isDate(created_at) ? created_at.toISOString() : created_at,
            updated_at: isDate(updated_at) ? updated_at.toISOString() : updated_at,
        };

        function isDate(data: string | Date): data is Date {
            if (data instanceof Date) return true;
            return false;
        }
    }

    /**
     * 文字列がUUIDか検証する
     */
    public static isUUID(data: string): data is UUID {
        const result = UserValidator.id(data);
        if (result.isSuccess()) return true;
        return false;
    }
}

interface PublicUserData {
    id: string;
    name: string;
    display_name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface UserEditOptions {
    name?: string;
    displayName?: string;
}
