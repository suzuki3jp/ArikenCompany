import express, { type Express, type Router } from 'express';
import { createServer, type Server } from 'https';
import { urlencoded } from 'body-parser';
import cors from 'cors';

import { ArikenCompany } from '@/ArikenCompany';
import { rootLogger } from '@/initializer';
import { Logger, readFileSync } from '@/packages';
import { Path } from '@/constants';

export class Api {
    private app: Express;
    private server: Server;
    private PORT = 443;

    public logger: Logger;

    constructor(private ac: ArikenCompany) {
        this.logger = rootLogger.createChild('Api');
        this.app = express();
        this.app.use(urlencoded({ extended: true }));
        this.app.use(
            cors({
                origin: ['http://localhost:*', 'https:*.suzuki3jp.xyz'],
                credentials: true,
                optionsSuccessStatus: 200,
            })
        );

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
        this.server.listen(this.PORT, () => {
            this.ac.twitch.eventSub.listener.markAsReady();
            this.logger.system(`API is listening on port ${this.PORT}`);
        });
    }
}
