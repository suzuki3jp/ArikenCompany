import { EventSubHttpListener, DirectConnectionAdapter } from '@twurple/eventsub-http';

import { ArikenCompany } from '../ArikenCompany';
import { Path } from '../constants';
import { readFileSync } from '../packages';

export class EventSub {
    private listener: EventSubHttpListener;

    constructor(private ac: ArikenCompany) {
        const adapter = new DirectConnectionAdapter({
            hostName: this.ac.settings.cache.hostName,
            sslCert: {
                key: readFileSync(Path.key),
                cert: readFileSync(Path.cert),
            },
        });
        this.listener = new EventSubHttpListener({
            apiClient: this.ac.twitch.api,
            adapter,
            secret: this.ac.env.cache.TWITCH_EVENTSUB_SECRET,
        });
    }

    start() {
        this.listener.start();
    }
}
