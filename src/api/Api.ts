import express, { Express } from 'express';
import { createServer, Server } from 'https';

import { ArikenCompany } from '../ArikenCompany';
import { RouteLoader } from './RouteLoader';
import { Path } from '../constants';
import { Logger, readFileSync } from '../packages';

export class Api {
    private app: Express;
    private server: Server;
    public logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.logger = this.ac.logger.createChild('Api');
        const router = new RouteLoader(this).load();
        this.app = express();
        this.app.use(router);
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
}
