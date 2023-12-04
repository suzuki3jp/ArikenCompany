import { BitFieldResolvable, Client, GatewayIntentBits, Events } from 'discord.js';

import { ArikenCompany } from '../ArikenCompany';
import type { Logger } from '../packages';

export class Discord {
    private ac: ArikenCompany;
    private client: Client;
    private logger: Logger;

    constructor(ac: ArikenCompany) {
        this.ac = ac;
        this.client = new Client({
            intents: Object.values(GatewayIntentBits) as BitFieldResolvable<keyof typeof GatewayIntentBits, number>,
        });
        this.logger = this.ac.logger.createChild('Discord');
    }

    loadEvents() {
        this.logger.info('Loading discord events.');
        this.client.on(Events.ClientReady, (c: Client<true>) => this.ready());
    }

    async start() {
        this.logger.info('Starting Discord Client.');
        this.loadEvents();
        this.client.login(this.ac.env.cache.DISCORD_TOKEN);
    }

    async ready() {
        this.logger.info('Discord client is ready.');
    }
}
