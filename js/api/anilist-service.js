// js/api/anilist-service.js
class AniListService {
    constructor() {
        this.baseUrl = 'https://graphql.anilist.co';
    }

    /**
     * 发送GraphQL查询
     */
    async query(query, variables = {}) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AniList API 查询失败:', error);
            throw error;
        }
    }

    // 获取动漫列表 - 添加语言参数
    async getAnimeList(params = {}) {
        const {
            page = 1,
            perPage = 20,
            sort = "POPULARITY_DESC",
            search = null,
            genre = null,
            season = null,
            seasonYear = null,
            format = null
        } = params;

        const query = `
            query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $genre: String, $season: MediaSeason, $seasonYear: Int, $format: MediaFormat) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                        perPage
                    }
                    media(type: ANIME, sort: $sort, search: $search, genre: $genre, season: $season, seasonYear: $seasonYear, format: $format) {
                        id
                        title {
                            romaji
                            english
                            native
                            userPreferred
                        }
                        coverImage {
                            large
                            medium
                        }
                        format
                        episodes
                        status
                        season
                        seasonYear
                        averageScore
                        genres
                        studios {
                            nodes {
                                name
                            }
                        }
                        description
                    }
                }
            }
        `;

        const variables = {
            page,
            perPage,
            sort: [sort],
            search,
            genre,
            season,
            seasonYear,
            format
        };

        // 修复：使用已有的query方法而不是不存在的request方法
        return this.query(query, variables);
    }

    // 搜索动漫
    async searchAnime(query, filters = {}) {
        return this.getAnimeList({ ...filters, search: query });
    }

    // 获取动漫详情 - 添加更多中文字段
    async getAnimeById(id) {
        const query = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            id
            title {
                romaji
                english
                native
                userPreferred
            }
            coverImage {
                large
                medium
            }
            bannerImage
            format
            episodes
            status
            season
            seasonYear
            duration
            averageScore
            meanScore
            popularity
            favourites
            description
            genres
            tags {
                name
            }
            studios {
                nodes {
                    name
                }
            }
            source
            trailer {
                id
                site
                thumbnail
            }
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            season
            seasonYear
            characters(sort: ROLE) {
                edges {
                    role
                    node {
                        id
                        name {
                            full
                            native
                            userPreferred
                        }
                        image {
                            large
                            medium
                        }
                    }
                }
            }
            staff(sort: RELEVANCE) {
                edges {
                    role
                    node {
                        id
                        name {
                            full
                            native
                            userPreferred
                        }
                    }
                }
            }
            recommendations(sort: RATING_DESC) {
                nodes {
                    mediaRecommendation {
                        id
                        title {
                            romaji
                            english
                            native
                            userPreferred
                        }
                        coverImage {
                            large
                            medium
                        }
                        format
                        averageScore
                        episodes
                    }
                }
            }
        }
    }
`;

        const variables = { id };

        // 修复：使用已有的query方法而不是不存在的request方法
        return this.query(query, variables);
    }

    // 获取剧集列表（AniList没有单独的剧集概念，但可以获取相关数据）
    async getEpisodes(animeId) {
        // AniList没有传统意义上的剧集列表，这里返回空数组
        // 可以通过getAnimeById获取相关数据
        return [];
    }
}

// 全局实例
window.AniListAPI = new AniListService();