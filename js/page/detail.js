// 等待所有资源加载完成后再执行
window.addEventListener('DOMContentLoaded', async function() {
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
    const malId = urlParams.get('mal_id');

    if (!malId) {
        alert('无效的动漫ID');
        window.location.href = 'index.html';
        return;
    }

    try {
        const animeDetail = await AnimeAPI.getAnimeDetail(malId);
        const episodes = await AnimeAPI.getEpisodes(malId);
        
        // 添加获取视频信息（如果API支持）
        let videos = [];
        try {
            videos = await getAnimeVideos(malId);
        } catch (e) {
            console.warn('无法获取视频信息:', e);
        }

        renderAnimeDetail(animeDetail);
        renderEpisodes(episodes, videos);
        renderCharacters(animeDetail);
        setupVideoPlayer();
        
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

// 获取动漫视频信息的函数（扩展API服务）
async function getAnimeVideos(malId) {
    // 注意：Jikan API v4 不提供视频流链接
    // 这里是示例代码，实际项目中需要根据可用的视频源API进行调整
    
    // 如果你有自己的视频源API，可以在这里实现
    // 示例返回格式：
    return [
        {
            episode: 1,
            title: "第1集",
            video_url: "https://example.com/video/episode1.mp4"
        },
        {
            episode: 2,
            title: "第2集",
            video_url: "https://example.com/video/episode2.mp4"
        }
    ];
}

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

    // 设置描述
    const descriptionElement = document.getElementById('anime-description');
    if (descriptionElement) {
        descriptionElement.textContent = anime.synopsis || '暂无简介';
    }

    // 设置类型
    const typeElement = document.getElementById('anime-type');
    if (typeElement) {
        typeElement.textContent = anime.type || '未知';
    }

    // 设置集数
    const episodesElement = document.getElementById('anime-episodes');
    if (episodesElement) {
        episodesElement.textContent = anime.episodes || '未知';
    }

    // 设置状态
    const statusElement = document.getElementById('anime-status');
    if (statusElement) {
        const statusMap = {
            'Finished Airing': '已完结',
            'Currently Airing': '连载中',
            'Not yet aired': '未播出'
        };
        statusElement.textContent = statusMap[anime.status] || anime.status || '未知';
    }

    // 渲染评分图表
    if (anime.score) {
        renderRatingChart(anime.score);
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

// 渲染剧集列表（修改版，支持视频链接）
function renderEpisodes(episodes, videos = []) {
    const episodeList = document.getElementById('episode-list');
    if (!episodeList) return;

    episodeList.innerHTML = '';

    if (!episodes || episodes.length === 0) {
        episodeList.innerHTML = '<p class="text-muted">暂无剧集信息</p>';
        return;
    }

    episodes.forEach(episode => {
        // 查找对应的视频链接
        const videoInfo = videos.find(v => v.episode == episode.episode);
        
        const episodeItem = document.createElement('div');
        episodeItem.className = 'episode-item';
        episodeItem.innerHTML = `
            <h5>${episode.title || `第${episode.episode}集`}</h5>
            <p class="text-muted small">${episode.title_japanese || ''}</p>
            ${episode.score ? `<span class="badge bg-primary">评分: ${episode.score}</span>` : ''}
            ${episode.filler ? `<span class="badge bg-warning">填充集</span>` : ''}
            ${episode.recap ? `<span class="badge bg-info">回顾集</span>` : ''}
            ${videoInfo ? `<span class="badge bg-success">可播放</span>` : `<span class="badge bg-secondary">暂无视频</span>`}
        `;
        
        // 添加点击事件播放剧集
        if (videoInfo) {
            episodeItem.addEventListener('click', () => {
                playEpisode(episode, videoInfo.video_url);
            });
        } else {
            episodeItem.addEventListener('click', () => {
                playEpisode(episode);
            });
        }
        
        episodeList.appendChild(episodeItem);
    });
}

// 播放剧集（修改版，支持真实视频链接）
function playEpisode(episode, videoUrl = null) {
    const video = document.getElementById('anime-video');
    if (!video) {
        alert('视频播放器未找到');
        return;
    }
    
    if (videoUrl) {
        // 使用真实的视频链接
        video.src = videoUrl;
        video.load();
        
        // 滚动到视频播放区域
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 显示提示信息
        alert(`正在播放: ${episode.title || `第${episode.episode}集`}`);
    } else {
        // 模拟视频源（实际项目中应从API获取真实视频链接）
        const videoSources = [
            'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
            'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
            'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4'
        ];
        
        // 随机选择一个视频源
        const randomSource = videoSources[Math.floor(Math.random() * videoSources.length)];
        
        // 设置视频源
        video.src = randomSource;
        video.load();
        
        // 滚动到视频播放区域
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 显示提示信息
        alert(`正在播放: ${episode.title || `第${episode.episode}集`}\n\n注意：这是一个示例视频。在实际应用中，这里会播放真实的动漫剧集。`);
    }
}

// 设置视频播放器控件
function setupVideoPlayer() {
    const video = document.getElementById('anime-video');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const progressSlider = document.getElementById('progress-slider');
    const timeDisplay = document.getElementById('time-display');
    const volumeSlider = document.getElementById('volume-slider');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // 检查所有元素是否存在
    if (!video || !playPauseBtn || !muteBtn || !progressSlider || 
        !timeDisplay || !volumeSlider || !fullscreenBtn) {
        console.warn('视频播放器控件不完整');
        return;
    }
    
    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
    });
    
    // 静音按钮
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? 
            '<i class="bi bi-volume-mute"></i>' : 
            '<i class="bi bi-volume-up"></i>';
    });
    
    // 进度条更新
    video.addEventListener('timeupdate', () => {
        // 确保视频时长有效后再更新进度条
        if (isFinite(video.duration) && video.duration > 0) {
            const progress = (video.currentTime / video.duration) * 100;
            progressSlider.value = isNaN(progress) ? 0 : progress;
        }
        
        // 更新时间显示
        const currentMinutes = Math.floor(video.currentTime / 60);
        const currentSeconds = Math.floor(video.currentTime % 60);
        const durationMinutes = Math.floor(video.duration / 60);
        const durationSeconds = Math.floor(video.duration % 60);
        
        // 格式化时间显示，处理无效值
        const formatTime = (minutes, seconds) => {
            if (!isFinite(minutes) || !isFinite(seconds)) return '0:00';
            return `${isNaN(minutes) ? 0 : minutes}:${(isNaN(seconds) || seconds < 10) ? '0' + (isNaN(seconds) ? 0 : seconds) : (isNaN(seconds) ? 0 : seconds)}`;
        };
        
        timeDisplay.textContent = `${formatTime(currentMinutes, currentSeconds)} / ${formatTime(durationMinutes, durationSeconds)}`;
    });
    
    // 进度条拖拽 - 修复版本
    progressSlider.addEventListener('input', () => {
        // 确保视频时长有效
        if (isFinite(video.duration) && video.duration > 0) {
            const percent = progressSlider.value / 100;
            const time = percent * video.duration;
            
            // 确保计算出的时间是有效数值
            if (isFinite(time)) {
                video.currentTime = time;
            }
        }
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        
        // 确保音量值有效
        if (isFinite(volume)) {
            video.volume = volume;
            video.muted = volume === 0;
            muteBtn.innerHTML = video.muted ? 
                '<i class="bi bi-volume-mute"></i>' : 
                '<i class="bi bi-volume-up"></i>';
        }
    });
    
    // 全屏按钮
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                console.error(`全屏请求失败: ${err}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    // 视频播放结束时重置播放按钮
    video.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    });
    
    // 初始化进度条值
    progressSlider.value = 0;
    volumeSlider.value = 100;
}

// 渲染角色信息（占位函数）
function renderCharacters(anime) {
    // 在实际项目中，这里会渲染动漫角色信息
    console.log('渲染角色信息:', anime);
}