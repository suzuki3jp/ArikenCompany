import axios from 'axios';

export class ApiClient {
    private baseUrl: string = Endpoints.base;

    async getStatus(): Promise<StatusData | null> {
        try {
            const res = await axios.get(this.toUrl(Endpoints.status));

            if (res.status !== 200) throw new Error('Internal Error');
            return res.data.data;
        } catch (error) {
            return null;
        }
    }

    async getPublicCommands(): Promise<PublicCommandData[] | null> {
        try {
            const res = await axios.get(this.toUrl(Endpoints.publicCommands));
            if (res.status !== 200) throw new Error('Internal Error');
            return res.data.data;
        } catch (error) {
            return null;
        }
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
    base: 'https://ac-api.suzuki3.jp',
    status: '/status',
    publicCommands: '/commands/public',
};

interface StatusData {
    uptime: { hours: number; minutes: number; seconds: number };
}

export interface PublicCommandData {
    name: string;
    content: string;
    mod_only: boolean;
}
