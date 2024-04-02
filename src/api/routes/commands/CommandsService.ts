import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import { RouteT } from '@/api/RouteLoader';
import type { ArikenCompany } from '@/ArikenCompany';
import { BaseErrorRes, BaseRes, ErrorCode, MiddlewareUtils, ReqBodyUtils, ResUtils } from '@/api/utils';
import { Failure, Logger, Result, Success } from '@/packages';
import { rootLogger } from '@/initializer';
import { CommandT } from '@/database';

export class CommandsService implements RouteT {
    public readonly path = '/commands';
    public readonly requiredRole: RouteT['requiredRole'] = {
        get: 'manager',
        post: 'manager',
        put: 'manager',
        delete: 'manager',
    };

    private logger: Logger = rootLogger.createChild('CommandsService');

    constructor(private ac: ArikenCompany) {}

    async get(req: Request, res: Response) {
        const params = ReqBodyUtils.extractOptionalBody(req, ['id']);

        if (params.isFailure()) {
            this.logger.error(`Unknown Error`, `Request body: ${Object.keys(req.body).join(', ')}`, `Error param: id`);
            res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
            return;
        }

        const { id } = params.data;
        // Idの指定があるかどうかで、特定のコマンドを返すかすべてを返すか
        if (id) {
            const numId = toNumber(id);
            if (numId.isFailure()) {
                const data: BaseErrorRes = {
                    code: ErrorCode.invalidParams,
                    message: `id is invalid value`,
                };
                res.status(HttpStatusCode.BadRequest).json(data);
                return;
            }

            const command = await this.ac.cmd.getById(numId.data);
            if (!command) {
                const data = ResUtils.notFoundError(`Command(${numId.data})`);
                res.status(HttpStatusCode.NotFound).json(data);
                return;
            }

            const data: BaseRes<CommandT[]> = {
                data: [command],
            };
            res.status(HttpStatusCode.Ok).json(data);
            return;
        } else {
            const commands = await this.ac.cmd.getAll();

            const data: BaseRes<CommandT[]> = {
                data: commands,
            };
            res.status(HttpStatusCode.Ok).json(data);
        }
        return;
    }

    async post(req: Request, res: Response) {
        const params = ReqBodyUtils.extractRequiredBody(req, ['name', 'content']);
        const user = MiddlewareUtils.getUser(res);

        if (params.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `name, content are required`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }

        if (user.isFailure()) {
            this.logger.error(`Auth error. POST ${this.path}`);
            res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
            return;
        }

        const { name, content } = params.data;
        const result = await this.ac.cmd.addCommand(name, content, {
            provider: 'API',
            name: `${user.data.name}(${user.data.id})`,
        });

        if (result.isFailure()) {
            const data: BaseErrorRes =
                result.data.code === HttpStatusCode.Conflict
                    ? {
                          code: ErrorCode.conflict,
                          message: 'Command already exists.',
                      }
                    : {
                          code: ErrorCode.invalidValue,
                          message: "Command's content is invalid value.",
                      };
            res.status(result.data.code).json(data);
            return;
        }

        const data: BaseRes<CommandT> = {
            data: result.data,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }

    async put(req: Request, res: Response) {
        const requiredBody = ReqBodyUtils.extractRequiredBody(req, ['id']);
        const optionalParams = ReqBodyUtils.extractOptionalBody(req, ['content', 'mod_only', 'alias', 'cooldown']);
        const user = MiddlewareUtils.getUser(res);

        if (optionalParams.isFailure() || requiredBody.isFailure()) {
            if (optionalParams.isFailure()) {
                this.logger.error(
                    'Error in extracting optional request body',
                    `Request body: ${Object.keys(req.body)}`,
                    'Optional body: mod_only, alias, cooldown'
                );
                res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
                return;
            }

            if (requiredBody.isFailure()) {
                const data: BaseErrorRes = {
                    code: ErrorCode.invalidParams,
                    message: `id is required`,
                };
                res.status(HttpStatusCode.BadRequest).json(data);
                return;
            }
        }

        if (user.isFailure()) {
            this.logger.error(`Auth error. PUT ${this.path}`);
            const data = ResUtils.internalError();
            res.status(HttpStatusCode.InternalServerError).json(data);
            return;
        }

        const command = await this.ac.cmd.getById(Number(requiredBody.data.id));

        if (!command) {
            const data = ResUtils.notFoundError(`Command(${requiredBody.data.id})`);
            res.status(HttpStatusCode.NotFound).json(data);
            return;
        }

        const { content, cooldown, mod_only, alias } = optionalParams.data;
        const newCommandData = {
            content: content || command.content,
            alias: alias || command.alias,
            cooldown: cooldown === undefined ? command.cooldown : Number(cooldown),
            mod_only: mod_only ?? command.mod_only,
        };
        const result = await this.ac.cmd.editCommand(command.name, newCommandData, {
            provider: 'API',
            name: `${user.data.name}(${user.data.id})`,
        });

        if (result.isFailure()) {
            const data: BaseErrorRes =
                result.data.code === HttpStatusCode.BadRequest
                    ? {
                          code: ErrorCode.invalidValue,
                          message: `Command's content is invalid value.`,
                      }
                    : ResUtils.notFoundError(`Command(${requiredBody.data.id})`);
            res.status(result.data.code).json(data);
            return;
        }

        const data: BaseRes<CommandT> = {
            data: result.data,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }

    async delete(req: Request, res: Response) {
        const requiredBody = ReqBodyUtils.extractRequiredBody(req, ['id']);
        const user = MiddlewareUtils.getUser(res);

        if (requiredBody.isFailure()) {
            const data: BaseErrorRes = {
                code: ErrorCode.invalidParams,
                message: `id is required.`,
            };
            res.status(HttpStatusCode.BadRequest).json(data);
            return;
        }

        if (user.isFailure()) {
            this.logger.error(`Auth error. DELETE ${this.path}`);
            res.status(HttpStatusCode.InternalServerError).json(ResUtils.internalError());
            return;
        }

        const command = await this.ac.cmd.getById(Number(requiredBody.data.id));

        if (!command) {
            const data = ResUtils.notFoundError(`Command(${requiredBody.data.id})`);
            res.status(HttpStatusCode.NotFound).json(data);
            return;
        }

        const result = await this.ac.cmd.removeCommand(command.name, {
            provider: 'API',
            name: `${user.data.name}(${user.data.id})`,
        });

        if (result.isFailure()) {
            const data = ResUtils.notFoundError(`Command(${requiredBody.data.id})`);
            res.status(HttpStatusCode.NotFound).json(data);
            return;
        }

        const data: BaseRes<CommandT> = {
            data: result.data,
        };
        res.status(HttpStatusCode.Ok).json(data);
        return;
    }
}

/**
 * 文字列が任意の桁数の数字のみで構成されているか確かめるk
 */
function toNumber(data: string): Result<number, null> {
    const NumberRegexp = /^\d+$/;
    if (NumberRegexp.test(data)) return new Success(parseInt(data));
    return new Failure(null);
}
