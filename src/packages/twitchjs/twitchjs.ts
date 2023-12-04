import { ChatMessage } from '@twurple/chat';

import { Twitch } from '../../twitch/Twitch';

export class Message {
    public content: string;
    public id: string;
    public channel: Channel;
    public user: User;

    constructor(private client: Twitch, channelName: string, userName: string, text: string, private msg: ChatMessage) {
        this.content = text;
        this.id = msg.id;
        this.channel = new Channel(this.client, channelName, this.msg);
        this.user = new User(this.client, userName, this.msg);
    }

    async reply(content: string) {
        return await this.client.chat.client.say(this.channel.name, content, { replyTo: this.msg });
    }
}

export class Channel {
    public id: string | null;
    public name: string;

    constructor(private client: Twitch, channelName: string, msg: ChatMessage) {
        this.id = msg.channelId;
        this.name = channelName;
    }

    async send(content: string) {
        return await this.client.chat.client.say(this.name, content);
    }
}

export class User {
    public id: string;
    public name: string;
    public displayName: string;
    public isMod: boolean;
    public isBroadCaster: boolean;
    public isVip: boolean;

    constructor(private client: Twitch, userName: string, msg: ChatMessage) {
        this.id = msg.userInfo.userId;
        this.name = msg.userInfo.userName;
        this.displayName = msg.userInfo.displayName;
        this.isMod = msg.userInfo.isMod;
        this.isBroadCaster = msg.userInfo.isBroadcaster;
        this.isVip = msg.userInfo.isVip;
    }
}
