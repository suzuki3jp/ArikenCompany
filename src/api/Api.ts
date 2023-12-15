import express, { Express } from 'express';
import { createServer, Server } from 'https';

import { ArikenCompany } from '../ArikenCompany';
import { RouteLoader } from './RouteLoader';
import { Path } from '../constants';
import { readFileSync } from '../packages';

export class Api {
    private app: Express;
    private server: Server;

    constructor(private ac: ArikenCompany) {
        const router = new RouteLoader().load();
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
            console.log(`Server is listening on port ${3000}`);
        });
    }
}