import { ArikenCompany } from '../src/ArikenCompany';

(async () => {
    const ac = new ArikenCompany();
    const subscriptions = await ac.twitch.api.eventSub.getSubscriptions();
    console.log(subscriptions);
    await ac.twitch.api.eventSub.deleteAllSubscriptions();
    console.log('Deleted subscriptions.');
    process.exit(0);
})();
