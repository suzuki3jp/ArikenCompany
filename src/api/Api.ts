import express, { Express, Router } from 'express';
import { createServer, Server } from 'https';
import { urlencoded } from 'body-parser';
import cors from 'cors';

import { ArikenCompany, rootLogger } from '@/ArikenCompany';
import { Path } from '@/constants';
import { Logger, readFileSync } from '@/packages';

import { RootService, RegisterService } from '@/api/routes';
import { AuthMiddleware } from '@/api/AuthMiddleware';
import { LoginService } from '@/api/routes/user/login';
import { UserService } from '@/api/routes/user';
import { CommandService } from '@/api/routes/commands';
import { PublicCommandsService } from '@/api/routes/commands/public';
import { StatusService } from '@/api/routes/status';

export class Api {
    private app: Express;
    private server: Server;
    public logger: Logger;

    constructor(public ac: ArikenCompany) {
        this.logger = rootLogger.createChild('Api');
        this.app = express();
        this.app.use(urlencoded({ extended: true }));
        this.app.use(
            cors({
                origin: ['http://localhost:3000', 'https://arikencompany.suzuki3jp.xyz'],
                credentials: true,
                optionsSuccessStatus: 200,
            })
        );
        this.app.use(this.loadRoutes());

        this.server = createServer(
            {
                key: readFileSync(Path.key),
                cert: readFileSync(Path.cert),
            },
            this.app
        );
        this.ac.twitch.eventSub.listener.apply(this.app);
    }

    public start(): void {
        this.server.listen(443, () => {
            this.ac.twitch.eventSub.listener.markAsReady();
            this.logger.system(`API is listening on port ${443}`);
        });
    }

    private loadRoutes() {
        const router = Router();

        // Non-auth routes
        router.get(RootService.path, (req, res) => {
            new RootService(this).get(req, res);
        });
        router.post(RegisterService.path, (req, res) => {
            new RegisterService(this).post(req, res);
        });
        router.post(LoginService.path, (req, res) => {
            new LoginService(this).post(req, res);
        });
        router.get(StatusService.path, (req, res) => {
            new StatusService(this).get(req, res);
        });
        router.get(PublicCommandsService.path, (req, res) => {
            new PublicCommandsService(this).get(req, res);
        });

        // Auth routes
        router.get(UserService.path, AuthMiddleware(this.ac), (req, res) => {
            new UserService(this).get(req, res);
        });
        router.delete(UserService.path, AuthMiddleware(this.ac), (req, res) => {
            new UserService(this).delete(req, res);
        });

        router.get(CommandService.path, AuthMiddleware(this.ac), (req, res) => {
            new CommandService(this).get(req, res);
        });
        router.post(CommandService.path, AuthMiddleware(this.ac), (req, res) => {
            new CommandService(this).post(req, res);
        });
        router.delete(CommandService.path, AuthMiddleware(this.ac), (req, res) => {
            new CommandService(this).delete(req, res);
        });
        router.put(CommandService.path, AuthMiddleware(this.ac), (req, res) => {
            new CommandService(this).put(req, res);
        });
        return router;
    }
}
