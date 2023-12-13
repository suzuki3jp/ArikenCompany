import { EventSubHttpListener, DirectConnectionAdapter } from '@twurple/eventsub-http';
import type { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from '@twurple/eventsub-base';

import { StreamNotification } from './StreamNotification';
import { Twitch } from './Twitch';
import { ArikenCompany } from '../ArikenCompany';
import { Path } from '../constants';
import { readFileSync } from '../packages';

export class EventSub {
    private ac: ArikenCompany;
    private listener: EventSubHttpListener;
    public sn: StreamNotification;

    constructor(public twitch: Twitch) {
        this.ac = this.twitch.ac;
        const adapter = new DirectConnectionAdapter({
            hostName: this.ac.settings.cache.hostName,
            sslCert: {
                key: readFileSync(Path.key),
                cert: readFileSync(Path.cert),
            },
        });
        this.listener = new EventSubHttpListener({
            apiClient: this.twitch.api,
            adapter,
            secret: this.ac.env.cache.TWITCH_EVENTSUB_SECRET,
        });
        this.sn = new StreamNotification(this);
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
        this.twitch.api.eventSub.getSubscriptions().then(console.log);
    }
}
