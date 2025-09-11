/**
 * 侧边栏切换功能
 */

class SidebarToggle {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButton = document.querySelector('.sidebar-toggle');
        
        if (this.sidebar && this.mainContent && this.toggleButton) {
            this.init();
        }
    }
    
    init() {
        // 检查本地存储中的侧边栏状态
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            this.collapseSidebar();
        }
        
        // 绑定切换按钮事件
        this.toggleButton.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // 绑定窗口大小改变事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 初始化窗口大小处理
        this.handleResize();
    }
    
    toggleSidebar() {
        if (this.sidebar.classList.contains('collapsed')) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
    }
    
    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        this.mainContent.classList.add('collapsed');
        this.toggleButton.classList.add('collapsed');
        
        // 保存状态到本地存储
        localStorage.setItem('sidebarCollapsed', 'true');
    }
    
    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('collapsed');
        this.toggleButton.classList.remove('collapsed');
        
        // 保存状态到本地存储
        localStorage.setItem('sidebarCollapsed', 'false');
    }
    
    handleResize() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            // 在小屏幕上隐藏侧边栏
            this.collapseSidebar();
        } else {
            // 在大屏幕上根据存储的状态显示侧边栏
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                this.collapseSidebar();
            } else {
                this.expandSidebar();
            }
        }
    }
}

// 页面加载完成后初始化侧边栏切换功能
document.addEventListener('DOMContentLoaded', () => {
    new SidebarToggle();
});