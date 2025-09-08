/**
 * 本地存储封装工具函数
 */

// 获取存储数据
function getStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('获取存储数据失败:', error);
        return null;
    }
}

// 设置存储数据
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('设置存储数据失败:', error);
        return false;
    }
}

// 删除存储数据
function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('删除存储数据失败:', error);
        return false;
    }
}

// 清空所有存储
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('清空存储失败:', error);
        return false;
    }
}

/**
 * 表单验证函数
 */

// 验证手机号格式
function validatePhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
}

// 验证邮箱格式
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 验证密码强度（至少6位）
function validatePassword(password) {
    return password.length >= 6;
}

// 验证用户名（2-20位字母数字下划线）
function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]{2,20}$/;
    return regex.test(username);
}

// 表单统一验证
function validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];

        if (rule.required && !value) {
            errors[field] = `${field}不能为空`;
            continue;
        }

        if (value) {
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `${field}长度不能少于${rule.minLength}位`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${field}长度不能超过${rule.maxLength}位`;
            } else if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field}格式不正确`;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * 时间格式化函数
 */

// 格式化时间
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 相对时间显示
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return formatTime(date, 'YYYY-MM-DD');
}

/**
 * 其他工具函数
 */

// 防抖函数
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

// 节流函数
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

// 生成随机ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// 导出所有函数
window.CommonUtils = {
    // 存储相关
    getStorage,
    setStorage,
    removeStorage,
    clearStorage,

    // 验证相关
    validatePhone,
    validateEmail,
    validatePassword,
    validateUsername,
    validateForm,

    // 时间相关
    formatTime,
    formatRelativeTime,

    // 工具函数
    debounce,
    throttle,
    generateId,
    deepClone
};
/**
 * 用户会话管理
 */

// 获取当前用户会话
function getCurrentSession() {
    return CommonUtils.getStorage('currentSession');
}

// 检查用户是否登录
function isUserLoggedIn() {
    const session = getCurrentSession();
    return session && session.isLoggedIn;
}

// 获取当前用户信息
function getCurrentUser() {
    const session = getCurrentSession();
    if (!session) return null;

    const users = CommonUtils.getStorage('users') || [];
    return users.find(user => user.id === session.userId);
}

// 用户登出
function logout() {
    CommonUtils.removeStorage('currentSession');
    // 跳转到登录页
    window.location.href = 'login.html';
}

// 更新用户信息
function updateUserProfile(userId, updates) {
    const users = CommonUtils.getStorage('users') || [];
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        CommonUtils.setStorage('users', users);
        return true;
    }

    return false;
}

// 导出用户管理函数
window.UserManager = {
    getCurrentSession,
    isUserLoggedIn,
    getCurrentUser,
    logout,
    updateUserProfile
};

// 初始化默认用户数据（开发用）
function initializeDefaultUsers() {
    const existingUsers = CommonUtils.getStorage('users');
    if (!existingUsers || existingUsers.length === 0) {
        const defaultUsers = [
            {
                id: 'default-user-1',
                username: 'testuser',
                phone: '13800138000',
                password: '123456', // 演示用简单密码
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 'default-user-2',
                username: 'animefan',
                phone: '13900139000',
                password: '654321',
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];
        CommonUtils.setStorage('users', defaultUsers);
    }
}

// 页面加载时初始化默认用户
document.addEventListener('DOMContentLoaded', function () {
    initializeDefaultUsers();
});




/**
 * 模拟动漫数据
 */
const mockAnimeData = [
    {
        id: 1,
        title: '咒术回战',
        cover: 'assets/images/poster/jujutsu-kaisen.jpg',
        description: '高中生虎杖悠仁为了拯救他人而吞下特级咒物，从此与咒术师们共同战斗的故事。',
        rating: 9.2,
        type: '动作/奇幻',
        episodes: 24,
        status: '已完结',
        tags: ['热血', '战斗', '校园']
    },
    {
        id: 2,
        title: '鬼灭之刃',
        cover: 'assets/images/poster/demon-slayer.jpg',
        description: '少年炭治郎为了将变成鬼的妹妹变回人类而踏上斩鬼之旅的冒险故事。',
        rating: 9.5,
        type: '动作/奇幻',
        episodes: 26,
        status: '已完结',
        tags: ['热血', '战斗', '成长']
    },
    {
        id: 3,
        title: '间谍过家家',
        cover: 'assets/images/poster/spy-x-family.jpg',
        description: '间谍为了任务组建临时家庭，却在这个家庭中找到了真正温暖的温馨故事。',
        rating: 9.3,
        type: '喜剧/动作',
        episodes: 25,
        status: '连载中',
        tags: ['喜剧', '家庭', '动作']
    },
    {
        id: 4,
        title: '进击的巨人',
        cover: 'assets/images/poster/attack-on-titan.jpg',
        description: '人类生活在被巨人包围的高墙之内，少年艾伦立志消灭所有巨人的史诗故事。',
        rating: 9.7,
        type: '动作/剧情',
        episodes: 75,
        status: '已完结',
        tags: ['热血', '剧情', '悬疑']
    },
    {
        id: 5,
        title: '新世纪福音战士',
        cover: 'assets/images/poster/neon-genesis-evangelion.jpg',
        description: '少年驾驶EVA机体，与神秘敌人使徒展开生死战斗，探索人性与自我认知的经典科幻动画。',
        rating: 9.4,
        type: '科幻/心理',
        episodes: 26,
        status: '已完结',
        tags: ['科幻', '心理', '机战']
    },
    {
        id: 6,
        title: '链锯人',
        cover: 'assets/images/poster/chainsaw-man.jpg',
        description: '少年电次与链锯恶魔波奇塔合体，成为链锯人对抗恶魔的黑暗幻想故事。',
        rating: 9.1,
        type: '动作/黑暗幻想',
        episodes: 12,
        status: '已完结',
        tags: ['黑暗', '战斗', '奇幻']
    }
];

// 导出模拟数据
window.mockData = {
    anime: mockAnimeData,
    episodes: [
        { id: 1, animeId: 1, title: '咒术回战 第1集', number: 1 },
        { id: 2, animeId: 1, title: '咒术回战 第2集', number: 2 },
        { id: 3, animeId: 2, title: '鬼灭之刃 第1集', number: 1 },
        { id: 4, animeId: 2, title: '鬼灭之刃 第2集', number: 2 }
    ],
    comments: [
        { id: 1, animeId: 1, user: '动漫爱好者', content: '这部动漫的打斗场面太精彩了！', time: '2025-09-10 14:30:00' },
        { id: 2, animeId: 1, user: '二次元宅', content: '五条悟老师太帅了！', time: '2025-09-10 15:20:00' }
    ]
};