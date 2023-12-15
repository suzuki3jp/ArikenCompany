import { EventSubMiddleware } from '@twurple/eventsub-http';
import type { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from '@twurple/eventsub-base';

import { StreamNotification } from './StreamNotification';
import { Twitch } from './Twitch';
import { ArikenCompany } from '../ArikenCompany';

export class EventSub {
    private ac: ArikenCompany;
    public listener: EventSubMiddleware;
    public sn: StreamNotification;

    constructor(public twitch: Twitch) {
        this.ac = this.twitch.ac;
        this.listener = new EventSubMiddleware({
            apiClient: this.twitch.api,
            hostName: this.ac.settings.cache.hostName,
            pathPrefix: '/twitch/eventsub',
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
        this.sn.init();
    }
}
