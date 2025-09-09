// js/page/detail.js
// 等待所有资源加载完成后再执行
window.addEventListener('DOMContentLoaded', async function () {
    // 检查必要的API是否已加载
    if (typeof window.AnimeAPI === 'undefined') {
        console.error('AnimeAPI 未定义，请检查脚本加载顺序');
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
        // 使用AniList API获取数据
        AnimeAPI.setProvider('anilist');
        const animeDetail = await AnimeAPI.getAnimeDetail(animeId);
        const episodes = await AnimeAPI.getEpisodes(animeId);

        renderAnimeDetail(animeDetail);
        renderEpisodes(episodes);

        // 添加B站跳转按钮事件
        setupBilibiliRedirect(animeDetail);
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
function renderAnimeDetail(anime) {
    if (!anime) return;

    // 设置页面标题
    document.title = `${anime.title} - AniWatch`;

    // 设置封面图片
    const imageUrl = anime.images?.jpg?.large_image_url ||
        anime.images?.jpg?.image_url ||
        'assets/images/poster/default.jpg';
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

    // 设置描述 - 优化中文显示
    const descriptionElement = document.getElementById('anime-description');
    if (descriptionElement) {
        // 如果有中文简介，使用中文简介，否则使用原始简介
        const synopsis = anime.synopsis || anime.description || '暂无简介';
        descriptionElement.textContent = synopsis;
    }

    // 设置类型
    const typeElement = document.getElementById('anime-type');
    if (typeElement) {
        // 中文化类型显示
        const typeMap = {
            'TV': 'TV动画',
            'OVA': 'OVA',
            'ONA': 'ONA',
            'MOVIE': '剧场版',
            'SPECIAL': '特别篇',
            'MUSIC': '音乐'
        };
        typeElement.textContent = typeMap[anime.type] || anime.type || '未知';
    }

    // 设置集数
    const episodesElement = document.getElementById('anime-episodes');
    if (episodesElement) {
        episodesElement.textContent = anime.episodes || '未知';
    }

    // 设置状态 - 中文化状态显示
    const statusElement = document.getElementById('anime-status');
    if (statusElement) {
        const statusMap = {
            'FINISHED': '已完结',
            'RELEASING': '连载中',
            'NOT_YET_RELEASED': '未播出',
            'CANCELLED': '已取消',
            'HIATUS': '休止中'
        };
        statusElement.textContent = statusMap[anime.status] || anime.status || '未知';
    }

    // 渲染评分图表
    if (anime.score) {
        renderRatingChart(anime.score);
    }

    // 设置详细信息 - 中文化显示
    const airedText = anime.startDate ?
        `${anime.startDate.year}-${String(anime.startDate.month).padStart(2, '0')}-${String(anime.startDate.day).padStart(2, '0')}` :
        '未知';
    document.getElementById('anime-aired').textContent = airedText;

    document.getElementById('anime-premiered').textContent = anime.season ? `${anime.season} ${anime.year}` : '未知';
    document.getElementById('anime-studios').textContent = anime.studios?.map(s => s.name).join(', ') || '未知';
    document.getElementById('anime-producers').textContent = '未知'; // AniList API不提供制作人员信息

    // 中文化来源显示
    const sourceMapping = {
        'ORIGINAL': '原创',
        'MANGA': '漫画',
        'LIGHT_NOVEL': '轻小说',
        'VISUAL_NOVEL': '视觉小说',
        'VIDEO_GAME': '游戏',
        'OTHER': '其他'
    };
    document.getElementById('anime-source').textContent = sourceMapping[anime.source] || anime.source || '未知';

    document.getElementById('anime-themes').textContent = anime.genres?.join(', ') || '未知';
    document.getElementById('anime-demographics').textContent = '未知'; // AniList API不提供人口统计数据
    document.getElementById('anime-duration').textContent = anime.duration ? `${anime.duration}分钟` : '未知';

    // 设置背景信息
    const backgroundElement = document.getElementById('anime-background');
    if (backgroundElement) {
        backgroundElement.textContent = anime.background || '暂无背景信息';
    }
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
    const percentage = (rating / 10) * 100;

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
        // 构造B站搜索URL
        const searchQuery = encodeURIComponent(anime.title || anime.title_english || anime.title_japanese);
        const bilibiliSearchUrl = `https://search.bilibili.com/bangumi?keyword=${searchQuery}`;

        // 在新窗口打开B站搜索页面
        window.open(bilibiliSearchUrl, '_blank');
    });
}

// 渲染剧集列表
function renderEpisodes(episodes) {
    const episodeListElement = document.getElementById('episode-list');
    if (!episodeListElement) return;

    // 清空现有内容
    episodeListElement.innerHTML = '';

    if (!episodes || episodes.length === 0) {
        episodeListElement.innerHTML = '<p>暂无剧集信息</p>';
        return;
    }

    episodes.forEach(episode => {
        const episodeElement = document.createElement('div');
        episodeElement.className = 'episode-item';
        episodeElement.innerHTML = `
            <div class="episode-header">
                <h5>${episode.episode}. ${episode.title}</h5>
                <span class="episode-score">${episode.score || 'N/A'}</span>
            </div>
            <p class="episode-info">
                ${episode.title_japanese ? `日文标题: ${episode.title_japanese}<br>` : ''}
                ${episode.title_romanji ? `罗马音: ${episode.title_romanji}<br>` : ''}
                ${episode.filler ? '填充集' : ''}
                ${episode.recap ? '回顾集' : ''}
            </p>
        `;
        episodeListElement.appendChild(episodeElement);
    });
}