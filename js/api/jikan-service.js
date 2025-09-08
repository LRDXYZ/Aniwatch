/**
 * Jikan API 服务 (MyAnimeList 非官方 API)
 */
class JikanService {
    constructor() {
        this.baseURL = 'https://api.jikan.moe/v4';
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5分钟缓存
    }

    // 带缓存的请求
    async cachedRequest(endpoint) {
        const now = Date.now();
        const cached = this.cache.get(endpoint);

        if (cached && now - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        try {
            // Jikan API 有速率限制，需要延迟
            await this.delay(1000);

            const response = await fetch(`${this.baseURL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.cache.set(endpoint, { data, timestamp: now });

            return data;
        } catch (error) {
            console.error('Jikan API 请求失败:', error);
            throw error;
        }
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取动漫列表
    async getAnimeList(params = {}) {
        const { page = 1, limit = 24, type, status, rating, order_by = 'popularity' } = params;
        const queryParams = new URLSearchParams({
            page: page,
            limit: limit,
            order_by: order_by,
            sort: 'desc',
            ...(type && { type }),
            ...(status && { status }),
            ...(rating && { rating })
        });

        return this.cachedRequest(`/anime?${queryParams}`);
    }

    // 搜索动漫
    async searchAnime(query, filters = {}) {
        const { page = 1, limit = 24 } = filters;
        const queryParams = new URLSearchParams({
            q: query,
            page: page,
            limit: limit,
            order_by: 'popularity',
            sort: 'desc'
        });

        return this.cachedRequest(`/anime?${queryParams}`);
    }

    // 获取动漫详情
    async getAnimeById(malId) {
        return this.cachedRequest(`/anime/${malId}/full`);
    }

    // 获取动漫剧集
    async getAnimeEpisodes(malId, params = {}) {
        const { page = 1 } = params;
        return this.cachedRequest(`/anime/${malId}/episodes?page=${page}`);
    }

    // 获取热门动漫
    async getTopAnime(params = {}) {
        const { page = 1, limit = 25, type = 'tv' } = params;
        const queryParams = new URLSearchParams({
            page: page,
            limit: limit,
            type: type
        });

        return this.cachedRequest(`/top/anime?${queryParams}`);
    }

    // 获取季节动漫
    async getSeasonalAnime(year, season) {
        const now = new Date();
        const currentYear = year || now.getFullYear();
        const currentSeason = season || this.getCurrentSeason(now);

        return this.cachedRequest(`/seasons/${currentYear}/${currentSeason}`);
    }

    // 获取当前季节
    getCurrentSeason(date) {
        const month = date.getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'fall';
        return 'winter';
    }

    // 获取推荐动漫
    async getRecommendations(malId) {
        return this.cachedRequest(`/anime/${malId}/recommendations`);
    }

    // 获取动漫角色
    async getAnimeCharacters(malId) {
        return this.cachedRequest(`/anime/${malId}/characters`);
    }

    // 获取动漫统计
    async getAnimeStatistics(malId) {
        return this.cachedRequest(`/anime/${malId}/statistics`);
    }
}

// 全局实例
window.JikanAPI = new JikanService();