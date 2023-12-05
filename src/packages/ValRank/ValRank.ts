import { fetch } from '../fetch/fetch';

class ValRank {
    constructor() {}
    /**
     * Get valorant rank from name and tag
     * @param {string} name
     * @param {string} tag
     */
    async get(name: string, tag: string): Promise<string | number> {
        const url = `https://api.henrikdev.xyz/valorant/v1/mmr/ap/${encodeURI(name)}/${encodeURI(tag)}`;
        const res = await fetch<RankResponse>(url);
        if (res.status !== 200) return res.status;
        if (!res.data) return 500;
        const data = res.data;
        return this.parseRank('ja', data);
    }

    private parseRank(lang: 'en' | 'ja', data: RankData): string {
        if (lang === 'ja') {
            const [tier, place] = data.currenttierpatched.split(' ');
            return `${RankMap[tier]} ${place} | ${data.ranking_in_tier}`;
        } else {
            return `${data.currenttierpatched} | ${data.ranking_in_tier}`;
        }
    }
}

interface RankResponse {
    status: number;
    data?: RankData;
    // エラーは必要ないため、anyで定義
    errors?: any[];
}

interface RankData {
    currenttier: number;
    currenttierpatched: string;
    images: {
        small: string;
        large: string;
        triangle_down: string;
        triangle_up: string;
    };
    ranking_in_tier: number;
    mmr_change_to_last_game: number;
    elo: number;
    name: string;
    tag: string;
    old: boolean;
}

const RankMap: Record<string, string> = {
    Iron: 'アイアン',
    Bronze: 'ブロンズ',
    Silver: 'シルバー',
    Gold: 'ゴールド',
    Platinum: 'プラチナ',
    Diamond: 'ダイアモンド',
    Ascendant: 'アセンダント',
    Immortal: 'イモータル',
    Radiant: 'レディアント',
};
