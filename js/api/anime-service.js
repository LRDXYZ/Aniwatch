// js/api/anime-service.js (完整版本)
/**
 * 统一的动漫API服务
 */
class AnimeAPIService {
    constructor() {
        this.providers = {
            jikan: window.JikanAPI,
            anilist: window.AniListAPI // 添加AniList支持
        };
        this.currentProvider = 'anilist'; // 默认使用AniList
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
            let data;
            if (this.currentProvider === 'anilist') {
                data = await this.providers[this.currentProvider].getAnimeList(params);
                return this.formatAnimeListAniList(data);
            } else {
                data = await this.providers[this.currentProvider].getAnimeList(params);
                return this.formatAnimeList(data);
            }
        } catch (error) {
            console.error('获取动漫列表失败:', error);
            throw error;
        }
    }

    // 搜索动漫
    async searchAnime(query, filters = {}) {
        try {
            let data;
            if (this.currentProvider === 'anilist') {
                data = await this.providers[this.currentProvider].searchAnime(query, filters);
                return this.formatAnimeListAniList(data);
            } else {
                data = await this.providers[this.currentProvider].searchAnime(query, filters);
                return this.formatAnimeList(data);
            }
        } catch (error) {
            console.error('搜索动漫失败:', error);
            throw error;
        }
    }

    // 获取动漫详情
    async getAnimeDetail(id) {
        try {
            let data;
            if (this.currentProvider === 'anilist') {
                data = await this.providers[this.currentProvider].getAnimeById(id);
                return this.formatAnimeDetailAniList(data);
            } else {
                data = await this.providers[this.currentProvider].getAnimeById(id);
                return this.formatAnimeDetail(data);
            }
        } catch (error) {
            console.error('获取动漫详情失败:', error);
            throw error;
        }
    }

    // 获取剧集列表
    async getEpisodes(animeId, params = {}) {
        try {
            if (this.currentProvider === 'anilist') {
                // AniList没有剧集概念，返回空数组
                return [];
            } else {
                const data = await this.providers[this.currentProvider].getAnimeEpisodes(animeId, params);
                return this.formatEpisodes(data);
            }
        } catch (error) {
            console.error('获取剧集失败:', error);
            throw error;
        }
    }

    // 格式化动漫列表 (Jikan)
    formatAnimeList(data) {
        if (data.data && Array.isArray(data.data)) {
            return {
                anime: data.data.map(item => this.formatAnimeItem(item)),
                pagination: data.pagination
            };
        }
        return { anime: [], pagination: null };
    }

    // 格式化单个动漫项目 (Jikan)
    formatAnimeItem(item) {
        return {
            id: item.mal_id,
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

    // 格式化动漫详情 (Jikan)
    formatAnimeDetail(data) {
        if (data.data) {
            return this.formatAnimeItem(data.data);
        }
        return null;
    }

    // 格式化剧集列表 (Jikan)
    formatEpisodes(data) {
        if (data.data && Array.isArray(data.data)) {
            return data.data.map(episode => ({
                id: episode.mal_id,
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

    // 格式化动漫列表 (AniList) - 优化中文显示
    formatAnimeListAniList(data) {
        if (data.data && data.data.Page) {
            const pageData = data.data.Page;
            return {
                anime: pageData.media.map(item => this.formatAnimeItemAniList(item)),
                pagination: {
                    current_page: pageData.pageInfo.currentPage,
                    last_page: pageData.pageInfo.lastPage,
                    has_next_page: pageData.pageInfo.hasNextPage,
                    items: {
                        total: pageData.pageInfo.total
                    }
                }
            };
        }
        return { anime: [], pagination: null };
    }

    // 格式化单个动漫项目 (AniList) - 优化中文显示
    formatAnimeItemAniList(item) {
        // 优先使用中文标题
        let title = item.title.userPreferred || item.title.romaji;
        // 如果有中文标题，优先使用
        if (item.title.native && item.title.native.match(/[\u4e00-\u9fa5]/)) {
            title = item.title.native;
        } else if (item.title.chinese) {
            title = item.title.chinese;
        }

        return {
            id: item.id,
            mal_id: item.id, // 使用AniList ID
            title: title,
            title_english: item.title.english,
            title_japanese: item.title.native,
            images: {
                jpg: {
                    image_url: item.coverImage.medium,
                    large_image_url: item.coverImage.large
                }
            },
            type: item.format,
            episodes: item.episodes,
            status: item.status,
            score: item.averageScore ? item.averageScore / 10 : null, // AniList评分是100分制
            scored_by: null,
            rank: null,
            popularity: item.popularity,
            synopsis: item.description ? item.description.replace(/<[^>]*>/g, '') : null,
            background: null,
            season: item.season,
            year: item.seasonYear,
            genres: item.genres,
            studios: item.studios ? item.studios.nodes.map(s => ({ name: s.name })) : [],
            trailer: null
        };
    }

    // 格式化动漫详情 (AniList) - 优化中文显示
    formatAnimeDetailAniList(data) {
        if (data.data && data.data.Media) {
            const item = data.data.Media;

            // 优先使用中文标题
            let title = item.title.userPreferred || item.title.romaji;
            // 如果有中文标题，优先使用
            if (item.title.native && item.title.native.match(/[\u4e00-\u9fa5]/)) {
                title = item.title.native;
            } else if (item.title.chinese) {
                title = item.title.chinese;
            }

            // 处理角色名称
            let characters = [];
            if (item.characters && item.characters.edges) {
                characters = item.characters.edges.map(edge => {
                    const node = edge.node;
                    let characterName = node.name.userPreferred || node.name.full;
                    if (node.name.native && node.name.native.match(/[\u4e00-\u9fa5]/)) {
                        characterName = node.name.native;
                    }
                    return {
                        id: node.id,
                        name: characterName,
                        name_native: node.name.native,
                        name_full: node.name.full,
                        image: node.image,
                        role: edge.role
                    };
                });
            }

            // 处理工作人员名称
            let staff = [];
            if (item.staff && item.staff.edges) {
                staff = item.staff.edges.map(edge => {
                    const node = edge.node;
                    let staffName = node.name.userPreferred || node.name.full;
                    if (node.name.native && node.name.native.match(/[\u4e00-\u9fa5]/)) {
                        staffName = node.name.native;
                    }
                    return {
                        id: node.id,
                        name: staffName,
                        name_native: node.name.native,
                        name_full: node.name.full,
                        role: edge.role
                    };
                });
            }

            return {
                id: item.id,
                mal_id: item.id,
                title: title,
                title_english: item.title.english,
                title_japanese: item.title.native,
                images: {
                    jpg: {
                        image_url: item.coverImage.medium,
                        large_image_url: item.coverImage.large
                    }
                },
                bannerImage: item.bannerImage,
                type: item.format,
                episodes: item.episodes,
                status: item.status,
                score: item.averageScore ? item.averageScore / 10 : null,
                scored_by: null,
                rank: null,
                popularity: item.popularity,
                synopsis: item.description ? item.description.replace(/<[^>]*>/g, '') : null,
                background: null,
                season: item.season,
                year: item.seasonYear,
                genres: item.genres,
                studios: item.studios ? item.studios.nodes.map(s => ({ name: s.name })) : [],
                trailer: item.trailer, // 添加这一行
                source: item.source,
                duration: item.duration,
                startDate: item.startDate,
                endDate: item.endDate,
                characters: characters,
                staff: staff
            };
        }
        return null;
    }
}

// 全局实例
window.AnimeAPI = new AnimeAPIService();