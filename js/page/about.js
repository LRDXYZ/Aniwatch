// 关于页面交互逻辑
document.addEventListener('DOMContentLoaded', function () {
    // 初始化背景音乐管理器
    CommonUtils.BackgroundMusicManager.init();
    
    // 更新用户认证状态显示
    CommonUtils.UserAuthManager.updateNavbarAuthStatus();
});