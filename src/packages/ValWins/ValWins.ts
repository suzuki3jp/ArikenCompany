import { fetch } from '../fetch/fetch';

export class ValWins {
    constructor() {}
    /**
     * Get valorant wins from name and tag
     * @param {string} name
     * @param {string} tag
     */
    async get(name: string, tag: string): Promise<string | number> {
        const url = `https://api.henrikdev.xyz/valorant/v3/matches/ap/${encodeURI(name)}/${encodeURI(tag)}`;
        const res: RankResponse = await fetch(url);
        if (res.status !== 200) return res.status;
        if (!res.data) return 500;
        const data = res.data;
        return this.parseWins(data, name, tag);
    }

    private parseWins(data: RankResponse['data'], name: string, tag: string): string {
        let wins = 0;
        data?.forEach((m) => {
            const wonTeam = m.teams.red.has_won ? 'red' : 'blue';
            const isPlayerWon =
                m.players.all_players.find((p) => p.name === name && p.tag === tag)?.team.toLowerCase() === wonTeam;
            if (isPlayerWon) wins++;
        });
        return `コンペ直近5試合の勝率: ${wins}W${5 - wins}L`;
    }
}

interface RankResponse {
    status: number;
    data?: MatchData[];
    // エラーは必要ないため、unknownで定義
    errors?: unknown[];
}

interface MatchData {
    players: {
        all_players: MatchPlayerData[];
    };
    teams: {
        red: {
            has_won: boolean;
        };
        blue: {
            has_won: boolean;
        };
    };
}

interface MatchPlayerData {
    name: string;
    tag: string;
    team: 'Red' | 'Blue';
}
