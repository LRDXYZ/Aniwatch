// js/page/detail.js
// 等待所有资源加载完成后再执行
window.addEventListener('DOMContentLoaded', async function () {
    // 初始化背景音乐管理器
    CommonUtils.BackgroundMusicManager.init();

    // 更新用户认证状态显示
    CommonUtils.UserAuthManager.updateNavbarAuthStatus();

    // 检查必要的API是否已加载
    if (typeof window.AnimeAPI === 'undefined') {
        console.error('API 未定义，请检查脚本加载顺序');
        document.body.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger">
                    <h4>系统错误</h4>
                    <p>页面资源加载失败，请刷新页面重试。</p>
                    <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                </div>
            </div>
        `;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('mal_id') || urlParams.get('season_id') || urlParams.get('id');

    if (!animeId) {
        alert('无效的动漫ID');
        window.location.href = 'index.html';
        return;
    }

    try {
        let animeDetail, episodes = [];

        // 只使用 AniList API
        try {
            AnimeAPI.setProvider('anilist');
            animeDetail = await AnimeAPI.getAnimeDetail(animeId);
            episodes = await AnimeAPI.getEpisodes(animeId);
        } catch (anilistError) {
            console.error('AniList API 获取动漫详情失败:', anilistError);
            throw new Error('无法从AniList API获取动漫详情');
        }

        if (!animeDetail) {
            throw new Error('无法从任何API获取动漫详情');
        }

        // 并行渲染详情和剧集，提高效率
        Promise.all([
            renderAnimeDetail(animeDetail),
            renderEpisodes(episodes)
        ]).then(() => {
            // 添加B站跳转按钮事件
            setupBilibiliRedirect(animeDetail);
        });

    } catch (error) {
        console.error('加载动漫详情失败:', error);
        const animeDetailElement = document.getElementById('anime-detail');
        if (animeDetailElement) {
            animeDetailElement.innerHTML = `
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4>加载失败</h4>
                        <p>加载动漫详情时出错: ${error.message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
                        <a href="index.html" class="btn btn-secondary">返回首页</a>
                    </div>
                </div>
            `;
        } else {
            // 如果找不到 anime-detail 元素，创建一个
            document.body.innerHTML += `
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4>加载失败</h4>
                        <p>加载动漫详情时出错: ${error.message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
                        <a href="index.html" class="btn btn-secondary">返回首页</a>
                    </div>
                </div>
            `;
        }
    }
});

// 渲染动漫详情
async function renderAnimeDetail(anime) {
    if (!anime) return Promise.resolve();

    return new Promise((resolve) => {
        // 使用requestAnimationFrame来避免阻塞主线程
        requestAnimationFrame(() => {
            try {
                // 设置页面标题
                document.title = `${anime.title} - AniWatch`;

                // 设置封面图片
                // 根据数据来源选择正确的图片路径
                let imageUrl = 'assets/images/poster/default.jpg';
                if (anime.images?.jpg?.image_url) {
                    // Jikan API 格式
                    imageUrl = anime.images.jpg.image_url;
                } else if (anime.images?.jpg?.large_image_url) {
                    // Jikan API 格式
                    imageUrl = anime.images.jpg.large_image_url;
                } else if (anime.coverImage?.medium) {
                    // AniList API 格式
                    imageUrl = anime.coverImage.medium;
                } else if (anime.coverImage?.large) {
                    // AniList API 格式
                    imageUrl = anime.coverImage.large;
                }

                const coverElement = document.getElementById('anime-cover');
                if (coverElement) {
                    coverElement.src = imageUrl;
                    coverElement.alt = anime.title;
                }

                // 设置标题
                const titleElement = document.getElementById('anime-title');
                if (titleElement) {
                    titleElement.textContent = anime.title;
                }

                // 设置描述
                const descriptionElement = document.getElementById('anime-description');
                if (descriptionElement) {
                    // 根据API来源选择正确的描述字段
                    let synopsis = '暂无简介';
                    if (anime.synopsis) {
                        // Jikan API
                        synopsis = anime.synopsis;
                    } else if (anime.description) {
                        // AniList API
                        synopsis = anime.description.replace(/<[^>]*>/g, '');
                    }
                    descriptionElement.textContent = synopsis;
                }

                // 设置类型
                const typeElement = document.getElementById('anime-type');
                if (typeElement) {
                    // 中文化类型显示
                    let type = anime.type || '未知';
                    const typeMap = {
                        // AniList 类型
                        'TV': 'TV动画',
                        'OVA': 'OVA',
                        'ONA': 'ONA',
                        'MOVIE': '剧场版',
                        'SPECIAL': '特别篇',
                        'MUSIC': '音乐',
                        // Jikan 类型
                        'Movie': '剧场版',
                        'Special': '特别篇'
                    };
                    typeElement.textContent = typeMap[type] || type;
                }

                // 设置集数
                const episodesElement = document.getElementById('anime-episodes');
                if (episodesElement) {
                    episodesElement.textContent = anime.episodes || '未知';
                }

                // 设置状态 - 中文化状态显示
                const statusElement = document.getElementById('anime-status');
                if (statusElement) {
                    let status = anime.status || '未知';
                    const statusMap = {
                        // AniList 状态
                        'FINISHED': '已完结',
                        'RELEASING': '连载中',
                        'NOT_YET_RELEASED': '未播出',
                        'CANCELLED': '已取消',
                        'HIATUS': '休止中',
                        // Jikan 状态
                        'Finished Airing': '已完结',
                        'Currently Airing': '连载中',
                        'Not yet aired': '未播出'
                    };
                    statusElement.textContent = statusMap[status] || status;
                }

                // 渲染评分图表
                // 根据API来源处理评分
                let score = null;
                if (anime.score) {
                    // Jikan API (10分制)
                    score = anime.score;
                } else if (anime.averageScore) {
                    // AniList API (100分制)
                    score = anime.averageScore / 10;
                }

                if (score) {
                    renderRatingChart(score);
                }

                // 设置详细信息 - 中文化显示
                // 根据API来源选择正确的日期字段
                let airedText = '未知';
                if (anime.aired?.string) {
                    // Jikan API
                    airedText = anime.aired.string;
                } else if (anime.startDate) {
                    // AniList API
                    airedText = anime.startDate ?
                        `${anime.startDate.year}-${String(anime.startDate.month).padStart(2, '0')}-${String(anime.startDate.day).padStart(2, '0')}` :
                        '未知';
                }
                document.getElementById('anime-aired').textContent = airedText;

                // 根据API来源选择正确的季/年字段
                let premiered = '未知';
                if (anime.season && anime.year) {
                    // AniList 和 Jikan API 都有
                    premiered = `${anime.season} ${anime.year}`;
                } else if (anime.season) {
                    // 只有季
                    premiered = anime.season;
                } else if (anime.year) {
                    // 只有年
                    premiered = anime.year;
                }
                document.getElementById('anime-premiered').textContent = premiered;

                // 根据API来源选择正确的制作公司字段
                let studiosText = '未知';
                if (anime.studios && Array.isArray(anime.studios)) {
                    if (anime.studios.length > 0 && typeof anime.studios[0] === 'object') {
                        // AniList API 格式
                        studiosText = anime.studios.map(s => s.name).join(', ');
                    } else if (anime.studios.length > 0 && typeof anime.studios[0] === 'string') {
                        // Jikan API 格式
                        studiosText = anime.studios.join(', ');
                    }
                }
                document.getElementById('anime-studios').textContent = studiosText;

                // 根据API来源选择正确的制作人员字段
                let producersText = '未知';
                if (anime.producers && Array.isArray(anime.producers)) {
                    if (anime.producers.length > 0 && typeof anime.producers[0] === 'object') {
                        // Jikan API 格式
                        producersText = anime.producers.map(p => p.name).join(', ');
                    } else if (anime.producers.length > 0 && typeof anime.producers[0] === 'string') {
                        // 可能的另一种格式
                        producersText = anime.producers.join(', ');
                    }
                } else if (anime.producers) {
                    // AniList API 不提供制作人员信息
                    producersText = '未知';
                }
                document.getElementById('anime-producers').textContent = producersText;

                // 中文化来源显示
                let source = anime.source || '未知';
                const sourceMapping = {
                    // AniList 来源
                    'ORIGINAL': '原创',
                    'MANGA': '漫画',
                    'LIGHT_NOVEL': '轻小说',
                    'VISUAL_NOVEL': '视觉小说',
                    'VIDEO_GAME': '游戏',
                    'OTHER': '其他',
                    // Jikan 来源
                    'Original': '原创',
                    'Manga': '漫画',
                    'Light novel': '轻小说',
                    'Visual novel': '视觉小说',
                    'Video game': '游戏',
                    'Other': '其他'
                };
                document.getElementById('anime-source').textContent = sourceMapping[source] || source;

                // 根据API来源选择正确的主题/类型字段
                let themesText = '未知';
                if (anime.themes && Array.isArray(anime.themes)) {
                    // Jikan API 格式
                    themesText = anime.themes.map(t => t.name || t).join(', ');
                } else if (anime.genres && Array.isArray(anime.genres)) {
                    // AniList API 格式
                    themesText = anime.genres.join(', ');
                }
                document.getElementById('anime-themes').textContent = themesText;

                document.getElementById('anime-demographics').textContent = '未知';
                document.getElementById('anime-duration').textContent = anime.duration ? `${anime.duration}分钟` : '未知';

                // 设置背景信息
                const backgroundElement = document.getElementById('anime-background');
                if (backgroundElement) {
                    let background = anime.background || '暂无背景信息';
                    // 如果是 AniList 数据，需要清理 HTML 标签
                    if (background && background.includes('<')) {
                        background = background.replace(/<[^>]*>/g, '');
                    }
                    backgroundElement.textContent = background;
                }

                // 渲染预告片
                renderTrailer(anime);

                resolve();
            } catch (error) {
                console.error('渲染动漫详情失败:', error);
                resolve();
            }
        });
    });
}

// 渲染剧集列表
async function renderEpisodes(episodes) {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            try {
                const episodeListElement = document.getElementById('episode-list');
                if (!episodeListElement) {
                    resolve();
                    return;
                }

                // 清空现有内容
                episodeListElement.innerHTML = '';

                if (!episodes || episodes.length === 0) {
                    episodeListElement.innerHTML = '<p>暂无剧集信息</p>';
                    resolve();
                    return;
                }

                // 使用文档片段优化DOM操作
                const fragment = document.createDocumentFragment();

                episodes.forEach(episode => {
                    const episodeElement = document.createElement('div');
                    episodeElement.className = 'episode-item';

                    // 根据数据来源选择正确的字段
                    let episodeNumber = 'N/A';
                    let episodeTitle = '无标题';
                    let episodeScore = 'N/A';
                    let episodeFiller = false;
                    let episodeRecap = false;
                    let episodeJapaneseTitle = '';
                    let episodeRomanjiTitle = '';

                    // Jikan API 格式
                    if (episode.hasOwnProperty('episode')) {
                        episodeNumber = episode.episode || 'N/A';
                        episodeTitle = episode.title || '无标题';
                        episodeScore = episode.score || 'N/A';
                        episodeFiller = episode.filler || false;
                        episodeRecap = episode.recap || false;
                        episodeJapaneseTitle = episode.title_japanese || '';
                        episodeRomanjiTitle = episode.title_romanji || '';
                    }
                    // AniList API 或其他格式
                    else {
                        episodeNumber = episode.number || episode.episode || 'N/A';
                        episodeTitle = episode.title || '无标题';
                        episodeScore = episode.score || 'N/A';
                        episodeFiller = episode.filler || false;
                        episodeRecap = episode.recap || false;
                        episodeJapaneseTitle = episode.title_japanese || '';
                        episodeRomanjiTitle = episode.title_romanji || '';
                    }

                    // 构建剧集信息HTML
                    let episodeInfoHtml = '';
                    if (episodeJapaneseTitle) {
                        episodeInfoHtml += `日文标题: ${episodeJapaneseTitle}<br>`;
                    }
                    if (episodeRomanjiTitle) {
                        episodeInfoHtml += `罗马音: ${episodeRomanjiTitle}<br>`;
                    }
                    if (episodeFiller) {
                        episodeInfoHtml += '填充集 ';
                    }
                    if (episodeRecap) {
                        episodeInfoHtml += '回顾集 ';
                    }

                    episodeElement.innerHTML = `
                        <div class="episode-header">
                            <h5>${episodeNumber}. ${episodeTitle}</h5>
                            <span class="episode-score">${episodeScore}</span>
                        </div>
                        ${episodeInfoHtml ? `<p class="episode-info">${episodeInfoHtml}</p>` : ''}
                    `;
                    fragment.appendChild(episodeElement);
                });

                episodeListElement.appendChild(fragment);
                resolve();
            } catch (error) {
                console.error('渲染剧集列表失败:', error);
                const episodeListElement = document.getElementById('episode-list');
                if (episodeListElement) {
                    episodeListElement.innerHTML = '<p>渲染剧集列表时出错</p>';
                }
                resolve();
            }
        });
    });
}

// 渲染评分图表
function renderRatingChart(score) {
    const ratingContainer = document.getElementById('rating-chart');
    if (!ratingContainer) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'rating-canvas';
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext('2d');
    const rating = score || 0;
    const percentage = (rating / 10) * 100; // 统一使用10分制显示

    // 绘制背景圆
    ctx.beginPath();
    ctx.arc(50, 50, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();

    // 绘制评分圆弧
    ctx.beginPath();
    ctx.arc(50, 50, 45, -0.5 * Math.PI, (percentage / 100) * 2 * Math.PI - 0.5 * Math.PI);
    ctx.strokeStyle = rating >= 7 ? '#4CAF50' : rating >= 5 ? '#FF9800' : '#F44336';
    ctx.lineWidth = 8;
    ctx.stroke();

    // 绘制评分文字
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rating.toFixed(1), 50, 50);

    ratingContainer.innerHTML = '';
    ratingContainer.appendChild(canvas);
}
// 设置跳转到B站的功能
function setupBilibiliRedirect(anime) {
    const bilibiliBtn = document.getElementById('bilibili-play-btn');
    if (!bilibiliBtn) return;

    // 显示按钮
    bilibiliBtn.style.display = 'inline-block';

    // 添加点击事件
    bilibiliBtn.addEventListener('click', () => {
        // 保存背景音乐状态
        CommonUtils.BackgroundMusicManager.savePlaybackState();

        // 使用更广泛的搜索关键词提高成功率
        const searchTerms = [
            anime.title,
            anime.title_english,
            anime.title_japanese,
            anime.name
        ].filter(term => term); // 过滤掉空值

        // 如果没有有效的搜索词，使用"动漫"作为默认关键词
        const searchQuery = searchTerms.length > 0
            ? encodeURIComponent(searchTerms.join(' '))
            : encodeURIComponent('动漫');

        const bilibiliSearchUrl = `https://search.bilibili.com/bangumi?keyword=${searchQuery}`;

        // 在新窗口打开B站搜索页面
        window.open(bilibiliSearchUrl, '_blank');
    });
}

// 渲染预告片区域
function renderTrailer(anime) {
    const trailerContainer = document.getElementById('trailer-container');
    if (!trailerContainer) return;

    // 清空容器内容
    trailerContainer.innerHTML = '';

    // 检查是否有预告片信息 (支持两种API格式)
    let trailerUrl = null;
    let trailerId = null;

    // Jikan API 格式
    if (anime.trailer_url) {
        trailerUrl = anime.trailer_url;
    }
    // AniList API 格式
    else if (anime.trailer && anime.trailer.site === 'youtube' && anime.trailer.id) {
        trailerId = anime.trailer.id;
    }

    if (trailerUrl) {
        // Jikan API 预告片处理
        const trailerElement = document.createElement('div');
        trailerElement.className = 'trailer-content';
        trailerElement.innerHTML = `
            <div class="trailer-actions d-flex flex-wrap gap-2">
                <a href="${trailerUrl}" 
                   target="_blank" 
                   class="btn btn-danger">
                    <i class="bi bi-play-btn"></i> 观看预告片
                </a>
                <button id="youtube-bilibili-btn" class="btn btn-primary">
                    <i class="bi bi-play-btn"></i> 在B站上观看
                </button>
            </div>
        `;

        trailerContainer.appendChild(trailerElement);

        // 添加B站跳转功能
        const bilibiliBtn = trailerElement.querySelector('#youtube-bilibili-btn');
        if (bilibiliBtn) {
            bilibiliBtn.addEventListener('click', () => {
                // 保存背景音乐状态
                CommonUtils.BackgroundMusicManager.savePlaybackState();

                // 使用更广泛的搜索关键词提高成功率
                const searchTerms = [
                    anime.title,
                    anime.title_english,
                    anime.title_japanese,
                    anime.name
                ].filter(term => term).slice(0, 2); // 只取前两个非空的搜索词

                const searchQuery = encodeURIComponent(searchTerms.join(' '));
                const bilibiliSearchUrl = `https://search.bilibili.com/bangumi?keyword=${searchQuery}`;
                window.open(bilibiliSearchUrl, '_blank');
            });
        }
    } else if (trailerId) {
        // AniList API 预告片处理
        const trailerElement = document.createElement('div');
        trailerElement.className = 'trailer-content';
        trailerElement.innerHTML = `
            <div class="video-container mb-3">
                <iframe 
                    src="https://www.youtube.com/embed/${trailerId}" 
                    title="${anime.title} 预告片" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="trailer-video">
                </iframe>
            </div>
            <div class="trailer-actions d-flex flex-wrap gap-2">
                <a href="https://www.youtube.com/watch?v=${trailerId}" 
                   target="_blank" 
                   class="btn btn-danger">
                    <i class="bi bi-youtube"></i> 在YouTube上观看
                </a>
                <button id="youtube-bilibili-btn" class="btn btn-primary">
                    <i class="bi bi-play-btn"></i> 在B站上观看
                </button>
            </div>
        `;

        trailerContainer.appendChild(trailerElement);

        // 添加B站跳转功能
        const bilibiliBtn = trailerElement.querySelector('#youtube-bilibili-btn');
        if (bilibiliBtn) {
            bilibiliBtn.addEventListener('click', () => {
                // 保存背景音乐状态
                CommonUtils.BackgroundMusicManager.savePlaybackState();

                // 使用更广泛的搜索关键词提高成功率
                const searchTerms = [
                    anime.title,
                    anime.title_english,
                    anime.title_japanese,
                    anime.name
                ].filter(term => term).slice(0, 2); // 只取前两个非空的搜索词

                const searchQuery = encodeURIComponent(searchTerms.join(' '));
                const bilibiliSearchUrl = `https://search.bilibili.com/bangumi?keyword=${searchQuery}`;
                window.open(bilibiliSearchUrl, '_blank');
            });
        }
    } else {
        // 尝试通过标题搜索预告片
        const trailerElement = document.createElement('div');
        trailerElement.className = 'trailer-content';
        trailerElement.innerHTML = `
            <div class="trailer-actions d-flex flex-wrap gap-2">
                <button id="search-trailer-btn" class="btn btn-info">
                    <i class="bi bi-search"></i> 搜索预告片
                </button>
                <button id="search-bilibili-btn" class="btn btn-primary">
                    <i class="bi bi-play-btn"></i> 在B站搜索
                </button>
            </div>
        `;

        trailerContainer.appendChild(trailerElement);

        // 添加搜索预告片功能
        const searchTrailerBtn = trailerElement.querySelector('#search-trailer-btn');
        if (searchTrailerBtn) {
            searchTrailerBtn.addEventListener('click', () => {
                // 保存背景音乐状态
                CommonUtils.BackgroundMusicManager.savePlaybackState();

                // 使用多个关键词搜索YouTube
                const searchTerms = [
                    anime.title,
                    anime.title_english,
                    anime.title_japanese
                ].filter(term => term);

                // 创建更有效的搜索查询
                const searchQuery = encodeURIComponent(searchTerms.join(' ') + ' anime trailer');
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                window.open(youtubeSearchUrl, '_blank');
            });
        }

        // 添加B站搜索功能
        const searchBilibiliBtn = trailerElement.querySelector('#search-bilibili-btn');
        if (searchBilibiliBtn) {
            searchBilibiliBtn.addEventListener('click', () => {
                // 保存背景音乐状态
                CommonUtils.BackgroundMusicManager.savePlaybackState();

                // 使用多个关键词搜索B站
                const searchTerms = [
                    anime.title,
                    anime.title_english,
                    anime.title_japanese
                ].filter(term => term);

                const searchQuery = encodeURIComponent(searchTerms.join(' '));
                const bilibiliSearchUrl = `https://search.bilibili.com/bangumi?keyword=${searchQuery}`;
                window.open(bilibiliSearchUrl, '_blank');
            });
        }
    }
}