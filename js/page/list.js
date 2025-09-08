// 列表页交互逻辑
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const animeGrid = document.querySelector('.anime-grid');

    let filteredAnime = [...mockData.anime];

    // 搜索表单提交事件
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        filterAnime();
    });

    // 输入框实时搜索（防抖）
    searchInput.addEventListener('input', CommonUtils.debounce(function () {
        filterAnime();
    }, 300));

    // 分类筛选变化事件
    categoryFilter.addEventListener('change', function () {
        filterAnime();
    });

    // 筛选动漫函数
    function filterAnime() {
        const searchText = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        filteredAnime = mockData.anime.filter(anime => {
            // 搜索筛选
            const matchesSearch = anime.title.toLowerCase().includes(searchText) ||
                anime.description.toLowerCase().includes(searchText) ||
                anime.tags.some(tag => tag.toLowerCase().includes(searchText));

            // 分类筛选
            const matchesCategory = !category || anime.type.includes(category);

            return matchesSearch && matchesCategory;
        });

        renderAnimeList();
    }

    // 渲染动漫列表
    function renderAnimeList() {
        if (!animeGrid) return;

        DOMUtils.clearElement(animeGrid);

        if (filteredAnime.length === 0) {
            const noResults = DOMUtils.createElement('div', {
                className: 'no-results',
                textContent: '没有找到匹配的动漫，请尝试其他搜索条件。'
            });
            animeGrid.appendChild(noResults);
            return;
        }

        filteredAnime.forEach(anime => {
            const animeCard = DOMUtils.createElement('div', {
                className: 'anime-card',
                onclick: () => navigateToDetail(anime.id)
            }, [
                DOMUtils.createElement('img', {
                    src: anime.cover,
                    alt: anime.title,
                    onerror: "this.src='assets/images/poster/default.jpg'"
                }),
                DOMUtils.createElement('div', { className: 'anime-card-content' }, [
                    DOMUtils.createElement('h3', { textContent: anime.title }),
                    DOMUtils.createElement('p', { textContent: anime.description.slice(0, 80) + '...' }),
                    DOMUtils.createElement('div', { className: 'anime-meta' }, [
                        DOMUtils.createElement('span', { textContent: anime.type }),
                        DOMUtils.createElement('span', { textContent: `评分: ${anime.rating}` })
                    ]),
                    DOMUtils.createElement('div', { className: 'anime-tags' },
                        anime.tags.map(tag =>
                            DOMUtils.createElement('span', {
                                className: 'tag',
                                textContent: tag
                            })
                        )
                    )
                ])
            ]);

            animeGrid.appendChild(animeCard);
        });
    }

    // 跳转到详情页
    function navigateToDetail(animeId) {
        console.log('跳转到动漫详情:', animeId);
        // window.location.href = `detail.html?id=${animeId}`;
    }

    // 初始化页面
    function init() {
        renderAnimeList();
        console.log('列表页初始化完成');
    }

    // 执行初始化
    init();
});