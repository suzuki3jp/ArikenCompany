import axios from 'axios';

export class ApiClient {
    private baseUrl: string = Endpoints.base;

    async getStatus(): Promise<StatusData> {
        const res = await axios.get(this.toUrl(Endpoints.status));

        if (res.status !== 200) throw new Error('Internal Error');
        return res.data.data;
    }

    async getPublicCommands(): Promise<PublicCommandData[]> {
        const res = await axios.get(this.toUrl(Endpoints.publicCommands));

        if (res.status !== 200) throw new Error('Internal Error');
        return res.data.data;
    }

    /**
     * Join `baseUrl` and `path`
     * @param path
     */
    toUrl(path: string): string {
        return `${this.baseUrl}${path}`;
    }
}

const Endpoints = {
    base: 'https://api.suzuki3jp.xyz',
    status: '/status',
    publicCommands: '/commands/public',
};

interface StatusData {
    uptime: { hours: number; minutes: number; seconds: number };
}

export interface PublicCommandData {
    name: string;
    content: string;
    isModOnly: boolean;
}
