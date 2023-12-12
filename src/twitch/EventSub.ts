import { EventSubHttpListener, DirectConnectionAdapter } from '@twurple/eventsub-http';
import type { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from '@twurple/eventsub-base';

import { StreamNotification } from './StreamNotification';
import { ArikenCompany } from '../ArikenCompany';
import { Path } from '../constants';
import { readFileSync } from '../packages';

export class EventSub {
    private listener: EventSubHttpListener;
    public sn: StreamNotification;

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
        this.sn = new StreamNotification(this.ac);
    }

    subscribeOnline(id: string, handler: (e: EventSubStreamOnlineEvent) => void) {
        return this.listener.onStreamOnline(id, handler);
    }

    subscribeOffline(id: string, handler: (e: EventSubStreamOfflineEvent) => void) {
        return this.listener.onStreamOffline(id, handler);
    }

    start() {
        this.listener.start();
        this.sn.init();
    }
}
