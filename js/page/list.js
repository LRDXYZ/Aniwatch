// 列表页交互逻辑
document.addEventListener('DOMContentLoaded', async function () {
    // 获取DOM元素
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const animeGrid = document.getElementById('anime-grid');
    const pagination = document.getElementById('pagination');
    const globalSearchForm = document.getElementById('global-search-form');
    const globalSearchInput = document.getElementById('global-search-input');

    // 初始化变量
    let currentPage = 1;
    let totalPages = 1;
    let totalItems = 0;
    let currentQuery = '';
    let currentCategory = '';
    let currentStatus = '';
    let currentSort = 'popularity'; // Jikan API 默认按流行度排序

    // 等待API服务加载完成
    function waitForAPI(maxAttempts = 50) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function checkAPI() {
                if (window.JikanAPI) {
                    resolve(window.JikanAPI);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Jikan API服务未初始化'));
                } else {
                    attempts++;
                    setTimeout(checkAPI, 100);
                }
            }

            checkAPI();
        });
    }

    // 初始化页面
    async function init() {
        try {
            // 等待API服务加载完成
            await waitForAPI();

            // 检查API服务是否可用
            if (!window.JikanAPI) {
                throw new Error('Jikan API服务未初始化');
            }

            // 检查URL参数
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const search = urlParams.get('search');

            if (category) {
                categoryFilter.value = category;
                currentCategory = category;
            }

            if (search) {
                searchInput.value = search;
                currentQuery = search;
            }

            // 绑定事件
            bindEvents();

            // 加载初始数据
            await loadAnimeList(1);

        } catch (error) {
            console.error('页面初始化失败:', error);
            showErrorMessage('页面初始化失败，请刷新页面重试');
        }
    }

    // 绑定事件
    function bindEvents() {
        // 搜索表单提交事件
        searchForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await performSearch();
        });

        // 全局搜索表单提交事件
        globalSearchForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const query = globalSearchInput.value.trim();
            if (query) {
                searchInput.value = query;
                currentQuery = query;
                await loadAnimeList(1);
            }
        });

        // 输入框实时搜索（防抖）
        searchInput.addEventListener('input', CommonUtils.debounce(async function () {
            currentQuery = searchInput.value.trim();
            await loadAnimeList(1);
        }, 500));

        // 分类筛选变化事件
        categoryFilter.addEventListener('change', async function () {
            currentCategory = categoryFilter.value;
            await loadAnimeList(1);
        });

        // 状态筛选变化事件
        statusFilter.addEventListener('change', async function () {
            currentStatus = statusFilter.value;
            await loadAnimeList(1);
        });
    }

    // 执行搜索
    async function performSearch() {
        currentQuery = searchInput.value.trim();
        currentCategory = categoryFilter.value;
        currentStatus = statusFilter.value;
        await loadAnimeList(1);
    }

    // 加载动漫列表
    async function loadAnimeList(page = 1) {
        if (!animeGrid) return;

        showLoading();

        try {
            // 构建参数
            const params = {
                page: page,
                limit: 20,  // 每页20个动漫
                order_by: currentSort
            };

            // 添加搜索参数
            if (currentQuery) {
                // Jikan API 使用 q 参数进行搜索
                const response = await JikanAPI.searchAnime(currentQuery, { page, limit: 20 });
                const { data: anime, pagination: paginationInfo } = response;

                // 更新分页信息
                if (paginationInfo) {
                    currentPage = paginationInfo.current_page || page;
                    totalPages = Math.min(paginationInfo.last_visible_page || 1, 100); // 最多显示100页
                    totalItems = paginationInfo.items?.total || 0;
                }

                // 渲染动漫列表
                renderAnimeList(anime);

                // 渲染分页
                renderPagination();
                return;
            }

            // 添加分类参数 (Jikan API 中是 genre)
            if (currentCategory) {
                params.genres = currentCategory;
            }

            // 添加状态参数
            if (currentStatus) {
                params.status = currentStatus;
            }

            // 获取数据
            const response = await JikanAPI.getAnimeList(params);
            const { data: anime, pagination: paginationInfo } = response;

            // 更新分页信息
            if (paginationInfo) {
                currentPage = paginationInfo.current_page || page;
                totalPages = Math.min(paginationInfo.last_visible_page || 1, 100); // 最多显示100页
                totalItems = paginationInfo.items?.total || 0;
            }

            // 渲染动漫列表
            renderAnimeList(anime);

            // 渲染分页
            renderPagination();

        } catch (error) {
            console.error('加载动漫列表失败:', error);
            showErrorMessage(`加载失败: ${error.message || '网络错误'}`);
        }
    }

    // 显示加载状态
    function showLoading() {
        animeGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">加载中...</span>
                </div>
                <p class="mt-2 text-muted">正在加载动漫数据...</p>
            </div>
        `;
    }

    // 显示错误信息
    function showErrorMessage(message) {
        animeGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <p class="mb-2">${message}</p>
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        重新加载
                    </button>
                </div>
            </div>
        `;
    }

    // 渲染动漫列表
    function renderAnimeList(animeList) {
        if (!animeGrid) return;

        // 清空现有内容
        animeGrid.innerHTML = '';

        if (!animeList || animeList.length === 0) {
            animeGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search display-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">未找到相关动漫</h4>
                    <p class="text-muted">请尝试其他搜索条件</p>
                </div>
            `;
            return;
        }

        animeList.forEach(anime => {
            const animeCard = createAnimeCard(anime);
            animeGrid.appendChild(animeCard);
        });
    }

    // 创建动漫卡片
    function createAnimeCard(anime) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';

        // 使用较小的图片以提高加载速度 (Jikan API 图片结构不同)
        const imageUrl = anime.images?.jpg?.image_url ||
            anime.images?.jpg?.large_image_url ||
            'assets/images/poster/default.jpg';

        // Jikan API 评分是10分制
        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const episodes = anime.episodes || '?';
        const type = anime.type || '未知';
        const year = anime.year || anime.aired?.prop?.from?.year || '年份未知';

        // 中文化类型显示
        const typeMap = {
            'TV': 'TV动画',
            'OVA': 'OVA',
            'ONA': 'ONA',
            'Movie': '剧场版',
            'Special': '特别篇',
            'Music': '音乐'
        };
        const displayType = typeMap[type] || type;

        // 中文化状态显示
        const statusMap = {
            'Finished Airing': '已完结',
            'Currently Airing': '连载中',
            'Not yet aired': '未播出'
        };
        const displayStatus = statusMap[anime.status] || anime.status || '未知';

        col.innerHTML = `
            <div class="card h-100 anime-card shadow-sm" data-mal-id="${anime.mal_id}">
                <div class="card-image-container position-relative">
                    <img src="${imageUrl}" 
                         class="card-img-top" 
                         alt="${anime.title}"
                         loading="lazy"
                         onerror="this.src='assets/images/poster/default.jpg'">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-primary">${displayType}</span>
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
                    
                    <div class="anime-meta mb-2">
                        <small class="text-muted">
                            <i class="bi bi-calendar"></i> ${year}
                            <span class="mx-1">•</span>
                            <i class="bi bi-info-circle"></i> ${displayStatus}
                        </small>
                    </div>
                    
                    <p class="card-text anime-description small text-muted line-clamp-2">
                        ${anime.synopsis ? anime.synopsis.substring(0, 80) + '...' : '暂无简介'}
                    </p>
                </div>
                
                <div class="card-footer bg-transparent border-0 pt-0">
                    <div class="d-flex justify-content-between align-items-center">
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

    // 渲染分页
    function renderPagination() {
        if (!pagination) return;

        // 清空现有内容
        pagination.innerHTML = '';

        if (totalPages <= 1) {
            document.getElementById('pagination-container').style.display = 'none';
            return;
        }

        document.getElementById('pagination-container').style.display = 'block';

        // 上一页按钮
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevItem.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        pagination.appendChild(prevItem);

        // 页码按钮 (最多显示10个页码按钮)
        const maxVisiblePages = 10;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            // 总页数小于等于最大显示页数
            startPage = 1;
            endPage = totalPages;
        } else {
            // 总页数大于最大显示页数
            const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
            const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrent) {
                // 当前页接近开始
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                // 当前页接近结束
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                // 当前页在中间
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        // 第一页
        if (startPage > 1) {
            const firstItem = document.createElement('li');
            firstItem.className = `page-item ${1 === currentPage ? 'active' : ''}`;
            firstItem.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
            pagination.appendChild(firstItem);

            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }
        }

        // 中间页码
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(pageItem);
        }

        // 最后一页
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }

            const lastItem = document.createElement('li');
            lastItem.className = `page-item ${totalPages === currentPage ? 'active' : ''}`;
            lastItem.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
            pagination.appendChild(lastItem);
        }

        // 下一页按钮
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextItem.innerHTML = `
            <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        pagination.appendChild(nextItem);

        // 绑定分页点击事件
        pagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', async function (e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                if (page && page !== currentPage) {
                    await loadAnimeList(page);
                }
            });
        });
    }

    // 查看动漫详情
    window.viewAnimeDetail = async function (malId) {
        window.location.href = `detail.html?mal_id=${malId}`;
    };

    // 执行初始化
    init();
});