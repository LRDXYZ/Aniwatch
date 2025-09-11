// js/page/index.js - 整合清理后的版本（添加音乐播放功能并修复错误）
document.addEventListener('DOMContentLoaded', async function () {
    // 初始化变量
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;

    // 获取DOM元素
    const animeGrid = document.getElementById('anime-grid');
    const latestList = document.getElementById('latest-list'); // 添加最新更新区域元素
    const searchForm = document.querySelector('.navbar form');
    const searchInput = document.querySelector('.navbar input[type="search"]');
    const backToTopBtn = document.getElementById('back-to-top'); // 获取回到顶部按钮

    // 初始化背景音乐管理器
    CommonUtils.BackgroundMusicManager.init();

    // 更新用户认证状态显示
    CommonUtils.UserAuthManager.updateNavbarAuthStatus();

    // 等待API服务加载完成
    function waitForAPI(maxAttempts = 50) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function checkAPI() {
                if (window.AnimeAPI) {
                    resolve(window.AnimeAPI);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('API服务未初始化'));
                } else {
                    attempts++;
                    setTimeout(checkAPI, 100);
                }
            }

            checkAPI();
        });
    }

    if (window.AnimeAPI) {
        AnimeAPI.setProvider('anilist');
    }

    // 显示加载状态
    function showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'text-center py-4';
        loadingElement.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2 text-muted">正在加载动漫数据...</p>
        `;
        animeGrid.appendChild(loadingElement);
        isLoading = true;
    }

    // 隐藏加载状态
    function hideLoading() {
        const loadingElements = animeGrid.querySelectorAll('.text-center.py-4');
        loadingElements.forEach(el => el.remove());
        isLoading = false;
    }

    // 显示错误信息
    function showError(message) {
        animeGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <p class="mb-2">${message}</p>
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        重新加载
                    </button>
                </div>
            </div>
        `;
    }

    // 渲染推荐动漫列表
    async function renderAnimeList(page = 1, append = false) {
        if (isLoading) return;

        // 只在非第一页或追加时显示加载状态
        if (page > 1 || append) {
            showLoading();
        }

        if (!append) {
            currentPage = 1;
            if (animeGrid) animeGrid.innerHTML = '';
        }

        try {
            const response = await AnimeAPI.getAnimeList({
                page: page,
                perPage: 20
            });

            const { anime } = response;

            if (!anime || anime.length === 0) {
                if (page === 1) {
                    animeGrid.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="bi bi-inbox display-1 text-muted"></i>
                            <h4 class="mt-3 text-muted">暂无动漫数据</h4>
                            <p class="text-muted">请稍后重试</p>
                        </div>
                    `;
                }
                hasMore = false;
                return;
            }

            // 渲染动漫卡片
            anime.forEach(animeItem => {
                const animeCard = createAnimeCard(animeItem);
                if (animeGrid) animeGrid.appendChild(animeCard);
            });

        } catch (error) {
            console.error('加载动漫列表失败:', error);
            if (page === 1) {
                showError(`加载失败: ${error.message || '网络错误'}`);
            }
        } finally {
            hideLoading();
        }
    }

    // 渲染最新更新动漫列表
    async function renderLatestAnime() {
        try {
            // 获取最新的动漫（按ID倒序排列）
            const response = await AnimeAPI.getAnimeList({
                page: 1,
                perPage: 20,
                sort: "ID_DESC"
            });

            const { anime } = response;

            if (!anime || anime.length === 0) {
                latestList.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-inbox display-1 text-muted"></i>
                        <h4 class="mt-3 text-muted">暂无最新更新</h4>
                    </div>
                `;
                return;
            }

            // 渲染最新更新列表
            anime.forEach(animeItem => {
                const latestItem = createLatestItem(animeItem);
                if (latestList) latestList.appendChild(latestItem);
            });

        } catch (error) {
            console.error('加载最新动漫失败:', error);
            latestList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <p class="mb-2">加载最新更新失败: ${error.message || '未知错误'}</p>
                        <button class="btn btn-primary btn-sm" onclick="location.reload()">重新加载</button>
                    </div>
                </div>
            `;
        }
    }

    // 创建推荐动漫卡片
    function createAnimeCard(anime) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';

        // 使用较小的图片以提高加载速度
        const imageUrl = anime.images?.jpg?.image_url ||
            anime.images?.jpg?.large_image_url ||
            'assets/images/poster/default.jpg';

        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const episodes = anime.episodes || '?';
        const type = anime.type || '未知';

        col.innerHTML = `
            <div class="card h-100 anime-card shadow-sm" data-mal-id="${anime.mal_id}">
                <div class="card-image-container position-relative">
                    <img src="${imageUrl}" 
                         class="card-img-top" 
                         alt="${anime.title}"
                         loading="lazy"
                         onerror="this.src='assets/images/poster/default.jpg'">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-primary">${type}</span>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="card-title mb-2 text-truncate" title="${anime.title}">
                        ${anime.title}
                    </h6>
                    
                    <div class="anime-info mb-2">
                        <small class="text-muted">
                            <i class="bi bi-collection-play"></i> ${episodes}集
                            <span class="mx-1">•</span>
                            <i class="bi bi-star-fill text-warning"></i> ${score}
                        </small>
                    </div>
                    
                    <p class="card-text anime-description small text-muted line-clamp-2">
                        ${anime.synopsis ? anime.synopsis.substring(0, 80) + '...' : '暂无简介'}
                    </p>
                </div>
                
                <div class="card-footer bg-transparent border-0 pt-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            ${anime.year || '年份未知'}
                        </small>
                        <button class="btn btn-primary btn-sm view-detail-btn" 
                                onclick="viewAnimeDetail(${anime.mal_id})">
                            查看详情
                            <i class="bi bi-arrow-right ms-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加悬停效果
        const card = col.querySelector('.anime-card');
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });

        return col;
    }

    // 创建最新更新项
    function createLatestItem(anime) {
        const div = document.createElement('div');
        div.className = 'col-12 mb-3';

        // 使用较小的图片以提高加载速度
        const imageUrl = anime.images?.jpg?.image_url ||
            anime.images?.jpg?.large_image_url ||
            'assets/images/poster/default.jpg';

        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const episodes = anime.episodes || '?';

        div.innerHTML = `
            <div class="latest-item d-flex align-items-center gap-3 p-3 bg-white rounded shadow-sm" 
                 onclick="viewAnimeDetail(${anime.mal_id})" 
                 style="cursor: pointer;">
                <img src="${imageUrl}" 
                     alt="${anime.title}" 
                     class="rounded" 
                     style="width: 80px; height: 60px; object-fit: cover;"
                     onerror="this.src='assets/images/poster/default.jpg'">
                <div class="latest-item-content flex-grow-1">
                    <h6 class="mb-1 text-truncate">${anime.title}</h6>
                    <div class="d-flex flex-wrap align-items-center small text-muted">
                        <span class="me-2"><i class="bi bi-collection-play"></i> ${episodes}集</span>
                        <span class="me-2"><i class="bi bi-star-fill text-warning"></i> ${score}</span>
                        <span>${anime.year || '年份未知'}</span>
                    </div>
                </div>
                <div class="text-primary">
                    <i class="bi bi-chevron-right"></i>
                </div>
            </div>
        `;

        return div;
    }

    // 查看动漫详情
    window.viewAnimeDetail = async function (malId) {
        // 保存背景音乐状态
        CommonUtils.BackgroundMusicManager.savePlaybackState();
        window.location.href = `detail.html?mal_id=${malId}`;
    };

    // 执行搜索的函数
    async function performSearch(query) {
        if (!animeGrid || isLoading) return;

        showLoading();

        try {
            // 使用 AnimeAPI 搜索动漫
            const response = await AnimeAPI.searchAnime(query, {
                page: 1,
                perPage: 20
            });

            const { anime } = response;

            // 清空当前内容
            animeGrid.innerHTML = '';

            if (!anime || anime.length === 0) {
                animeGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search display-1 text-muted"></i>
                        <h4 class="mt-3 text-muted">未找到与 "${query}" 相关的动漫</h4>
                        <p class="text-muted">请尝试其他关键词</p>
                    </div>
                `;
                document.title = `搜索: ${query} - AniWatch`;
                return;
            }

            // 渲染搜索结果
            anime.forEach(animeItem => {
                const animeCard = createAnimeCard(animeItem);
                animeGrid.appendChild(animeCard);
            });

            // 更新页面标题
            document.title = `搜索: ${query} - AniWatch`;

        } catch (error) {
            console.error('搜索失败:', error);
            animeGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <p class="mb-2">搜索失败: ${error.message || '未知错误'}</p>
                        <button class="btn btn-primary btn-sm" onclick="location.reload()">重新加载</button>
                    </div>
                </div>
            `;
        } finally {
            hideLoading();
        }
    }

    // 音乐播放控制功能
    function initMusicPlayer() {
        const musicControl = document.getElementById('music-control');
        const backgroundMusic = CommonUtils.BackgroundMusicManager.getAudioElement();

        if (!musicControl || !backgroundMusic) {
            console.warn('音乐播放器元素未找到');
            return;
        }

        // 页面加载时尝试自动播放
        window.addEventListener('load', function () {
            // 在移动端可能需要用户交互才能播放
            backgroundMusic.volume = 0.3; // 设置音量为30%
        });

        // 控制按钮点击事件
        musicControl.addEventListener('click', function () {
            CommonUtils.BackgroundMusicManager.toggle();

            // 更新按钮状态
            if (CommonUtils.BackgroundMusicManager.isPlaying) {
                musicControl.classList.add('playing');
                musicControl.classList.remove('paused');
                musicControl.innerHTML = '<i class="bi bi-pause"></i>';
            } else {
                musicControl.classList.add('paused');
                musicControl.classList.remove('playing');
                musicControl.innerHTML = '<i class="bi bi-play"></i>';
            }
        });

        // 监听音乐播放状态
        backgroundMusic.addEventListener('play', function () {
            musicControl.classList.add('playing');
            musicControl.classList.remove('paused');
            musicControl.innerHTML = '<i class="bi bi-pause"></i>';
        });

        backgroundMusic.addEventListener('pause', function () {
            musicControl.classList.add('paused');
            musicControl.classList.remove('playing');
            musicControl.innerHTML = '<i class="bi bi-play"></i>';
        });

        // 页面可见性变化时的处理
        document.addEventListener('visibilitychange', function () {
            if (document.hidden && CommonUtils.BackgroundMusicManager.isPlaying) {
                CommonUtils.BackgroundMusicManager.savePlaybackState();
            }
        });
    }

    // 回到顶部功能
    function initBackToTop() {
        if (!backToTopBtn) {
            console.warn('回到顶部按钮未找到');
            return;
        }

        // 初始隐藏按钮
        backToTopBtn.style.display = 'none';

        // 监听滚动事件
        window.addEventListener('scroll', function () {
            // 当滚动超过300px时显示按钮
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        // 点击按钮回到顶部
        backToTopBtn.addEventListener('click', function () {
            // 平滑滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // 隐藏按钮
            backToTopBtn.style.display = 'none';
        });
    }

    // 初始化事件监听
    function initEventListeners() {
        // 搜索表单
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = searchInput.value.trim();

                if (query) {
                    performSearch(query);
                }
            });
        }

        // 实时搜索功能（防抖）- 修复this指向问题
        if (searchInput) {
            searchInput.addEventListener('input', CommonUtils.debounce(function (e) {
                // 修复：使用事件对象获取目标元素的值，而不是this
                const query = e.target.value.trim();

                // 如果搜索框为空，显示默认内容
                if (query.length === 0) {
                    renderAnimeList(1, false);
                    document.title = 'AniWatch - 动漫观看网站';
                    return;
                }

                // 执行实时搜索
                performSearch(query);
            }, 300)); // 300ms 防抖延迟
        }

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            // ESC键清除搜索
            if (e.key === 'Escape' && searchInput) {
                searchInput.value = '';
                renderAnimeList(1, false);
                document.title = 'AniWatch - 动漫观看网站';
            }
            // Enter键在搜索框外触发搜索
            if (e.key === 'Enter' && e.target !== searchInput && !e.target.closest('form')) {
                searchInput?.focus();
            }
        });
    }

    // 初始化页面
    async function init() {
        try {
            // 等待API服务加载完成
            await waitForAPI();

            // 检查API服务是否可用
            if (!window.AnimeAPI) {
                throw new Error('API服务未初始化');
            }

            // 设置使用AniList API
            AnimeAPI.setProvider('anilist');

            // 初始化事件监听
            initEventListeners();

            // 初始化音乐播放器
            initMusicPlayer();

            // 初始化回到顶部功能
            initBackToTop();

            // 渲染推荐动漫列表
            await renderAnimeList(1, false);

            // 渲染最新更新动漫列表
            await renderLatestAnime();

        } catch (error) {
            console.error('页面初始化失败:', error);
            showError('页面初始化失败，请刷新页面重试');
        }
    }

    // 启动初始化
    init();
});