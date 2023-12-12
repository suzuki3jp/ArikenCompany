import { HelixStream } from '@twurple/api';
import { ChatInputCommandInteraction, Collection, EmbedBuilder, ChannelType } from 'discord.js';
import type { EventSubStreamOnlineEvent, EventSubSubscription } from '@twurple/eventsub-base';

import { ArikenCompany } from '../ArikenCompany';
import { EventSub } from './EventSub';
import { StreamNotification as StreamNotificationDB, StreamNotificationT } from '../database';
import { Logger, JST, dayjs } from '../packages';

export class StreamNotification {
    public snDB: StreamNotificationDB;
    public logger: Logger;

    private ac: ArikenCompany;
    private cache: Collection<string, Streamer>;

    constructor(public es: EventSub) {
        this.ac = this.es.twitch.ac;
        this.logger = this.ac.twitch.logger.createChild('StreamNotification');
        this.es = this.ac.twitch.eventSub;
        this.cache = new Collection(null);
        this.snDB = new StreamNotificationDB();
    }

    async add(i: ChatInputCommandInteraction) {
        const name = i.options.getString('name', true);
        const channel = i.options.getChannel('channel', true);
        const memo = i.options.getChannel('memo', false);

        if (channel.type !== ChannelType.GuildText) return this.eReply(i, 'テキストチャンネルを指定してください。');

        const streamer = await this.ac.twitch.api.users.getUserByName(name);
        if (!streamer) return this.eReply(i, 'その名前の配信者は見つかりませんでした。');

        const notification = new Streamer(this, {
            id: streamer.id,
            name: streamer.name,
            notification_channel: channel.id,
            memo_channel: memo?.id ?? null,
        });
        this.cache.set(streamer.id, notification);
        this.updateToDB('ADD', notification);
        this.logger.info(`Added streamer ${streamer.name} to notification list.`);
        return this.eReply(i, `${streamer.name} の配信通知を登録しました。`);
    }

    async remove(i: ChatInputCommandInteraction) {
        const name = i.options.getString('name', true);
        const streamer = await this.ac.twitch.api.users.getUserByName(name);
        if (!streamer) return this.eReply(i, 'その名前の配信者は見つかりませんでした。');

        const notification = this.cache.get(streamer.id);
        if (!notification) return this.eReply(i, 'その配信者は登録されていません。');

        notification.unsubscribe();
        this.cache.delete(streamer.id);
        this.updateToDB('REMOVE', notification);
        this.logger.info(`Removed streamer ${streamer.name} from notification list.`);
        return this.eReply(i, `${streamer.name} の配信通知を解除しました。`);
    }

    async init() {
        const notifications = await this.snDB.getAll();
        for (const notification of notifications) {
            const streamer = new Streamer(this, notification);
            this.cache.set(notification.id, streamer);
        }
    }

    eReply(i: ChatInputCommandInteraction, content: string) {
        i.reply({ content, ephemeral: true });
        return;
    }

    updateToDB(type: 'ADD' | 'REMOVE', data: Streamer) {
        switch (type) {
            case 'ADD':
                this.snDB.add(data.toJSON());
                break;
            case 'REMOVE':
                this.snDB.removeById(data.toJSON().id);
                break;
            default:
                break;
        }
    }
}

export class Streamer {
    private ac: ArikenCompany;
    private id: string;
    private name: string;
    private notificationChannelId: string;
    private memoChannelId: string | null;
    private isStreaming: boolean;
    private onlineSubscription: EventSubSubscription | null;
    private offlineSubscription: EventSubSubscription | null;

    constructor(private sn: StreamNotification, data: StreamNotificationT) {
        this.ac = this.sn.es.twitch.ac;
        this.id = data.id;
        this.name = data.name;
        this.notificationChannelId = data.notification_channel;
        this.memoChannelId = data.memo_channel ?? null;
        this.isStreaming = false;
        this.onlineSubscription = null;
        this.offlineSubscription = null;
        this.subscribe();
    }

    subscribe() {
        this.sn.logger.info("Subscribing streamer's online/offline event. twitch.user." + this.name);
        this.onlineSubscription = this.sn.es.subscribeOnline(this.id, async (e) => {
            this.isStreaming = true;
            await this.sendNotification(e);
            await this.postMemo();
        });
        this.offlineSubscription = this.sn.es.subscribeOffline(this.id, async (e) => {
            this.isStreaming = false;
        });
    }

    unsubscribe() {
        this.sn.logger.info("Unsubscribing streamer's online/offline event. twitch.user." + this.name);
        this.onlineSubscription?.stop();
        this.offlineSubscription?.stop();
    }

    async sendNotification(e: EventSubStreamOnlineEvent) {
        const channel = await this.ac.discord.client.channels.fetch(this.notificationChannelId);
        if (!channel?.isTextBased()) return;

        const stream = await e.getStream();
        if (!stream) return;

        const embed = this.createNotificationEmbed(stream);
        channel.send({ embeds: [embed] });
    }

    async postMemo() {
        if (!this.memoChannelId) return;
        const channel = await this.ac.discord.client.channels.fetch(this.memoChannelId);
        if (!channel || channel.type !== ChannelType.GuildForum) return;

        const stream = await this.ac.twitch.api.streams.getStreamByUserId(this.id);
        if (!stream) return;
        const { startDate } = stream;

        // 最新のアーカイブがスタートされた配信の物か確認する
        const video = (await this.ac.twitch.api.videos.getVideosByUser(this.id, { type: 'archive' })).data[0];
        if (video.streamId !== stream.id) return;

        // 配信開始日の日付データを取得する
        const now = dayjs(startDate);
        const year = now.year();
        const month = now.month() + 1;
        const day = now.date();
        const date = `${year}/${month}/${day}`;

        const lastThread = channel.threads.cache.last();
        if (!lastThread) return;

        // メモのチャンネルの分け方によって処理を分ける
        if (this.ac.settings.cache.memo.isSplitByStream) {
            const [lastDate, lastNum] = lastThread.name.split('#');

            // 同じ日に配信済みかどうか
            if (date === lastDate) {
                const newNum = Number(lastNum) + 1;
                await channel.threads.create({
                    name: `${date}#${newNum}`,
                    message: {
                        content: video.url,
                    },
                });
            } else {
                const newNum = 1;
                await channel.threads.create({
                    name: `${date}#${newNum}`,
                    message: {
                        content: video.url,
                    },
                });
            }
        } else {
            // 同じ日に配信済みかどうか
            if (date === lastThread.name) {
                await lastThread.send(video.url);
            } else {
                await channel.threads.create({
                    name: date,
                    message: {
                        content: video.url,
                    },
                });
            }
        }
    }

    createNotificationEmbed(s: HelixStream): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`${s.userDisplayName} が配信を開始しました`)
            .setDescription('-----------------------------')
            .setFields(
                { name: 'タイトル', value: s.title, inline: true },
                { name: 'ゲーム', value: s.gameName || 'ゲームが設定されていません', inline: true }
            )
            .setFooter({
                text: new JST().toString(),
            });
    }

    toJSON(): StreamNotificationT {
        return {
            id: this.id,
            name: this.name,
            notification_channel: this.notificationChannelId,
            memo_channel: this.memoChannelId,
        };
    }
}
