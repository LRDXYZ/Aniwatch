// 首页交互逻辑
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const nav = document.querySelector('.nav');
    const hamburger = document.createElement('div');
    const animeGrid = document.querySelector('.anime-grid');
    const latestList = document.querySelector('.latest-list');

    // 创建汉堡菜单
    hamburger.className = 'hamburger';
    hamburger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    document.querySelector('.header .container').appendChild(hamburger);

    // 汉堡菜单点击事件
    hamburger.addEventListener('click', function () {
        DOMUtils.toggleClass(nav, 'active');
        DOMUtils.toggleClass(hamburger, 'active');
    });

    // 导航菜单点击事件 - 事件委托
    DOMUtils.delegateEvent(nav, 'a', 'click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');

        // 移除所有active类
        nav.querySelectorAll('a').forEach(link => {
            DOMUtils.removeClass(link, 'active');
        });

        // 添加当前active类
        DOMUtils.addClass(this, 'active');

        // 实际页面跳转（模拟）
        console.log('导航到:', href);
        // window.location.href = href;
    });

    // 渲染推荐动漫列表
    function renderAnimeList() {
        const animeGrid = document.getElementById('anime-grid');
        if (!animeGrid) return;

        animeGrid.innerHTML = '';

        mockData.anime.slice(0, 6).forEach(anime => {
            const animeCard = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 anime-card" onclick="showAnimeDetail(${anime.id})">
                    <img src="${anime.cover}" class="card-img-top" alt="${anime.title}" 
                         onerror="this.src='assets/images/poster/default.jpg'">
                    <div class="card-body">
                        <h5 class="card-title">${anime.title}</h5>
                        <p class="card-text text-muted">${anime.description.slice(0, 60)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${anime.type}</span>
                            <div class="rating">
                                <i class="bi bi-star-fill text-warning"></i>
                                <span>${anime.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <small class="text-muted">${anime.episodes}集 · ${anime.status}</small>
                    </div>
                </div>
            </div>
        `;

            animeGrid.innerHTML += animeCard;
        });
    }

    // 渲染最新更新列表
    function renderLatestList() {
        const latestList = document.getElementById('latest-list');
        if (!latestList) return;

        latestList.innerHTML = '';

        mockData.episodes.slice(0, 3).forEach(episode => {
            const anime = mockData.anime.find(a => a.id === episode.animeId);
            if (!anime) return;

            const latestItem = `
            <div class="col-md-4">
                <div class="card latest-item">
                    <div class="row g-0">
                        <div class="col-4">
                            <img src="${anime.cover}" class="img-fluid rounded-start h-100 object-fit-cover" 
                                 alt="${anime.title}" onerror="this.src='assets/images/poster/default.jpg'">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h6 class="card-title">${episode.title}</h6>
                                <p class="card-text">
                                    <small class="text-muted">
                                        ${CommonUtils.formatRelativeTime('2025-09-10 10:00:00')}
                                    </small>
                                </p>
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="playEpisode(${episode.id})">
                                    立即观看
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

            latestList.innerHTML += latestItem;
        });
    }

    // 显示动漫详情（模拟函数）
    function showAnimeDetail(animeId) {
        console.log('查看动漫详情:', animeId);
        // 实际跳转到详情页
        // window.location.href = `detail.html?id=${animeId}`;
    }

    // 初始化轮播图（简单实现）
    function initCarousel() {
        const banners = [
            { title: '热门新番推荐', subtitle: '最新上架的精彩动漫' },
            { title: '经典动漫回顾', subtitle: '重温那些年的感动' },
            { title: '独家动漫资源', subtitle: '只有在这里才能看到' }
        ];

        let currentBanner = 0;
        const bannerSection = document.querySelector('.banner');

        function changeBanner() {
            const banner = banners[currentBanner];
            bannerSection.querySelector('h2').textContent = banner.title;
            bannerSection.querySelector('p').textContent = banner.subtitle;

            currentBanner = (currentBanner + 1) % banners.length;
        }

        // 每5秒切换一次
        setInterval(changeBanner, 5000);
    }

    // 滚动监听 - 固定导航栏
    function initScrollListener() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        window.addEventListener('scroll', CommonUtils.throttle(function () {
            const currentScroll = window.scrollY;

            if (currentScroll > 100) {
                DOMUtils.addClass(header, 'scrolled');
            } else {
                DOMUtils.removeClass(header, 'scrolled');
            }

            lastScroll = currentScroll;
        }, 100));
    }

    // 在首页初始化函数中添加背景音乐
    function initBackgroundMusic() {
        // 创建音频元素
        const audioElement = DOMUtils.createElement('audio', {
            id: 'bg-music',
            loop: 'true',
            volume: '0.3'
        }, [
            DOMUtils.createElement('source', {
                src: 'assets/media/audio/background.mp3',
                type: 'audio/mp3'
            }),
            DOMUtils.createElement('source', {
                src: 'assets/media/audio/background.ogg',
                type: 'audio/ogg'
            })
        ]);

        document.body.appendChild(audioElement);

        // 添加音乐控制按钮
        const musicControl = DOMUtils.createElement('button', {
            className: 'music-control-btn',
            onclick: () => toggleBackgroundMusic()
        }, ['🎵']);

        document.body.appendChild(musicControl);

        // 尝试自动播放（需要用户交互）
        try {
            audioElement.play().then(() => {
                DOMUtils.addClass(musicControl, 'playing');
            }).catch(() => {
                // 自动播放被阻止，等待用户交互
                console.log('背景音乐等待用户交互后播放');
            });
        } catch (error) {
            console.error('背景音乐播放失败:', error);
        }
    }

    // 切换背景音乐
    function toggleBackgroundMusic() {
        const audioElement = document.getElementById('bg-music');
        const controlBtn = document.querySelector('.music-control-btn');

        if (audioElement.paused) {
            audioElement.play();
            DOMUtils.addClass(controlBtn, 'playing');
            controlBtn.textContent = '🎵';
        } else {
            audioElement.pause();
            DOMUtils.removeClass(controlBtn, 'playing');
            controlBtn.textContent = '🔇';
        }
    }
    // 初始化所有功能
    function init() {
        renderAnimeList();
        renderLatestList();
        initCarousel();
        initScrollListener();
        initBackgroundMusic();

        console.log('首页初始化完成');
    }

    // 执行初始化
    init();
});