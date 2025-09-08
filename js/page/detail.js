// 详情页交互逻辑
document.addEventListener('DOMContentLoaded', function () {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id') || 1; // 默认显示第一个动漫

    // 获取DOM元素
    const animeCover = document.getElementById('anime-cover');
    const animeTitle = document.getElementById('anime-title');
    const animeDescription = document.getElementById('anime-description');
    const animeType = document.getElementById('anime-type');
    const animeEpisodes = document.getElementById('anime-episodes');
    const animeStatus = document.getElementById('anime-status');
    const ratingChart = document.getElementById('rating-chart');
    const videoElement = document.querySelector('video');
    const episodeList = document.querySelector('.episode-list');
    const commentList = document.querySelector('.comment-list');
    const commentInput = document.getElementById('comment-input');
    const submitComment = document.getElementById('submit-comment');

    let currentAnime = null;

    // 初始化页面
    function init() {
        loadAnimeDetail(animeId);
        initVideoPlayer();
        initDrawingBoard();
        initCommentSystem();

        console.log('详情页初始化完成');
    }

    // 加载动漫详情
    function loadAnimeDetail(id) {
        currentAnime = mockData.anime.find(anime => anime.id === parseInt(id));

        if (!currentAnime) {
            // 如果没有找到，使用第一个动漫
            currentAnime = mockData.anime[0];
        }

        // 更新页面内容
        updateAnimeInfo(currentAnime);
        renderRatingChart(currentAnime.rating);
        renderEpisodes(currentAnime.id);
        renderComments(currentAnime.id);
    }

    // 更新动漫信息
    function updateAnimeInfo(anime) {
        animeCover.src = anime.cover;
        animeCover.alt = anime.title;
        animeTitle.textContent = anime.title;
        animeDescription.textContent = anime.description;
        animeType.textContent = anime.type;
        animeEpisodes.textContent = anime.episodes;
        animeStatus.textContent = anime.status;

        // 设置视频源（模拟）
        if (videoElement) {
            videoElement.innerHTML = `
                <source src="assets/media/video/trailer.mp4" type="video/mp4">
                <source src="assets/media/video/trailer.webm" type="video/webm">
                您的浏览器不支持视频播放。
            `;
            videoElement.load();
        }
    }

    // 渲染评分图表
    function renderRatingChart(rating) {
        if (!ratingChart) return;

        // 创建Canvas元素
        const canvas = DOMUtils.createElement('canvas', {
            width: '120',
            height: '120',
            className: 'rating-canvas'
        });

        DOMUtils.clearElement(ratingChart);
        ratingChart.appendChild(canvas);

        // 绘制评分图表
        drawRatingChart(canvas, rating);
    }

    // 绘制评分饼图
    function drawRatingChart(canvas, rating) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景圆
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();

        // 绘制评分弧
        const scorePercentage = rating / 10;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * scorePercentage);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();

        // 渐变色
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');

        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制文字
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rating.toFixed(1), centerX, centerY);

        // 绘制外环
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 渲染剧集列表
    function renderEpisodes(animeId) {
        if (!episodeList) return;

        DOMUtils.clearElement(episodeList);

        const episodes = mockData.episodes.filter(ep => ep.animeId === animeId);

        if (episodes.length === 0) {
            episodeList.appendChild(DOMUtils.createElement('p', {
                textContent: '暂无剧集数据'
            }));
            return;
        }

        episodes.forEach(episode => {
            const episodeItem = DOMUtils.createElement('div', {
                className: 'episode-item',
                onclick: () => playEpisode(episode)
            }, [
                DOMUtils.createElement('span', {
                    textContent: `第${episode.number}集`
                })
            ]);

            episodeList.appendChild(episodeItem);
        });
    }

    // 播放剧集
    function playEpisode(episode) {
        if (videoElement) {
            // 显示加载状态
            videoElement.innerHTML = `
                <source src="assets/media/video/episode-${episode.number}.mp4" type="video/mp4">
                <source src="assets/media/video/episode-${episode.number}.webm" type="video/webm">
                加载中...
            `;
            videoElement.load();
            videoElement.play().catch(console.error);
        }
    }

    // 初始化视频播放器
    function initVideoPlayer() {
        if (!videoElement) return;

        // 添加自定义控制栏
        addCustomVideoControls();

        // 视频事件监听
        videoElement.addEventListener('loadedmetadata', function () {
            updateVideoProgress();
        });

        videoElement.addEventListener('timeupdate', function () {
            updateVideoProgress();
        });

        videoElement.addEventListener('play', function () {
            updatePlayButton(true);
        });

        videoElement.addEventListener('pause', function () {
            updatePlayButton(false);
        });
    }

    // 添加自定义视频控制栏
    function addCustomVideoControls() {
        const controlsContainer = DOMUtils.createElement('div', {
            className: 'custom-video-controls'
        }, [
            DOMUtils.createElement('button', {
                className: 'play-pause-btn',
                onclick: () => togglePlayPause()
            }, ['▶']),

            DOMUtils.createElement('div', { className: 'progress-container' }, [
                DOMUtils.createElement('progress', {
                    className: 'video-progress',
                    value: '0',
                    max: '100'
                }),
                DOMUtils.createElement('input', {
                    type: 'range',
                    className: 'progress-slider',
                    value: '0',
                    max: '100'
                })
            ]),

            DOMUtils.createElement('div', { className: 'time-display' }, [
                DOMUtils.createElement('span', { className: 'current-time' }, ['00:00']),
                DOMUtils.createElement('span', { textContent: ' / ' }),
                DOMUtils.createElement('span', { className: 'duration' }, ['00:00'])
            ]),

            DOMUtils.createElement('button', {
                className: 'mute-btn',
                onclick: () => toggleMute()
            }, ['🔊']),

            DOMUtils.createElement('input', {
                type: 'range',
                className: 'volume-slider',
                value: '100',
                max: '100',
                oninput: (e) => setVolume(e.target.value / 100)
            }),

            DOMUtils.createElement('button', {
                className: 'fullscreen-btn',
                onclick: () => toggleFullscreen()
            }, ['⛶'])
        ]);

        videoElement.parentNode.appendChild(controlsContainer);
    }

    // 更新视频进度
    function updateVideoProgress() {
        const progress = document.querySelector('.video-progress');
        const slider = document.querySelector('.progress-slider');
        const currentTime = document.querySelector('.current-time');
        const duration = document.querySelector('.duration');

        if (videoElement.duration) {
            const percent = (videoElement.currentTime / videoElement.duration) * 100;
            progress.value = percent;
            slider.value = percent;

            currentTime.textContent = formatTime(videoElement.currentTime);
            duration.textContent = formatTime(videoElement.duration);
        }
    }

    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 切换播放/暂停
    function togglePlayPause() {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    // 更新播放按钮状态
    function updatePlayButton(isPlaying) {
        const button = document.querySelector('.play-pause-btn');
        button.textContent = isPlaying ? '⏸' : '▶';
    }

    // 切换静音
    function toggleMute() {
        videoElement.muted = !videoElement.muted;
        const button = document.querySelector('.mute-btn');
        button.textContent = videoElement.muted ? '🔇' : '🔊';
    }

    // 设置音量
    function setVolume(volume) {
        videoElement.volume = volume;
    }

    // 切换全屏
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            videoElement.parentNode.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    }

    // 初始化评论系统
    function initCommentSystem() {
        if (!submitComment || !commentInput) return;

        submitComment.addEventListener('click', function () {
            addComment();
        });

        commentInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addComment();
            }
        });
    }

    // 添加评论
    function addComment() {
        const content = commentInput.value.trim();

        if (!content) {
            alert('评论内容不能为空');
            return;
        }

        const newComment = {
            id: CommonUtils.generateId(),
            animeId: currentAnime.id,
            user: UserManager.getCurrentUser()?.username || '匿名用户',
            content: content,
            time: new Date().toISOString(),
            avatar: 'assets/images/avatar/default.png'
        };

        // 保存评论
        const comments = CommonUtils.getStorage('comments') || [];
        comments.push(newComment);
        CommonUtils.setStorage('comments', comments);

        // 清空输入框
        commentInput.value = '';

        // 重新渲染评论
        renderComments(currentAnime.id);
    }

    // 渲染评论
    function renderComments(animeId) {
        if (!commentList) return;

        DOMUtils.clearElement(commentList);

        const comments = CommonUtils.getStorage('comments') || [];
        const animeComments = comments.filter(comment => comment.animeId === animeId);

        if (animeComments.length === 0) {
            commentList.appendChild(DOMUtils.createElement('p', {
                className: 'no-comments',
                textContent: '暂无评论，快来发表第一条评论吧！'
            }));
            return;
        }

        animeComments.forEach(comment => {
            const commentItem = DOMUtils.createElement('div', {
                className: 'comment-item'
            }, [
                DOMUtils.createElement('div', { className: 'comment-header' }, [
                    DOMUtils.createElement('img', {
                        className: 'comment-avatar',
                        src: comment.avatar,
                        alt: comment.user,
                        onerror: "this.src='assets/images/avatar/default.png'"
                    }),
                    DOMUtils.createElement('div', { className: 'comment-info' }, [
                        DOMUtils.createElement('span', {
                            className: 'comment-author',
                            textContent: comment.user
                        }),
                        DOMUtils.createElement('span', {
                            className: 'comment-time',
                            textContent: CommonUtils.formatRelativeTime(comment.time)
                        })
                    ])
                ]),
                DOMUtils.createElement('div', {
                    className: 'comment-content',
                    textContent: comment.content
                })
            ]);

            commentList.appendChild(commentItem);
        });
    }

    // 初始化绘图板
    function initDrawingBoard() {
        // 在详情页添加绘图板区域
        const drawingSection = DOMUtils.createElement('section', {
            className: 'drawing-section'
        }, [
            DOMUtils.createElement('h3', { textContent: '趣味绘图板' }),
            DOMUtils.createElement('div', { className: 'drawing-container' }, [
                DOMUtils.createElement('canvas', {
                    id: 'drawing-board',
                    width: '600',
                    height: '400',
                    className: 'drawing-canvas'
                }),
                DOMUtils.createElement('div', { className: 'drawing-controls' }, [
                    DOMUtils.createElement('button', {
                        className: 'btn btn-secondary',
                        onclick: () => clearDrawingBoard()
                    }, ['清空画板']),
                    DOMUtils.createElement('button', {
                        className: 'btn btn-primary',
                        onclick: () => saveDrawing()
                    }, ['保存作品'])
                ])
            ])
        ]);

        // 插入到评论区之前
        const commentsSection = document.querySelector('.comments');
        if (commentsSection) {
            commentsSection.parentNode.insertBefore(drawingSection, commentsSection);
        }

        // 初始化绘图功能
        setupDrawingBoard();
    }

    // 设置绘图板
    function setupDrawingBoard() {
        const canvas = document.getElementById('drawing-board');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // 设置画布样式
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ff6b6b';

        // 鼠标事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // 触摸事件（移动端支持）
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }

        function draw(e) {
            if (!isDrawing) return;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            [lastX, lastY] = [e.offsetX, e.offsetY];
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function handleTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();

            isDrawing = true;
            [lastX, lastY] = [
                touch.clientX - rect.left,
                touch.clientY - rect.top
            ];
        }

        function handleTouchMove(e) {
            e.preventDefault();
            if (!isDrawing) return;

            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
            ctx.stroke();

            [lastX, lastY] = [
                touch.clientX - rect.left,
                touch.clientY - rect.top
            ];
        }
    }

    // 清空绘图板
    function clearDrawingBoard() {
        const canvas = document.getElementById('drawing-board');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 保存绘图作品
    function saveDrawing() {
        const canvas = document.getElementById('drawing-board');
        if (!canvas) return;

        try {
            const dataURL = canvas.toDataURL('image/png');
            const link = DOMUtils.createElement('a', {
                href: dataURL,
                download: `anime-drawing-${new Date().getTime()}.png`
            });

            link.click();
            alert('绘图作品已保存！');
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试');
        }
    }

    // 执行初始化
    init();
});