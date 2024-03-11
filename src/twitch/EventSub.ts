import { EventSubMiddleware } from '@twurple/eventsub-http';
import type { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from '@twurple/eventsub-base';

import { rootLogger, env } from '@/initializer';
import { ArikenCompany } from '@/ArikenCompany';
import { Logger } from '@/packages';
import { settings } from '@/managers';
import { StreamNotification } from '@/twitch/StreamNotification';
import { Twitch } from '@/twitch/Twitch';

export class EventSub {
    private ac: ArikenCompany;
    public listener: EventSubMiddleware;
    public sn: StreamNotification;
    public logger: Logger;

    constructor(public twitch: Twitch) {
        this.ac = this.twitch.ac;
        this.logger = rootLogger.createChild('EventSub');
        this.listener = new EventSubMiddleware({
            apiClient: this.twitch.api,
            hostName: settings.cache.hostName,
            pathPrefix: '/twitch/eventsub',
            secret: env.cache.SECRET,
            logger: {
                minLevel: 'debug',
                custom: (level, message) => {
                    // デバッグログ
                    if (level === 4) {
                        this.logger.debug(message);
                    }
                },
            },
        });
        this.sn = new StreamNotification(this);
    }

    subscribeOnline(id: string, handler: (e: EventSubStreamOnlineEvent) => void) {
        return this.listener.onStreamOnline(id, handler);
    }

    subscribeOffline(id: string, handler: (e: EventSubStreamOfflineEvent) => void) {
        return this.listener.onStreamOffline(id, handler);
    }

    async start() {
        this.sn.init();
    }
}
