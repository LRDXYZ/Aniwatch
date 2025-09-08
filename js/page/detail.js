document.addEventListener('DOMContentLoaded', async function() {
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

        renderAnimeDetail(animeDetail);
        renderEpisodes(episodes);
        renderCharacters(animeDetail);
        
    } catch (error) {
        console.error('加载动漫详情失败:', error);
        document.getElementById('anime-detail').innerHTML = `
            <div class="alert alert-danger">
                加载失败: ${error.message}
                <button class="btn btn-primary ms-2" onclick="location.reload()">
                    重试
                </button>
            </div>
        `;
    }
});