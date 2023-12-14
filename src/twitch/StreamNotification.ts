import { HelixStream } from '@twurple/api';
import {
    ChatInputCommandInteraction,
    Collection,
    EmbedBuilder,
    ChannelType,
    ButtonInteraction,
    ModalSubmitInteraction,
    Embed,
    ModalBuilder,
} from 'discord.js';
import type { EventSubStreamOnlineEvent, EventSubSubscription } from '@twurple/eventsub-base';

import { ArikenCompany } from '../ArikenCompany';
import { EventSub } from './EventSub';
import { StreamNotificationDB, StreamNotificationT } from '../database';
import { Logger, JST, dayjs } from '../packages';
import { DiscordActionRows, DiscordComponentIds } from '../discord/DiscordComponents';

export class StreamNotification {
    public snDB: StreamNotificationDB;
    public logger: Logger;

    private ac: ArikenCompany;
    private cache: Collection<string, Streamer>;

    constructor(public es: EventSub) {
        this.ac = this.es.twitch.ac;
        this.logger = this.es.twitch.logger.createChild('StreamNotification');
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

    async setupMemoPanel(i: ChatInputCommandInteraction) {
        const channel = i.options.getChannel('channel', true, [ChannelType.GuildForum]);
        const name = i.options.getString('name', true);
        const twitcher = await this.ac.twitch.api.users.getUserByName(name);

        if (!twitcher) return this.eReply(i, 'その名前の配信者は見つかりませんでした。');
        i.channel?.send({
            embeds: [
                {
                    title: 'メモを送信する',
                    description: `下記のチャンネルにメモを送信します。`,
                    fields: [
                        { name: 'メモチャンネル', value: `<#${channel.id}>` },
                        { name: '配信者', value: name },
                    ],
                    footer: {
                        text: `${channel.id},${twitcher.id}`,
                    },
                },
            ],
            components: [DiscordActionRows.sendMemoController],
        });
        this.logger.info(`Setup memo panel for ${name}.`);
        return this.eReply(i, 'メモパネルを設定しました。');
    }

    getMemoInfoFromPanel(e: Embed) {
        const footer = e.footer?.text;
        if (!footer) return null;
        const [channelId, streamerId] = footer.split(',');
        return { channelId, streamerId };
    }

    async showSendMemoModal(i: ButtonInteraction) {
        const info = this.getMemoInfoFromPanel(i.message.embeds[0]);
        if (!info) return;
        const { streamerId } = info;
        const stream = await this.ac.twitch.api.streams.getStreamByUserId(streamerId);
        const forum = await this.ac.discord.client.channels.fetch(info.channelId);
        if (!forum || forum.type !== ChannelType.GuildForum)
            return this.eReply(i, 'メモチャンネルが見つからなかったかタイプが不正です。');

        const { memoThreadActionRow, memoContentActionRow, streamLengthActionRow } = DiscordActionRows;
        const thread = forum.threads.cache.last();
        if (!thread) return this.eReply(i, 'メモスレッドが見つかりませんでした。');

        memoThreadActionRow.components[0].setValue(thread.name);
        if (stream) {
            streamLengthActionRow.components[0].setValue(this.getTimeStampFromStartAt(stream.startDate));
        }

        const modal = new ModalBuilder()
            .setCustomId(DiscordComponentIds.modal.sendMemoModal)
            .setTitle('メモを送信する')
            .addComponents(memoThreadActionRow, streamLengthActionRow, memoContentActionRow);
        i.showModal(modal);
    }

    private getTimeStampFromStartAt(startAt: Date): string {
        const startAtDayJs = dayjs(startAt);
        const now = dayjs();
        const diff = now.diff(startAtDayJs, 'second');
        const hour = Math.floor(diff / 3600);
        const minute = Math.floor((diff - hour * 3600) / 60);
        const second = diff - hour * 3600 - minute * 60;

        if (second > 30) return `${putZero(hour)}:${putZero(minute + 1)}`;
        return `${putZero(hour)}:${putZero(minute)}`;

        function putZero(n: number) {
            return n < 10 ? '0' + n : n;
        }
    }

    async sendMemo(i: ModalSubmitInteraction) {
        const channelName = i.fields.getTextInputValue(DiscordComponentIds.textInput.memoThread);
        const content = i.fields.getTextInputValue(DiscordComponentIds.textInput.memoContent);
        const time = i.fields.getTextInputValue(DiscordComponentIds.textInput.streamLength);

        if (!i.message) return;
        const info = this.getMemoInfoFromPanel(i.message.embeds[0]);
        if (!info) return;
        const channel = await this.ac.discord.client.channels.fetch(info.channelId);
        if (!channel || channel.type !== ChannelType.GuildForum) return;

        const thread = channel.threads.cache.find((t) => t.name === channelName);
        if (!thread) return this.eReply(i, 'メモスレッドが見つかりませんでした。');

        await thread.send({
            content: `${time} ${content}`,
        });
        i.deferReply({});
    }

    async init() {
        const notifications = await this.snDB.getAll();
        for (const notification of notifications) {
            const streamer = new Streamer(this, notification);
            this.cache.set(notification.id, streamer);
        }
    }

    eReply(i: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction, content: string) {
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
            this.writeStreamLog('ONLINE');
        });
        this.offlineSubscription = this.sn.es.subscribeOffline(this.id, async (e) => {
            this.isStreaming = false;
            this.writeStreamLog('OFFLINE');
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

    writeStreamLog(state: 'ONLINE' | 'OFFLINE') {
        this.sn.logger.info(`Streamer ${this.name} is ${state.toLowerCase()}.`);
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
        if (!video || video.streamId !== stream.id) return;

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
