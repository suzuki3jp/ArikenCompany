import express, { Express, Router } from 'express';
import { createServer, Server } from 'https';

import { RootService, RegisterService } from './routes';

import { ArikenCompany } from '../ArikenCompany';
import { Path } from '../constants';
import { Logger, readFileSync } from '../packages';

export class Api {
    private app: Express;
    private server: Server;
    public logger: Logger;

    constructor(public ac: ArikenCompany) {
        this.logger = this.ac.logger.createChild('Api');
        this.app = express();
        this.app.use(express.json());
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

        router.get(RootService.path, (req, res) => {
            new RootService(this).get(req, res);
        });
        router.post(RegisterService.path, (req, res) => {
            new RegisterService(this).post(req, res);
        });

        return router;
    }
}
