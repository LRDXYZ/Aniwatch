// js/page/index.js - 完整代码
document.addEventListener('DOMContentLoaded', async function () {
    // 初始化变量
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;

    // 获取DOM元素
    const animeGrid = document.getElementById('anime-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const searchForm = document.querySelector('.navbar form');
    const searchInput = document.querySelector('.navbar input[type="search"]');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const backToTopBtn = document.getElementById('back-to-top');

    // 显示加载状态
    function showLoading() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
            loadingIndicator.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">加载中...</span>
                    </div>
                    <p class="mt-2 text-muted">正在加载动漫数据...</p>
                </div>
            `;
        }
        isLoading = true;
    }

    // 隐藏加载状态
    function hideLoading() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        isLoading = false;
    }

    // 显示错误信息
    function showError(message) {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
            loadingIndicator.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <p class="mb-2">${message}</p>
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        重新加载
                    </button>
                </div>
            `;
        }
    }

    // 渲染动漫列表
    async function renderAnimeList(page = 1, append = false) {
        if (isLoading) return;

        showLoading();

        if (!append) {
            currentPage = 1;
            if (animeGrid) animeGrid.innerHTML = '';
        }

        try {
            const params = {
                page: page,
                limit: 24,
                order_by: getSortValue(),
                ...getActiveFilters()
            };

            const response = await AnimeAPI.getAnimeList(params);
            const { anime, pagination } = response;

            if (!anime || anime.length === 0) {
                if (page === 1) {
                    animeGrid.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="bi bi-inbox display-1 text-muted"></i>
                            <h4 class="mt-3 text-muted">暂无动漫数据</h4>
                            <p class="text-muted">尝试调整搜索条件或筛选条件</p>
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

            // 更新分页状态
            if (pagination && pagination.has_next_page) {
                hasMore = true;
                currentPage = page;
                if (loadMoreBtn) loadMoreBtn.style.display = 'block';
            } else {
                hasMore = false;
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }

            // 更新页面标题
            updatePageTitle(params);

        } catch (error) {
            console.error('加载动漫列表失败:', error);
            if (page === 1) {
                showError(`加载失败: ${error.message || '网络错误'}`);
            } else {
                showToast('加载更多失败，请重试', 'error');
            }
        } finally {
            hideLoading();
        }
    }

    // 创建动漫卡片
    function createAnimeCard(anime) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';

        const imageUrl = anime.images?.jpg?.large_image_url ||
            anime.images?.jpg?.image_url ||
            'assets/images/poster/default.jpg';

        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const episodes = anime.episodes || '?';
        const status = getStatusText(anime.status);
        const type = anime.type || '未知';

        col.innerHTML = `
            <div class="card h-100 anime-card shadow-sm" data-mal-id="${anime.mal_id}">
                <div class="card-image-container position-relative">
                    <img src="${imageUrl}" 
                         class="card-img-top" 
                         alt="${anime.title}"
                         loading="lazy"
                         onerror="this.src='assets/images/poster/default.jpg'">
                    <div class="card-overlay position-absolute top-0 start-0 w-100 h-100">
                        <div class="overlay-content position-absolute bottom-0 start-0 w-100 p-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-primary">${type}</span>
                                <span class="badge bg-${getStatusBadgeClass(anime.status)}">${status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute top-0 end-0 m-2">
                        <button class="btn btn-sm btn-light favorite-btn" 
                                onclick="event.stopPropagation(); toggleFavorite(${anime.mal_id}, this)">
                            <i class="bi bi-heart"></i>
                        </button>
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
                    
                    <div class="anime-genres mb-2">
                        ${renderGenres(anime.genres)}
                    </div>
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

        // 预加载图片
        preloadImage(imageUrl);

        return col;
    }

    // 渲染分类标签
    function renderGenres(genres) {
        if (!genres || genres.length === 0) return '';

        return genres.slice(0, 3).map(genre => `
            <span class="badge bg-secondary me-1 mb-1 small">${genre.name}</span>
        `).join('');
    }

    // 获取状态文本
    function getStatusText(status) {
        const statusMap = {
            'currently_airing': '连载中',
            'finished_airing': '已完结',
            'not_yet_aired': '未播出',
            'upcoming': '即将播出'
        };
        return statusMap[status] || status || '未知';
    }

    // 获取状态徽章类
    function getStatusBadgeClass(status) {
        const classMap = {
            'currently_airing': 'success',
            'finished_airing': 'primary',
            'not_yet_aired': 'warning',
            'upcoming': 'info'
        };
        return classMap[status] || 'secondary';
    }

    // 获取排序值
    function getSortValue() {
        return sortSelect ? sortSelect.value : 'popularity';
    }

    // 获取激活的筛选条件
    function getActiveFilters() {
        const filters = {};
        const activeFilter = document.querySelector('.filter-btn.active');

        if (activeFilter) {
            const filterType = activeFilter.dataset.filter;
            const filterValue = activeFilter.dataset.value;

            if (filterType && filterValue) {
                filters[filterType] = filterValue;
            }
        }

        return filters;
    }

    // 更新页面标题
    function updatePageTitle(params) {
        let title = 'AniWatch - 动漫观看网站';

        if (params.q) {
            title = `搜索: ${params.q} - ${title}`;
        } else if (params.type) {
            title = `${params.type}动漫 - ${title}`;
        } else if (params.status) {
            title = `${getStatusText(params.status)}动漫 - ${title}`;
        }

        document.title = title;
    }

    // 预加载图片
    function preloadImage(url) {
        if (!url || url === 'assets/images/poster/default.jpg') return;

        const img = new Image();
        img.src = url;
    }

    // 显示Toast通知
    function showToast(message, type = 'info') {
        // 移除现有的toast
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        document.body.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // 自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // 获取Toast图标
    function getToastIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || 'bi-info-circle-fill';
    }

    //    检查用户登录状态
    async function isUserLoggedIn() {
        try {
            const resp = await CommonUtils.apiFetch('/api/auth/session', { method: 'GET' });
            return resp.ok;
        } catch (e) {
            return false;
        }
    }

    // 查看动漫详情
    window.viewAnimeDetail = async function (malId) {
        try {
            showToast('正在加载动漫详情...', 'info');

            // 存储ID到sessionStorage
            sessionStorage.setItem('currentAnimeId', malId);
            window.location.href = `detail.html?mal_id=${malId}`;

        } catch (error) {
            console.error('跳转失败:', error);
            showToast('跳转失败，请重试', 'error');
        }
    };

    // 切换收藏
    window.toggleFavorite = async function (malId, button) {
        if (!(await isUserLoggedIn())) {
            showToast('请先登录以收藏动漫', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        try {
            const isFavorite = button.classList.contains('active');
            const endpoint = isFavorite ?
                `/api/user/favorites/${malId}` :
                '/api/user/favorites';
            const method = isFavorite ? 'DELETE' : 'POST';

            const response = await CommonUtils.apiFetch(endpoint, {
                method: method,
                ...animeGrid(isFavorite ? {} : { body: JSON.stringify({ mal_id: malid }) })
            });

            if (response.ok) {
                button.classList.toggle('active');
                button.classList.toggle('btn-light');
                button.classList.toggle('btn-danger');

                const icon = button.querySelector('i');
                icon.classList.toggle('bi-heart');
                icon.classList.toggle('bi-heart-fill');

                showToast(
                    isFavorite ? '已取消收藏' : '已添加到收藏',
                    isFavorite ? 'info' : 'success'
                );
            } else {
                if (response.status === 401) {
                    showToast('会话已过期，请重新登录', 'warning');
                    setTimeout(() => window.location.href = 'login.html', 1200);
                    return;
                }
                throw new Error('操作失败');
            }
        } catch (error) {
            console.error('收藏操作失败:', error);
            showToast('操作失败，请重试', 'error');
        }
    };

    // 加载更多
    window.loadMore = async function () {
        if (isLoading || !hasMore) return;

        await renderAnimeList(currentPage + 1, true);
    };

    // 回到顶部
    window.scrollToTop = function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // 初始化事件监听
    function initEventListeners() {
        // 搜索表单
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = searchInput.value.trim();

                if (query) {
                    sessionStorage.setItem('searchQuery', query);
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            });
        }

        // 筛选按钮
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // 移除其他active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 添加active类到当前按钮
                this.classList.add('active');
                // 重新加载列表
                renderAnimeList(1, false);
            });
        });

        // 排序选择
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                renderAnimeList(1, false);
            });
        }

        // 加载更多按钮
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMore);
        }

        // 回到顶部按钮
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', scrollToTop);

            // 滚动显示/隐藏回到顶部按钮
            window.addEventListener('scroll', function () {
                if (window.scrollY > 300) {
                    backToTopBtn.style.display = 'block';
                } else {
                    backToTopBtn.style.display = 'none';
                }
            });
        }

        // 无限滚动
        window.addEventListener('scroll', function () {
            if (isLoading || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            // ESC键清除搜索
            if (e.key === 'Escape' && searchInput) {
                searchInput.value = '';
            }
            // Enter键在搜索框外触发搜索
            if (e.key === 'Enter' && e.target !== searchInput && !e.target.closest('form')) {
                searchInput?.focus();
            }
        });
    }

    // 初始化用户界面
    function initUI() {
        // 初始化收藏按钮状态
        updateFavoriteButtons();

        // 初始化滚动位置
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition));
            sessionStorage.removeItem('scrollPosition');
        }

        // 保存滚动位置 beforeunload
        window.addEventListener('beforeunload', function () {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        });
    }

    // 更新收藏按钮状态
    async function updateFavoriteButtons() {
        if (!(await isUserLoggedIn())) return;

        try {
            const response = await CommonUtil.apiFetch('/api/user/favorites', { method: 'GET' });

            if (response.ok) {
                const favorites = await response.json();
                const favoriteIds = favorites.map(fav => fav.mal_id);

                // 更新收藏按钮状态
                document.querySelectorAll('.favorite-btn').forEach(button => {
                    const card = button.closest('.anime-card');
                    const malId = parseInt(card.dataset.malId);

                    if (favoriteIds.includes(malId)) {
                        button.classList.add('active', 'btn-danger');
                        button.classList.remove('btn-light');
                        const icon = button.querySelector('i');
                        icon.classList.add('bi-heart-fill');
                        icon.classList.remove('bi-heart');
                    }
                });
            } else if (response.status === 401) {
                // 未登录状态，跳过
                return;
            }
        } catch (error) {
            console.error('获取收藏列表失败:', error);
        }
    }

    // 初始化页面
    async function init() {
        try {
            // 检查API服务是否可用
            if (!window.AnimeAPI) {
                throw new Error('API服务未初始化');
            }

            // 初始化事件监听
            initEventListeners();

            // 初始化UI
            initUI();

            // 渲染动漫列表
            await renderAnimeList(1, false);

            // 显示欢迎消息
            const firstVisit = !localStorage.getItem('firstVisit');
            if (firstVisit) {
                showToast('欢迎来到 AniWatch！探索精彩动漫世界', 'info');
                localStorage.setItem('firstVisit', 'true');
            }

        } catch (error) {
            console.error('页面初始化失败:', error);
            showError('页面初始化失败，请刷新页面重试');
        }
    }

    // 启动初始化
    init();
});

// 全局工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 图片懒加载
document.addEventListener('DOMContentLoaded', function () {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
});