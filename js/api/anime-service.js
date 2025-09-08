/**
 * 统一的动漫API服务
 */
class AnimeAPIService {
    constructor() {
        this.providers = {
            jikan: window.JikanAPI
        };
        this.currentProvider = 'jikan';
    }

    // 设置API提供商
    setProvider(provider) {
        if (this.providers[provider]) {
            this.currentProvider = provider;
        }
    }

    // 获取动漫列表
    async getAnimeList(params = {}) {
        try {
            const data = await this.providers[this.currentProvider].getAnimeList(params);
            return this.formatAnimeList(data);
        } catch (error) {
            console.error('获取动漫列表失败:', error);
            throw error;
        }
    }

    // 搜索动漫
    async searchAnime(query, filters = {}) {
        try {
            const data = await this.providers[this.currentProvider].searchAnime(query, filters);
            return this.formatAnimeList(data);
        } catch (error) {
            console.error('搜索动漫失败:', error);
            throw error;
        }
    }

    // 获取动漫详情
    async getAnimeDetail(malId) {
        try {
            const data = await this.providers[this.currentProvider].getAnimeById(malId);
            return this.formatAnimeDetail(data);
        } catch (error) {
            console.error('获取动漫详情失败:', error);
            throw error;
        }
    }

    // 获取剧集列表
    async getEpisodes(malId, params = {}) {
        try {
            const data = await this.providers[this.currentProvider].getAnimeEpisodes(malId, params);
            return this.formatEpisodes(data);
        } catch (error) {
            console.error('获取剧集失败:', error);
            throw error;
        }
    }

    // 格式化动漫列表
    formatAnimeList(data) {
        if (data.data && Array.isArray(data.data)) {
            return {
                anime: data.data.map(item => this.formatAnimeItem(item)),
                pagination: data.pagination
            };
        }
        return { anime: [], pagination: null };
    }

    // 格式化单个动漫项目
    formatAnimeItem(item) {
        return {
            mal_id: item.mal_id,
            title: item.title,
            title_english: item.title_english,
            title_japanese: item.title_japanese,
            images: item.images,
            type: item.type,
            episodes: item.episodes,
            status: item.status,
            score: item.score,
            scored_by: item.scored_by,
            rank: item.rank,
            popularity: item.popularity,
            synopsis: item.synopsis,
            background: item.background,
            season: item.season,
            year: item.year,
            genres: item.genres,
            studios: item.studios,
            trailer: item.trailer
        };
    }

    // 格式化动漫详情
    formatAnimeDetail(data) {
        if (data.data) {
            return this.formatAnimeItem(data.data);
        }
        return null;
    }

    // 格式化剧集列表
    formatEpisodes(data) {
        if (data.data && Array.isArray(data.data)) {
            return data.data.map(episode => ({
                mal_id: episode.mal_id,
                url: episode.url,
                title: episode.title,
                title_japanese: episode.title_japanese,
                title_romanji: episode.title_romanji,
                episode: episode.episode,
                score: episode.score,
                filler: episode.filler,
                recap: episode.recap,
                forum_url: episode.forum_url
            }));
        }
        return [];
    }
}

// 全局实例
window.AnimeAPI = new AnimeAPIService();